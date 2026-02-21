import * as Automerge from '@automerge/automerge';

class AutomergeManager {

  initialize(title) {
    let doc = Automerge.init();

    return Automerge.change(doc, d => {
      d.title = title;
      d.content = "";
    });
  }

  load(buffer) {
    return Automerge.load(buffer);
  }

  save(doc) {
    return Buffer.from(Automerge.save(doc));
  }

  applyChanges(doc, changesBuffer) {
    const changes = [new Uint8Array(changesBuffer)];
    const [updatedDoc] = Automerge.applyChanges(doc, changes);
    return updatedDoc;
  }
}

export default new AutomergeManager();