import { applyPatches, enablePatches } from 'immer';

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

  loadPatches(clientId: string, path: string, changesList: any[]) {
    let clientData = this.clientDataMap.get(clientId);

    if (!clientData) {
      clientData = {
        changeReadyCallbacks: [],
        pathDataMap: new Map(),
      };
      clientData.pathDataMap.set(path, buildDocument(changesList));
      this.clientDataMap.set(clientId, clientData);
    }

    const document = clientData.pathDataMap.get(path);
    if (!document) {
      clientData.pathDataMap.set(path, buildDocument(changesList));
    }
  }

  processChange(clientId: string, path: string, change: any) {
    // setTimeout(() => {
    let pathData = this.clientDataMap.get(clientId);
    if (pathData) {
      pathData.changeReadyCallbacks.forEach(cb => {
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

function buildDocument(changesList: any[]) {
  return applyPatches(
    {},
    changesList.map(c => c.patch)
  );
}
