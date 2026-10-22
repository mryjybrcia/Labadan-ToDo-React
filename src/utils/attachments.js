/**
 * Attachment storage.
 *
 * Comment files live in IndexedDB rather than localStorage: localStorage
 * holds roughly 5MB for the whole origin and base64 inflates a file by about
 * a third, so a single photo would evict the saved boards. IndexedDB stores
 * real Blobs and is measured in hundreds of megabytes.
 *
 * Redux keeps only metadata (id, name, type, size); the bytes are read back
 * on demand by id.
 *
 * Everything here is best-effort. IndexedDB is unavailable in some private
 * windows and embedded webviews; callers get a rejected promise and the app
 * keeps working without the file.
 */

const DB_NAME = "project-task-files";
const STORE = "files";
const VERSION = 1;

/** Refuse anything large enough to be a problem, with a clear message. */
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("File storage isn't available in this browser."));
      return;
    }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error("Couldn't open file storage."));
  });

  return dbPromise;
}

function tx(mode, run) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const store = transaction.objectStore(STORE);
        let result;
        try {
          result = run(store);
        } catch (err) {
          reject(err);
          return;
        }
        transaction.oncomplete = () =>
          resolve(result && result.result !== undefined ? result.result : result);
        transaction.onerror = () =>
          reject(transaction.error || new Error("File storage failed."));
        transaction.onabort = () =>
          reject(transaction.error || new Error("File storage was aborted."));
      })
  );
}

export async function putFile(id, file) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `"${file.name}" is ${formatBytes(file.size)}. Files are kept in this browser, so the limit is ${formatBytes(MAX_FILE_BYTES)}.`
    );
  }
  await tx("readwrite", (store) =>
    store.put({ id, blob: file, name: file.name, type: file.type })
  );
  return id;
}

export async function getFileURL(id) {
  const record = await tx("readonly", (store) => store.get(id));
  if (!record || !record.blob) return null;
  return URL.createObjectURL(record.blob);
}

export async function deleteFiles(ids = []) {
  if (!ids.length) return;
  try {
    await tx("readwrite", (store) => ids.forEach((id) => store.delete(id)));
  } catch {
    // An orphaned blob is harmless; never block a delete on cleanup.
  }
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const isImage = (type) => typeof type === "string" && type.startsWith("image/");
