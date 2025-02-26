import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Edit,
  Eye,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Plus,
  Save,
} from "lucide-react";
import { createNote, getNotes, updateNote, deleteNote } from "../../../api/api";
import "./StickyNotesApp.css";

const StickyNotesApp = () => {
  // State management
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorColor, setEditorColor] = useState("#fff9c4");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const editorRef = useRef(null);

  // Fetch notes when component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await getNotes(token);
      if (response.success === false) {
        throw new Error(response.error);
      }
      // Add this check and transformation
      if (response.notes) {
        setNotes(response.notes); // If API returns { data: [...notes] }
      } else if (Array.isArray(response)) {
        setNotes(response); // If API returns notes array directly
      } else {
        setNotes([]); // Fallback to empty array if response is invalid
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching notes:", error);
      setNotes([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };
  // Initialize editor with content
  const initializeEditor = (content) => {
    if (editorRef.current) {
      // Convert dash lists to HTML lists
      let formattedContent = content
        .split("\n")
        .map((line) => {
          if (line.trim().startsWith("- ")) {
            return `<li>${line.substring(2)}</li>`;
          }
          // Handle numbered lists
          if (/^\d+\.\s/.test(line)) {
            return `<li>${line.substring(line.indexOf(".") + 2)}</li>`;
          }
          return line;
        })
        .join("<br>");

      // Wrap list items in ul/ol tags
      formattedContent = formattedContent.replace(/<li>(?:(?!<\/li>).)*<\/li>/g, (match) => {
        if (match.startsWith("<li>- ")) {
          return `<ul>${match}</ul>`;
        }
        if (/^<li>\d+\./.test(match)) {
          return `<ol>${match}</ol>`;
        }
        return match;
      });

      editorRef.current.innerHTML = formattedContent;
      setEditorContent(formattedContent);
    }
  };

  // Text formatting functions
  const formatText = (command) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      document.execCommand(command, false, null);
      if (editorRef.current) {
        setEditorContent(editorRef.current.innerHTML);
      }
    }
  };
  const formatContentForSave = (content) => {
    const formattedContent = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    return formattedContent;
  };
  const handleFormatList = (type) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      document.execCommand(
        type === "bullet" ? "insertUnorderedList" : "insertOrderedList",
        false,
        null
      );
      if (editorRef.current) {
        setEditorContent(editorRef.current.innerHTML);
      }
    }
  };

  const removeListFormatting = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let currentNode = selection.anchorNode;
      while (currentNode && currentNode !== editorRef.current) {
        if (currentNode.nodeName === "UL" || currentNode.nodeName === "OL") {
          document.execCommand("outdent", false, null);
          if (editorRef.current) {
            setEditorContent(editorRef.current.innerHTML);
          }
          return;
        }
        currentNode = currentNode.parentNode;
      }
    }
  };

  // Note operations
  const openNoteEditor = (note) => {
    setEditorTitle(note.title);
    setActiveNote(note);
    setEditorColor(note.color);
    setIsModalOpen(true);
    setTimeout(() => initializeEditor(note.content), 50);
  };

  const createNewNote = () => {
    setEditorTitle("");
    setEditorContent("");
    setEditorColor("#fff9c4");
    setActiveNote(null);
    setIsModalOpen(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }, 50);
  };

  const htmlToText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Replace list items with dashes and newlines
    const listItems = tempDiv.querySelectorAll("li");
    listItems.forEach((li) => {
      li.textContent = `- ${li.textContent}\n`;
    });

    // Handle ordered lists
    const orderedItems = tempDiv.querySelectorAll("ol li");
    orderedItems.forEach((li, index) => {
      li.textContent = `${index + 1}. ${li.textContent}\n`;
    });

    // Replace breaks and other elements with proper newlines
    const content = tempDiv.innerHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]+>/g, "") // Remove remaining HTML tags
      .replace(/\n\n+/g, "\n") // Remove extra newlines
      .trim();

    return content;
  };

  const saveNote = async () => {
    const currentContent = editorRef.current ? editorRef.current.innerHTML : editorContent;
    const plainText = formatContentForSave(htmlToText(currentContent));
    const token = localStorage.getItem("jwtToken");

    try {
      if (activeNote) {
        // Update existing note
        const response = await updateNote(
          activeNote._id,
          editorTitle,
          plainText,
          editorColor,
          token
        );
        if (response.success === false) {
          throw new Error(response.error);
        }
        setNotes(
          notes.map((note) =>
            note.id === activeNote.id ? { ...response, lastEdited: new Date() } : note
          )
        );
      } else {
        // Create new note
        const response = await createNote(
          editorTitle || "Untitled Note",
          plainText,
          editorColor,
          token
        );
        if (response.success === false) {
          throw new Error(response.error);
        }
        setNotes([...notes, { ...response, lastEdited: new Date() }]);
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note. Please try again.");
    }
  };

  const handleDeleteNote = async (_id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await deleteNote(_id, token);
        if (response.success === false) {
          throw new Error(response.error);
        }
        setNotes(notes.filter((note) => note._id !== _id));
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note. Please try again.");
      }
    }
  };

  // View mode handlers
  const viewNote = (note, e) => {
    e.stopPropagation();
    setActiveNote(note);
    setEditorTitle(note.title);
    setEditorColor(note.color);
    setIsModalOpen(true);

    setTimeout(() => {
      initializeEditor(note.content);
      if (editorRef.current) {
        editorRef.current.setAttribute("contenteditable", "false");
        editorRef.current.classList.add("read-only-mode");
      }
      const toolbar = document.querySelector(".formatting-toolbar");
      if (toolbar) toolbar.style.display = "none";

      const saveBtn = document.querySelector(".save-btn");
      if (saveBtn) {
        saveBtn.innerText = "Close";
        saveBtn.onclick = () => setIsModalOpen(false);
      }
    }, 50);
  };

  // UI helper functions
  const formatDisplayContent = (content) => {
    // Add null check and provide default empty string
    const safeContent = content || "";
    const MAX_LENGTH = 100;
    let preview = safeContent;

    if (safeContent.length > MAX_LENGTH) {
      preview = safeContent.substring(0, MAX_LENGTH) + "...";
    }

    return preview.split("\n").map((line, i) => <div key={i}>{line}</div>);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Color options
  const colorOptions = [
    { name: "Yellow", value: "#fff9c4" },
    { name: "Blue", value: "#e0f7fa" },
    { name: "Pink", value: "#ffebee" },
    { name: "Orange", value: "#fff3e0" },
    { name: "Green", value: "#e8f5e9" },
    { name: "Purple", value: "#f3e5f5" },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen && e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            formatText("bold");
            break;
          case "i":
            e.preventDefault();
            formatText("italic");
            break;
          case "u":
            e.preventDefault();
            formatText("underline");
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Editor content changes
  const handleEditorChange = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
      const container = editorRef.current.parentElement;
      if (container) {
        container.style.overflowY = "auto";
      }
    }
  };

  // Modal cleanup
  const closeModal = () => {
    setIsModalOpen(false);
    if (editorRef.current) {
      editorRef.current.classList.remove("read-only-mode");
    }
    const toolbar = document.querySelector(".formatting-toolbar");
    if (toolbar) {
      toolbar.style.display = "flex";
    }
  };

  if (isLoading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="sticky-notes-app">
      <header className="app-header">
        <h1>Sticky Wall</h1>
        <button className="new-note-btn" onClick={createNewNote}>
          <Plus size={20} />
          <span>New Note</span>
        </button>
      </header>

      <div className="notes-container">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{ backgroundColor: note.color }}
            onClick={() => openNoteEditor(note)}
          >
            <div className="note-header">
              <h2 className="note-title">{note.title}</h2>
              <div className="note-actions">
                <button className="icon-button" onClick={(e) => handleDeleteNote(note._id, e)}>
                  <Trash2 size={16} />
                </button>
                <button
                  className="icon-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNoteEditor(note);
                  }}
                >
                  <Edit size={16} />
                </button>
                <button className="icon-button" onClick={(e) => viewNote(note, e)}>
                  <Eye size={16} />
                </button>
              </div>
            </div>
            <div className="note-content"> {formatDisplayContent(note?.content)}</div>
            <div className="note-footer">Last edited: {formatDate(note.lastEdited)}</div>
          </div>
        ))}

        <div className="note-card add-note" onClick={createNewNote}>
          <div className="add-note-content">
            <Plus size={40} />
            <span>Add New Note</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="editor-modal"
            style={{ backgroundColor: editorColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="editor-header">
              <input
                type="text"
                className="editor-title-input"
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                placeholder="Note Title"
              />
              <div className="color-picker">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`color-option ${editorColor === color.value ? "selected" : ""}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEditorColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="formatting-toolbar">
              <button onClick={() => formatText("bold")} title="Bold (Ctrl+B)">
                <Bold size={16} />
              </button>
              <button onClick={() => formatText("italic")} title="Italic (Ctrl+I)">
                <Italic size={16} />
              </button>
              <button onClick={() => formatText("underline")} title="Underline (Ctrl+U)">
                <Underline size={16} />
              </button>
              <button onClick={() => handleFormatList("bullet")} title="Bullet List">
                <List size={16} />
              </button>
              <button onClick={() => handleFormatList("number")} title="Numbered List">
                <ListOrdered size={16} />
              </button>
              <button onClick={removeListFormatting} title="Remove List Formatting">
                Remove List
              </button>
            </div>

            <div
              ref={editorRef}
              className="rich-text-editor"
              contentEditable
              onInput={handleEditorChange}
              style={{
                overflowWrap: "break-word",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            />

            <div className="editor-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="save-btn" onClick={saveNote}>
                <Save size={16} />
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickyNotesApp;
