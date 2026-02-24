import service from '../services/DocumentService.js';

class DocumentController {

  async create(req, res) {
    try {
      const title = req.body.title || 'Untitled Document';

      const doc = await service.createDocument(title);

      res.status(201).json(doc);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const { id } = req.params;

      const entry = await service.loadDocument(id);

      res.json({
        id,
        version: entry.version,
        snapshotBase64: service.serializeSnapshot(entry.doc)
      });

    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
}

export default new DocumentController();