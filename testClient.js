import { io } from "socket.io-client";
import * as Automerge from "@automerge/automerge";

/* CONFIG */
const SERVER_URL = "http://localhost:4000";
const DOC_ID = "a801ee89-aa71-4748-953c-bf833ef2abe9";

/* CONNECT */
const socket = io(SERVER_URL);

let currentVersion = null;
let doc = null;

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("join", { docId: DOC_ID });
});

/* RECEIVE DOCUMENT SNAPSHOT */
socket.on("document", (data) => {
  console.log("\n📄 Document Snapshot Received:");
  console.log("Version:", data.version);

  currentVersion = data.version;

  console.log("Snapshot Size:", data.snapshotBase64.length);

  const snapshotBytes = Buffer.from(data.snapshotBase64, "base64");
  doc = Automerge.load(snapshotBytes);

  /* Simulate edit after joining */
  simulateEdit();
});

/* RECEIVE REMOTE CHANGES */
socket.on("remoteChanges", (data) => {
  console.log("\n🔄 Remote Changes Received:");
  console.log("New Version:", data.version);

  currentVersion = data.version;

  if (!doc) return;
  const base64List = Array.isArray(data.changesBase64) ? data.changesBase64 : [data.changesBase64];
  const changes = base64List.map((b64) => new Uint8Array(Buffer.from(b64, "base64")));
  const [updated] = Automerge.applyChanges(doc, changes);
  doc = updated;
});

/* ERROR HANDLING */
socket.on("error", (err) => {
  console.log("❌ Error:", err);
});

/* SIMULATE EDIT */
function simulateEdit() {
  console.log("\n✏ Simulating document edit...");

  if (!doc) {
    console.log("❌ No snapshot loaded yet; cannot edit.");
    return;
  }

  const before = doc;
  const newText = `edit-${Date.now()}`;

  doc = Automerge.change(doc, (d) => {
    d.content = (d.content || "") + newText;
  });

  const changes = Automerge.getChanges(before, doc);
  const changesBase64 = changes.map((c) => Buffer.from(c).toString("base64"));

  socket.emit("changes", {
    docId: DOC_ID,
    changesBase64
  });

  console.log("✅ Change sent to server");
}