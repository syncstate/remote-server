import { applyPatches, enablePatches, Patch, produceWithPatches } from 'immer';

enablePatches();

export type ChangeReadyCallback = (path: string, change: any) => void;

export default class SyncStateRemote {
  clientDataMap = new Map<
    string,
    {
      pathDataMap: Map<string, any>;
      changeReadyCallbacks: Array<ChangeReadyCallback>;
    }
  >();

  getInitialPatches(clientId: string, path: string, changesList: any[]) {
    let clientData = this.clientDataMap.get(clientId);

    if (!clientData) {
      clientData = {
        changeReadyCallbacks: [],
        pathDataMap: new Map(),
      };
      // clientData.pathDataMap.set(path, buildDocument(changesList));
      this.clientDataMap.set(clientId, clientData);
    }

    let initialPatches = clientData.pathDataMap.get(path);
    if (!initialPatches) {
      initialPatches = getCompressedPatches(changesList);
      clientData.pathDataMap.set(path, initialPatches);
    }
    return initialPatches;
    // }
  }

  processChange(clientId: string, path: string, change: any) {
    // setTimeout(() => {
    let clientData = this.clientDataMap.get(clientId);
    if (clientData) {
      const documentAtPath = clientData.pathDataMap.get(path);

      if (documentAtPath) {
        clientData.pathDataMap.set(path, applyPatches(documentAtPath, change));
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
        pathDataMap: new Map(),
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

function getCompressedPatches(changesList: any[]) {
  const initialState = {};
  const [, patches, inversePatches] = produceWithPatches(
    initialState,
    draft => {
      applyPatches(
        draft,
        changesList.map(c => c.patch)
      );
    }
  );

  const changes: Array<{ patch: Patch; inversePatch: Patch }> = [];

  patches.forEach((patch: any, index: number) => {
    changes.push({
      patch,
      inversePatch: inversePatches[index],
    });
  });

  return changes;

  // applyPatches(
  //   {},
  //   changesList.map(c => c.patch)
  // );
}
