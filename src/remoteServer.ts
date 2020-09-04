export type ChangeReadyCallback = (path: string, change: any) => void;

export default class SyncStateRemote {
  changeReadyMap = new Map<string, Array<ChangeReadyCallback>>();

  processChange(clientId: string, path: string, change: any) {
    setTimeout(() => {
      let changeReadyCallbacks = this.changeReadyMap.get(clientId);
      if (changeReadyCallbacks) {
        changeReadyCallbacks.forEach(cb => {
          cb(path, change);
        });
      }
    }, 1000);
  }

  onChangeReady(clientId: string, cb: ChangeReadyCallback) {
    let changeReadyCallbacks = this.changeReadyMap.get(clientId);

    if (!changeReadyCallbacks) {
      changeReadyCallbacks = [];
      this.changeReadyMap.set(clientId, changeReadyCallbacks);
    }
    const newLength = changeReadyCallbacks.push(cb);

    return () => {
      if (changeReadyCallbacks) {
        changeReadyCallbacks.splice(newLength - 1, 1);
      }
    };
  }
}
