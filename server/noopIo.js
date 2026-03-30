export function createNoopIo() {
  return {
    sockets: {
      sockets: new Map(),
    },
  };
}
