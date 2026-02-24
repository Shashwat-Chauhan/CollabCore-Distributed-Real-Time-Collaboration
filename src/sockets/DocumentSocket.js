import service from '../services/DocumentService.js';

class DocumentSocket {

  register(io, socket) {

    socket.on('join', async ({ docId }) => {
      try {
        socket.join(docId);

        const entry = await service.loadDocument(docId);

        socket.emit('document', {
          snapshotBase64: service.serializeSnapshot(entry.doc),
          version: entry.version
        });

      } catch (err) {
        socket.emit('error', err.message);
      }
    });

    socket.on('changes', async ({ docId, changesBase64 }) => {
      try {
        const changesBuffer = Buffer.from(changesBase64, 'base64');

        const updated = await service.applyChanges(docId, changesBuffer);

        socket.to(docId).emit('remoteChanges', {
          changesBase64,
          version: updated.version
        });

      } catch (err) {
        socket.emit('error', err.message);
      }
    });
  }
}

export default DocumentSocket;