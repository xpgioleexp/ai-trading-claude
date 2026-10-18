// Shared storage for the two of you.
// On claude.ai the page gets a shared database, who is viewing, and a live
// room for presence. Anywhere else (a local copy, tests) the same calls run
// against device storage, so every feature still works for one person.

const LOCAL_KEY = 'little-us-local-db';

// ---------- device-only stand-in with the same shape as the shared db ----------

function makeLocalDb() {
  let docs = {};
  try { docs = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch { docs = {}; }
  const listeners = new Set();
  const persist = () => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(docs)); } catch { /* storage blocked */ } };
  const snap = (path) => {
    const id = path.split('/').pop();
    const body = docs[path];
    return { id, exists: body !== undefined, data: () => (body === undefined ? undefined : structuredClone(body)), metadata: { fromCache: false, hasPendingWrites: false } };
  };
  const inCollection = (col, path) => path.startsWith(col + '/') && !path.slice(col.length + 1).includes('/');
  const notify = () => listeners.forEach(fn => fn());
  const merge = (a, b) => {
    const out = { ...a };
    for (const [k, v] of Object.entries(b)) {
      out[k] = v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) ? merge(a[k], v) : v;
    }
    return out;
  };
  const docRef = (path) => ({
    id: path.split('/').pop(),
    path,
    async get() { return snap(path); },
    async set(data) { docs[path] = structuredClone(data); persist(); queueMicrotask(notify); },
    async update(data) {
      if (docs[path] === undefined) throw { code: 'invalid_argument', message: 'Document does not exist' };
      docs[path] = merge(docs[path], structuredClone(data)); persist(); queueMicrotask(notify);
    },
    async delete() { delete docs[path]; persist(); queueMicrotask(notify); },
    onSnapshot(next) {
      let last;
      const fire = () => { const s = snap(path); const key = JSON.stringify(docs[path]); if (key !== last) { last = key; next(s); } };
      listeners.add(fire);
      queueMicrotask(fire);
      return () => listeners.delete(fire);
    },
    collection(sub) { return colRef(path + '/' + sub); },
  });
  const colRef = (col) => ({
    path: col,
    doc(id) { return docRef(col + '/' + (id || Math.random().toString(36).slice(2, 12))); },
    async add(data) { const ref = this.doc(); await ref.set(data); return ref; },
    async get() { return querySnap(col); },
    onSnapshot(next) {
      let last;
      const fire = () => {
        const q = querySnap(col);
        const key = JSON.stringify(q.docs.map(d => [d.id, docs[col + '/' + d.id]]));
        if (key !== last) { last = key; next(q); }
      };
      listeners.add(fire);
      queueMicrotask(fire);
      return () => listeners.delete(fire);
    },
  });
  const querySnap = (col) => {
    const list = Object.keys(docs).filter(p => inCollection(col, p)).sort().map(snap);
    return { docs: list, size: list.length, empty: !list.length, docChanges: () => [], metadata: { fromCache: false, hasPendingWrites: false } };
  };
  return { doc: docRef, collection: colRef };
}

// ---------- connecting ----------

export const cloud = {
  mode: 'local', // 'cloud' once the shared db answers
  db: makeLocalDb(),
  user: null,
  room: null,
  me: 'me',
  canUpload: false,
  downloads: null,
  assets: null,
};

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(null), ms))]);
}

// Resolves once we know whether the shared database is available.
export async function connect() {
  const claude = window.claude;
  if (!claude?.use) return cloud;
  const [db, user] = await Promise.all([withTimeout(claude.use('db'), 8000), withTimeout(claude.use('user'), 8000)]);
  const id = user ? await user.id() : null;
  if (db && id) {
    cloud.mode = 'cloud';
    cloud.db = db;
    cloud.user = user;
    cloud.me = id;
  } else if (user) {
    cloud.user = user;
  }
  // These light up later and are optional.
  withTimeout(claude.use('room'), 8000).then(room => { cloud.room = room; cloud.onRoom?.(room); });
  withTimeout(claude.use('downloads'), 8000).then(d => { cloud.downloads = d; });
  withTimeout(claude.use('assets'), 8000).then(a => { cloud.assets = a; cloud.canUpload = !!a; });
  return cloud;
}

// ---------- helpers used across features ----------

export function now() {
  return Date.now();
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Names come from the platform each time we draw them; we only ever store ids.
export async function namesFor(ids) {
  const out = {};
  const unique = [...new Set(ids.filter(Boolean))];
  if (cloud.user && cloud.mode === 'cloud') {
    try {
      const ps = await cloud.user.profiles(unique);
      for (const id of unique) out[id] = ps[id]?.name || (id === cloud.me ? 'You' : 'Your partner');
      return out;
    } catch { /* fall through */ }
  }
  for (const id of unique) out[id] = id === cloud.me ? 'You' : 'Your partner';
  return out;
}

// Writes to one document go one at a time.
const chains = new Map();
export function writeDoc(path, fn) {
  const prev = chains.get(path) || Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  chains.set(path, next);
  return next.catch(err => {
    console.warn('Could not save', path, err?.code || err);
    throw err;
  });
}

export function setDoc(path, data) {
  return writeDoc(path, () => cloud.db.doc(path).set(data));
}

export function updateDoc(path, data) {
  return writeDoc(path, () => cloud.db.doc(path).update(data));
}

export function deleteDoc(path) {
  return writeDoc(path, () => cloud.db.doc(path).delete());
}

// Keeps a live copy of a collection: { id: data }.
export function watchCollection(path, onChange) {
  const live = {};
  return cloud.db.collection(path).onSnapshot(snap => {
    for (const k of Object.keys(live)) delete live[k];
    for (const d of snap.docs) if (d.exists) live[d.id] = d.data();
    onChange(live);
  }, err => console.warn('Lost live updates for', path, err?.code));
}

export function watchDoc(path, onChange) {
  return cloud.db.doc(path).onSnapshot(snap => onChange(snap.exists ? snap.data() : null),
    err => console.warn('Lost live updates for', path, err?.code));
}

export function privatePath(name) {
  return `data/users/${cloud.me}/${name}`;
}
