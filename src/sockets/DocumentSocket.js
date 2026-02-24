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
        const base64List = Array.isArray(changesBase64) ? changesBase64 : [changesBase64];
        const changesBuffers = base64List.map(b64 => Buffer.from(b64, 'base64'));

        const updated = await service.applyChanges(docId, changesBuffers);

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