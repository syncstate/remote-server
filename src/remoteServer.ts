import { applyPatches, enablePatches, produceWithPatches } from 'immer';
import {
  immerPathToJsonPatchPath,
  jsonPatchPathToImmerPath,
} from '@syncstate/core';
import set from 'lodash.set';

enablePatches();

export type ChangeReadyCallback = (path: string, change: any) => void;

export default class SyncStateRemote {
  clientDataMap = new Map<
    string,
    {
      // pathDataMap: Map<string, any>;
      changeReadyCallbacks: Array<ChangeReadyCallback>;
    }
  >();
  documentsAtPath = new Map<string, any>();

  getInitialChanges(clientId: string, path: string, changesList: any[]) {
    let clientData = this.clientDataMap.get(clientId);

    if (!clientData) {
      clientData = {
        changeReadyCallbacks: [],
        // pathDataMap: new Map(),
      };
      // clientData.pathDataMap.set(path, buildDocument(changesList));
      this.clientDataMap.set(clientId, clientData);
    }

    // let initialChanges = this.documentsAtPath.get(path);
    // if (!initialChanges) {
    // let documentAtPath;
    const { initialChanges, documentAtPath } = getCompressedPatches(
      changesList,
      path
    );
    this.documentsAtPath.set(path, documentAtPath);
    // }
    return initialChanges;
    // }
  }

  processChange(
    clientId: string,
    path: string,
    change: { patch: any; inversePatch: any }
  ) {
    // setTimeout(() => {
    let clientData = this.clientDataMap.get(clientId);
    if (clientData) {
      const documentAtPath = this.documentsAtPath.get(path);

      // console.log(documentAtPath, 'documentAtPath');
      if (documentAtPath) {
        this.documentsAtPath.set(
          path,
          applyPatches(documentAtPath, [
            {
              ...change.patch,
              path: jsonPatchPathToImmerPath(change.patch.path),
            },
          ])
        );
      }

      clientData.changeReadyCallbacks.forEach(cb => {
        cb(path, change);
      });
    }

    // }, 1000);
  }

  onChangeReady(clientId: string, cb: ChangeReadyCallback) {
    let clientData = this.clientDataMap.get(clientId);

    if (!clientData) {
      clientData = {
        changeReadyCallbacks: [],
        // pathDataMap: new Map(),
      };
      this.clientDataMap.set(clientId, clientData);
    }
    const newLength = clientData.changeReadyCallbacks.push(cb);

    return () => {
      if (clientData) {
        clientData.changeReadyCallbacks.splice(newLength - 1, 1);
      }
    };
  }
}

function getCompressedPatches(changesList: any[], path: string) {
  let initialState = {};
  const immerPath = jsonPatchPathToImmerPath(path);
  // const [
  //   initialState,
  //   pathCreationPatches,
  //   pathCreationInversePatches,
  // ] = produceWithPatches(emptyState, draft => {
  set(initialState, immerPath, {});
  // });
  // console.log(immerPath, initialState, 'immerPath');

  const [documentAtPath, patches, inversePatches] = produceWithPatches(
    initialState,
    draft => {
      // console.log(changesList, 'changesList 123');
      const patches = changesList.map(c => {
        // console.log(c.patch.path, 'c.patch.path');
        // console.log(
        //   jsonPatchPathToImmerPath(c.patch.path),
        //   'jsonPatchPathToImmerPath(c.patch.path)'
        // );
        return {
          ...c.patch,
          path: jsonPatchPathToImmerPath(c.patch.path),
        };
      });
      // console.log(patches, 'patches 123');
      applyPatches(draft, patches);
    }
  );

  const changes: Array<{ patch: any; inversePatch: any }> = [];

  patches.forEach((patch: any, index: number) => {
    changes.push({
      patch: { ...patch, path: immerPathToJsonPatchPath(patch.path) },
      inversePatch: {
        ...inversePatches[index],
        path: immerPathToJsonPatchPath(inversePatches[index].path),
      },
    });
  });

  return {
    documentAtPath: documentAtPath,
    initialChanges: changes,
  };

  // [
  //   { patch: initialPatches, inversePatch: initialInversePatches },
  //   ...changes,
  // ];

  // applyPatches(
  //   {},
  //   changesList.map(c => c.patch)
  // );
}
