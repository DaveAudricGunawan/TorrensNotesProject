// Initialization

// Loads previously saved notes. If no notes exist, start with an empty array.

let notes = JSON.parse(localStorage.getItem("Notes")) || [];

let currentView = "notes";


// Get important HTML elements.

const addButton = document.getElementById("add-note");
const notesContainer = document.getElementById("notes-container");

const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");

const colorInput = document.getElementById("note-color");
const searchInput = document.getElementById("search-input");
const sortInput = document.getElementById("sort-notes");

const notification = document.getElementById("notification");

const pageTitle = document.getElementById("page-title");


// Note editing elements

const editModal = document.getElementById("edit-modal");

const editTitle = document.getElementById("edit-title");

const editContent = document.getElementById("edit-content");

const editColor = document.getElementById("edit-color");

const saveEditButton = document.getElementById("save-edit");

const cancelEditButton = document.getElementById("cancel-edit");


// Edited note ID storage

let editingNoteId = null;


// Save notes to LocalStorage.

function saveNotes() {

    localStorage.setItem("Notes", JSON.stringify(notes));

}


// Display a notification.

let notificationTimer;

function showNotification(message) {

    notification.textContent = message;
    notification.style.display = "block";

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(function() {
        notification.style.display = "none";
    }, 2500);

}


// Note Creation

function addNote() {

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    const color = colorInput.value;

    // Check whether both fields are empty.

    if (title === "" && content === "") {

        showNotification("Please enter a title or note.");
        return;

    }

    // Create a new note.

    const newNote = {

        id: Date.now() + Math.random(),

        title: title,
        content: content,

        color: color,

        pinned: false,
        archived: false,

        createdAt: Date.now()

    };

    // Add the new note to the array.

    notes.push(newNote);

    // Save the updated array.

    saveNotes();

    // Clear the input fields.

    titleInput.value = "";
    contentInput.value = "";

    colorInput.value = "white";

    // Refresh the website.

    renderNotes();

    showNotification("Note saved successfully.");

}


// Detect when the Add Note button is clicked.

addButton.addEventListener("click", addNote);


// Note Display

function renderNotes() {

    // Clear the existing displayed notes.

    notesContainer.replaceChildren();

    // Get the search keyword.

    const searchTerm = searchInput.value.toLowerCase().trim();

    // Filter notes according to the selected view.

    let displayedNotes = notes.filter(function(note) {

        if (currentView === "pinned") {
            return note.pinned && !note.archived;
        }

        if (currentView === "archive") {
            return note.archived;
        }

        return !note.archived;

    });


    // Search through note titles and content.

    displayedNotes = displayedNotes.filter(function(note) {

        return note.title.toLowerCase().includes(searchTerm) ||
               note.content.toLowerCase().includes(searchTerm);

    });


    // Sort notes according to the selected option.

    const sortType = sortInput.value;

    if (sortType === "newest") {

        displayedNotes.sort(function(a, b) {
            return b.createdAt - a.createdAt;
        });

    }

    else if (sortType === "oldest") {

        displayedNotes.sort(function(a, b) {
            return a.createdAt - b.createdAt;
        });

    }

    else if (sortType === "alphabetical") {

        displayedNotes.sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });

    }


    // Display a message if there are no notes.

    if (displayedNotes.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "You have no notes.";

        notesContainer.appendChild(emptyMessage);

        return;

    }


    // Create a card for every note.

    displayedNotes.forEach(function(note) {

        const card = document.createElement("div");

        card.className = "note-card " + note.color;


        // Create the note title.

        const title = document.createElement("h3");

        title.textContent = note.title || "Untitled Note";

        // Show a pin indicator for important notes.

    if (note.pinned) {

        const pinIndicator = document.createElement("span");

        pinIndicator.textContent = " Pinned";

        pinIndicator.style.fontSize = "12px";

        pinIndicator.style.color = "#765b00";

        title.appendChild(pinIndicator);

}


        // Create the note content.

        const content = document.createElement("p");

        content.textContent = note.content;


        // Create note action buttons.

        const editButton = createButton("Edit", "edit", note.id);

        const deleteButton = createButton("Delete", "delete", note.id);

        const pinButton = createButton(
            note.pinned ? "Unpin" : "Pin",
            "pin",
            note.id
        );

        const archiveButton = createButton(
            note.archived ? "Restore" : "Archive",
            "archive",
            note.id
        );


        // Add everything to the note card.

        card.append(
            title,
            content,
            editButton,
            deleteButton,
            pinButton,
            archiveButton
        );

        notesContainer.appendChild(card);

    });

}


// Helper function for creating buttons.

function createButton(text, action, noteId) {

    const button = document.createElement("button");

    button.textContent = text;

    button.dataset.action = action;
    button.dataset.id = noteId;

    return button;

}


// Edit, Delete, Pins, and Archives

// Listen for clicks inside the notes container.

notesContainer.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button || !notesContainer.contains(button)) {
        return;
    }

    const action = button.dataset.action;

    const noteId = Number(button.dataset.id);

    const note = notes.find(function(item) {
        return item.id === noteId;
    });

    if (!note) {
        return;
    }


    // Edit
    
    if (action === "edit") {

        // Remember which note is being edited.

        editingNoteId = note.id;

        // Put the existing information into the editing window.

        editTitle.value = note.title;
        editContent.value = note.content;
        editColor.value = note.color;

        // Display the editing window.

        editModal.hidden = false;

        // Focus the title field.

        editTitle.focus();

    }



    // Delete

    else if (action === "delete") {

        const confirmed = confirm("Are you sure you want to delete this note?");

        if (!confirmed) {
            return;
        }

        notes = notes.filter(function(item) {
            return item.id !== noteId;
        });

        saveNotes();

        renderNotes();

        showNotification("Note deleted successfully.");

    }


    // Pin/Unpin

    else if (action === "pin") {

        note.pinned = !note.pinned;

        saveNotes();

        renderNotes();

        showNotification(
            note.pinned ? "Note pinned." : "Note unpinned."
        );

    }


    // Archival/Restoration

    else if (action === "archive") {

        note.archived = !note.archived;

        saveNotes();

        renderNotes();

        showNotification(
            note.archived ? "Note archived." : "Note restored."
        );

    }

});


// Note Search

searchInput.addEventListener("input", function() {

    renderNotes();

});


// Sort Notes

sortInput.addEventListener("change", function() {

    renderNotes();

});


// Sidebar

const navigationButtons = document.querySelectorAll(".nav-button");

navigationButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Remove active styling from all buttons.

        navigationButtons.forEach(function(item) {
            item.classList.remove("active");
        });

        // Highlight the selected button.

        button.classList.add("active");

        // Change the current view.

        currentView = button.dataset.view;

        // Update the page heading.

        if (currentView === "notes") {
            pageTitle.textContent = "Notes";
        }

        else if (currentView === "pinned") {
            pageTitle.textContent = "Pins";
        }

        else if (currentView === "archive") {
            pageTitle.textContent = "Archives";
        }

        // Refresh the notes display.

        renderNotes();

    });

});


// Help Modal

const helpButton = document.getElementById("help-button");

const helpModal = document.getElementById("help-modal");

const closeHelp = document.getElementById("close-help");


// Open help guide.

helpButton.addEventListener("click", function() {

    helpModal.hidden = false;

});


// Close help guide.

closeHelp.addEventListener("click", function() {

    helpModal.hidden = true;

});


// Close help guide when clicking outside the content.

helpModal.addEventListener("click", function(event) {

    if (event.target === helpModal) {

        helpModal.hidden = true;

    }

});


// Close help guide using the Escape key.

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        helpModal.hidden = true;

    }

});


// Note Editing Modal

// Save edited note.

saveEditButton.addEventListener("click", function() {

    const note = notes.find(function(item) {
        return item.id === editingNoteId;
    });

    if (!note) {
        return;
    }

    const newTitle = editTitle.value.trim();

    const newContent = editContent.value.trim();

    if (newTitle === "" && newContent === "") {

        showNotification("A note cannot be completely empty.");

        return;

    }

    // Update the existing note.

    note.title = newTitle;

    note.content = newContent;

    note.color = editColor.value;

    // Save and refresh.

    saveNotes();

    renderNotes();

    // Close the editing window.

    editModal.hidden = true;

    editingNoteId = null;

    showNotification("Note updated successfully!");

});


// Cancel editing.

cancelEditButton.addEventListener("click", function() {

    editModal.hidden = true;

    editingNoteId = null;

});


// Close editing window using Escape.

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape" && !editModal.hidden) {

        editModal.hidden = true;

        editingNoteId = null;

    }

});


// Close editing window by clicking outside it.

editModal.addEventListener("click", function(event) {

    if (event.target === editModal) {

        editModal.hidden = true;

        editingNoteId = null;

    }

});

// Reinitialization

// Display saved notes when the website opens.

renderNotes();
