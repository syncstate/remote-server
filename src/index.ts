String.prototype.replaceAll = function(target: any, replacement: any) {
  return this.split(target).join(replacement);
};

export {
  default as SyncStateRemote,
  ChangeReadyCallback,
} from './remoteServer';
