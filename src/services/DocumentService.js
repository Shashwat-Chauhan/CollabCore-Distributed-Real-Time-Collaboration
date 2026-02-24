import { v4 as uuidv4 } from 'uuid';
import repository from '../repositories/DocumentRepository.js';
import automergeManager from '../utils/AutomergeManager.js';

class DocumentService{

    constructor(){
        this.cache = new Map();
    }

    async createDocument(title){
        const id = uuidv4();

        const doc = automergeManager.initialize(title);
        const buffer = automergeManager.save(doc);

        const saved = await repository.create({id , title , buffer});

        this.cache.set(id , {doc , version : 1});

        return saved
    }

    async loadDocument(id){
        if (this.cache.has(id)) return this.cache.get(id);

        const row = await repository.findById(id);
        if(!row) throw new Error('Document not found');

        const doc = automergeManager.load(row.doc);
        
        const entry = {doc , version: row.version};
        this.cache.set(id , entry);

        return entry;
    }


    async applyChanges(id , changesBuffer){
        const entry = await this.loadDocument(id);

        entry.doc = automergeManager.applyChanges(entry.doc , changesBuffer);
        const incrementBy = Array.isArray(changesBuffer) ? changesBuffer.length : 1;
        entry.version += incrementBy;

        const buffer = automergeManager.save(entry.doc);
        await repository.update(id , buffer , entry.version);

        return entry;
    }

    serializeSnapshot(doc) {
        return automergeManager.save(doc).toString('base64');
    }    
}

export default new DocumentService();
