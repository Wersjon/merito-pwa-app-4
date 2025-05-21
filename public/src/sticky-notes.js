import {
  addStickyNote,
  getAllStickyNotes,
  deleteStickyNote,
  editStickyNote,
} from "./db.js";

// DOM
const form = document.getElementById("note-form");
const textarea = document.getElementById("note-content");
const notesList = document.getElementById("notes-list");

async function renderNotes() {
  const backgroundColors = [
    "#fffbe6",
    "#e6f7ff",
    "#f0e6ff",
    "#ffe6e6",
    "#e6ffe6",
    "#fff0e6",
    "#e6f0ff",
    "#f0ffe6",
    "#ffe6f0",
    "#e6ffe0",
    "#e0ffe6",
    "#e6e0ff",
    "#ffe0e6",
    "#e0e6ff",
    "#ffe0f0",
    "#f0e0ff",
    "#e0f0ff",
    "#f0e6e0",
    "#e6f0e0",
    "#e0ffe0",
    "#e0e6e0",
    "#e6e0e0",
    "#e0e0ff",
  ];

  notesList.innerHTML = "";
  const notes = await getAllStickyNotes();
  if (!notes || notes.length === 0) {
    notesList.innerHTML = "<p>Brak karteczek.</p>";
    return;
  }
  notes
    .sort((a, b) => b.id - a.id)
    .forEach((note) => {
      const randomIndex = note.id % backgroundColors.length;
      const backgroundColor = backgroundColors[randomIndex];

      const noteDiv = document.createElement("div");
      noteDiv.style.backgroundColor = backgroundColor;
      noteDiv.style.setProperty("--sticky-note-color-bg", backgroundColor);
      noteDiv.className = "sticky-note";
      noteDiv.innerHTML = `
        <div class="note-content" data-id="${note.id}">${note.content.replace(
        /\n/g,
        "<br>"
      )}</div>
        <div class="note-actions">
          <button class="edit-btn" data-id="${note.id}" title="Edytuj">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
              <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.439 9.439a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l9.439-9.439zm1.415 2.121L13 2.293 13.707 3l.561-.561a.5.5 0 0 0-.707-.707l-.561.561zm-1.768 1.768L2.5 13.293V14h.707l9.293-9.293-1.293-1.293zm-8.647 9.647l-.646.647a.5.5 0 0 0 .708.708l.647-.646-.709-.709z"/>
            </svg>
          </button>
          <button class="delete-btn" data-id="${note.id}" title="Usuń">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 11.5a.5.5 0 1 1-.707.707L8 9.707l-2.793 2.793a.5.5 0 1 1-.707-.707L7.293 9l-2.793-2.793a.5.5 0 1 1 .707-.707L8 8.293l2.793-2.793a.5.5 0 1 1 .707.707L8.707 9l2.793 2.793z"/>
            </svg>
          </button>
        </div>
      `;
      notesList.appendChild(noteDiv);
    });

  // Obsługa usuwania
  notesList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number(btn.dataset.id);
      await deleteStickyNote(id);
      renderNotes();
    });
  });

  // Obsługa edycji
  notesList.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(btn.dataset.id);
      const noteDiv = btn.closest(".sticky-note");
      const actionsDiv = noteDiv.querySelector(".note-actions");
      actionsDiv.style.display = "none";
      const contentDiv = noteDiv.querySelector(".note-content");
      const oldContent = contentDiv.innerText.replace(/<br>/g, "\n");

      // Zamień na textarea i przyciski zapisz/anuluj
      contentDiv.innerHTML = `
        <textarea class="edit-area" style="width:100%;min-height:60px;">${oldContent}</textarea>
        <div style="margin-top:0.5rem;">
          <button class="save-edit-btn" data-id="${id}">Zapisz</button>
          <button class="cancel-edit-btn" data-id="${id}">Anuluj</button>
        </div>
      `;

      // Obsługa zapisu edycji
      contentDiv
        .querySelector(".save-edit-btn")
        .addEventListener("click", async () => {
          const newContent = contentDiv
            .querySelector(".edit-area")
            .value.trim();
          if (newContent) {
            await editStickyNote(id, newContent);
            renderNotes();
          }
        });

      // Obsługa anulowania edycji
      contentDiv
        .querySelector(".cancel-edit-btn")
        .addEventListener("click", () => {
          renderNotes();
        });
    });
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = textarea.value.trim();
  if (!content) return;
  await addStickyNote({
    id: Date.now(),
    name: "note",
    content,
  });
  textarea.value = "";
  renderNotes();
});

renderNotes();
