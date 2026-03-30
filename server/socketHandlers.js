function respond(callback, payload) {
  if (typeof callback === 'function') {
    callback(payload);
  }
}

export function registerSocketHandlers(io, orchestrator) {
  io.on('connection', (socket) => {
    socket.on('room:watch', async (payload, callback) => {
      try {
        const state = await orchestrator.watchRoom(socket, payload ?? {});
        respond(callback, { ok: true, state });
      } catch (error) {
        respond(callback, { ok: false, error: error.message });
      }
    });

    socket.on('answer:submit', async (payload, callback) => {
      try {
        const result = await orchestrator.submitAnswer(payload ?? {});
        respond(callback, { ok: true, result });
      } catch (error) {
        respond(callback, { ok: false, error: error.message });
      }
    });

    socket.on('disconnect', async () => {
      try {
        await orchestrator.handleDisconnect(socket.id);
      } catch (error) {
        console.error(`[socket:disconnect:${socket.id}]`, error);
      }
    });
  });
}
