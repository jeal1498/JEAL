// Almacenamiento local (IndexedDB). Todo vive en el dispositivo.
const DB_NAME = 'secondbrain';
const VERSION = 4;
export const STORES = ['fuel', 'maintenance', 'expenses', 'reminders', 'income', 'bills', 'goals', 'budgets', 'spending'];

let dbp;
function open() {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const s of STORES) {
          if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbp;
}

async function tx(stores, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(stores, mode);
    const req = fn(t);
    t.oncomplete = () => resolve(req && 'result' in req ? req.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const all = (store) => tx(store, 'readonly', (t) => t.objectStore(store).getAll());
export const put = (store, obj) => tx(store, 'readwrite', (t) => t.objectStore(store).put(obj));
export const remove = (store, id) => tx(store, 'readwrite', (t) => t.objectStore(store).delete(id));
export const getSetting = (key) => tx('settings', 'readonly', (t) => t.objectStore('settings').get(key));
export const setSetting = (key, val) => tx('settings', 'readwrite', (t) => t.objectStore('settings').put(val, key));

export async function exportAll() {
  const data = { app: 'secondbrain', version: VERSION, exportedAt: new Date().toISOString() };
  for (const s of STORES) data[s] = await all(s);
  data.vehicle = (await getSetting('vehicle')) || {};
  data.finance = (await getSetting('finance')) || {};
  return data;
}

export async function importAll(data) {
  if (!data || data.app !== 'secondbrain') throw new Error('Archivo no válido');
  await tx([...STORES, 'settings'], 'readwrite', (t) => {
    for (const s of STORES) {
      const os = t.objectStore(s);
      os.clear();
      for (const item of data[s] || []) os.put(item);
    }
    t.objectStore('settings').put(data.vehicle || {}, 'vehicle');
    t.objectStore('settings').put(data.finance || {}, 'finance');
  });
}

// Agrega los registros de un archivo sin borrar nada (salvo los ids que indique `delete`,
// o todo lo de los stores que indique `replace`, p. ej. para volver a cargar las finanzas).
export async function mergeData(data) {
  if (!data || data.app !== 'secondbrain') throw new Error('Archivo no válido');
  let n = 0;
  await tx(STORES, 'readwrite', (t) => {
    for (const s of STORES) {
      if ((data.replace || []).includes(s)) t.objectStore(s).clear();
      for (const id of data.delete?.[s] || []) t.objectStore(s).delete(id);
      for (const item of data[s] || []) { t.objectStore(s).put(item); n++; }
    }
  });
  return n;
}

export async function clearAll() {
  await tx([...STORES, 'settings'], 'readwrite', (t) => {
    for (const s of [...STORES, 'settings']) t.objectStore(s).clear();
  });
}
