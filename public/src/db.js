function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pwa_4_DB", 2);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Sticky notesy
      if (!db.objectStoreNames.contains("sticky_notes")) {
        const notesStore = db.createObjectStore("sticky_notes", {
          keyPath: "id",
        });
        notesStore.createIndex("name", "name", { unique: false });
      }
      // Weather brrrrrrrrr
      if (!db.objectStoreNames.contains("weather")) {
        db.createObjectStore("weather", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };
  });
}

// Sticky Notesy
function addStickyNote(note) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sticky_notes"], "readwrite");
      const store = transaction.objectStore("sticky_notes");
      const request = store.add(note);

      request.onsuccess = () => resolve("Note added successfully");
      request.onerror = (event) =>
        reject("Error adding note: " + event.target.errorCode);
    });
  });
}

function getAllStickyNotes() {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sticky_notes"], "readonly");
      const store = transaction.objectStore("sticky_notes");
      const notes = [];
      store.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          notes.push(cursor.value);
          cursor.continue();
        } else {
          resolve(notes);
        }
      };
      transaction.onerror = () => reject("Error reading notes");
    });
  });
}

function deleteStickyNote(id) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sticky_notes"], "readwrite");
      const store = transaction.objectStore("sticky_notes");
      const request = store.delete(id);

      request.onsuccess = () => resolve("Note deleted successfully");
      request.onerror = (event) =>
        reject("Error deleting note: " + event.target.errorCode);
    });
  });
}

function editStickyNote(id, newContent) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sticky_notes"], "readwrite");
      const store = transaction.objectStore("sticky_notes");
      const getRequest = store.get(id);

      getRequest.onsuccess = (event) => {
        const note = event.target.result;
        if (!note) {
          reject("Note not found");
          return;
        }
        note.content = newContent;
        const updateRequest = store.put(note);
        updateRequest.onsuccess = () => resolve("Note updated successfully");
        updateRequest.onerror = (event) =>
          reject("Error updating note: " + event.target.errorCode);
      };

      getRequest.onerror = (event) =>
        reject("Error retrieving note: " + event.target.errorCode);
    });
  });
}

// Weather brrrrrrr
function getWeather(id) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["weather"], "readonly");
      const store = transaction.objectStore("weather");
      const request = store.get(id);

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) =>
        reject("Error retrieving weather: " + event.target.errorCode);
    });
  });
}

async function getWeatherWithRefresh(id) {
  const cached = await getWeather(id);
  const now = Date.now();
  const DAY_MS = 86400000;

  if (cached && cached.timestamp && now - cached.timestamp < DAY_MS) {
    return cached.data;
  }
  // Próba pobrania z sieci pogody, LGTM, OTOH not much testing
  try {
    // Publiczne API do pogody, mam nadzieje, że będzie działać przez następny miesiąc
    const res = await fetch(
      `https://goweather.xyz/weather/${encodeURIComponent(id)}`
    );
    if (!res.ok) throw new Error("Błąd pobierania danych pogodowych");
    const data = await res.json();
    await saveWeather({
      id,
      data,
      timestamp: now,
    });
    return data;
  } catch (e) {
    // Ewentualnie próba z cache'u o ile jest
    if (cached && cached.data) return cached.data;
    throw e;
  }
}

export {
  openDatabase,
  // Sticky notesy
  addStickyNote,
  getAllStickyNotes,
  deleteStickyNote,
  editStickyNote,
  // Pogoda zapisana do indexDB - myślac o tym teraz - to w sumie niepotrzebnie duplikuje
  // serwice workera, no ale nie do końca mam czas na przepisanie tego - działa
  getWeather,
  getWeatherWithRefresh,
};
