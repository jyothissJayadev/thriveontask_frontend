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
import toast, { Toaster } from "react-hot-toast";

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
  const [isReadOnly, setIsReadOnly] = useState(false);

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
      toast.error(error.message);
      console.error("Error fetching notes:", error);
      setNotes([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize editor with content
  // Replace your initializeEditor function with this one
  const initializeEditor = (content) => {
    if (editorRef.current) {
      // Check if content is HTML or plain text
      if (/<[a-z][\s\S]*>/i.test(content)) {
        // Content already has HTML formatting, use it directly
        editorRef.current.innerHTML = content;
      } else {
        // Handle plain text with basic formatting
        const lines = content.split("\n");
        const formattedContent = lines
          .map((line) => {
            if (line.trim() === "") {
              return "<br>";
            }
            return `<div>${line}</div>`;
          })
          .join("");

        editorRef.current.innerHTML = formattedContent;
      }

      setEditorContent(editorRef.current.innerHTML);
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
    setIsReadOnly(false);
    setTimeout(() => initializeEditor(note.content), 50);
  };

  const createNewNote = () => {
    setEditorTitle("");
    setEditorContent("");
    setEditorColor("#fff9c4");
    setActiveNote(null);
    setIsModalOpen(true);
    setIsReadOnly(false);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }, 50);
  };

  // This function now preserves more of the formatting
  const htmlToSaveFormat = (html) => {
    // We'll preserve the HTML formatting instead of converting to plain text
    // Clean up any unnecessary elements or formatting
    let cleanedHtml = html
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/<div><br><\/div>/gi, "<br>") // Normalize empty lines
      .replace(/<div>\s*<\/div>/gi, "<br>") // Normalize empty divs
      .trim();

    // Return the cleaned HTML
    return cleanedHtml;
  };
  const saveNote = async () => {
    if (!editorRef.current) return;

    const currentContent = editorRef.current.innerHTML;
    // Use the HTML content directly instead of converting to plain text
    const contentToSave = htmlToSaveFormat(currentContent);
    const token = localStorage.getItem("jwtToken");

    try {
      if (activeNote) {
        // Update existing note
        const response = await updateNote(
          activeNote._id,
          editorTitle,
          contentToSave,
          editorColor,
          token
        );
        if (response.success === false) {
          throw new Error(response.error);
        }

        // Update local state
        setNotes(
          notes.map((note) =>
            note._id === activeNote._id
              ? {
                  ...note,
                  title: editorTitle,
                  content: contentToSave,
                  color: editorColor,
                  lastEdited: new Date(),
                }
              : note
          )
        );

        toast.success("Note saved successfully");
      } else {
        // Create new note
        const response = await createNote(
          editorTitle || "Untitled Note",
          contentToSave,
          editorColor,
          token
        );
        if (response.success === false) {
          throw new Error(response.error);
        }

        toast.success("New note created successfully");
        // Refresh notes instead of trying to update local state
        fetchNotes();
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(error.message || "Failed to save note");
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
        toast.success("Note deleted successfully");
        setNotes(notes.filter((note) => note._id !== _id));
      } catch (error) {
        console.error("Error deleting note:", error);
        toast.error("Failed to delete note. Please try again.");
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
    setIsReadOnly(true);

    setTimeout(() => {
      initializeEditor(note.content);
      if (editorRef.current) {
        editorRef.current.setAttribute("contenteditable", "false");
        editorRef.current.classList.add("read-only-mode");
      }
    }, 50);
  };

  // UI helper functions
  const formatDisplayContent = (content) => {
    // Add null check and provide default empty string
    const safeContent = content || "";
    const MAX_LENGTH = 100;

    // Create a temporary div to handle HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = safeContent;

    // Get text content for length measurement
    let textContent = tempDiv.textContent || tempDiv.innerText;

    // Trim if too long
    let isTrimmed = false;
    if (textContent.length > MAX_LENGTH) {
      // We'll trim the HTML rather than the text to preserve formatting
      const ratio = MAX_LENGTH / textContent.length;
      const trimIndex = Math.floor(safeContent.length * ratio);

      // Only use part of the HTML content
      tempDiv.innerHTML = safeContent.substring(0, trimIndex) + "...";
      isTrimmed = true;
    }

    // For the preview, we'll render the HTML directly with dangerouslySetInnerHTML
    return (
      <div
        className="note-preview-content"
        dangerouslySetInnerHTML={{
          __html: isTrimmed ? tempDiv.innerHTML : safeContent,
        }}
      />
    );
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
      if (isModalOpen && e.ctrlKey && !isReadOnly) {
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
  }, [isModalOpen, isReadOnly]);

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
            key={note._id || note.id}
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
            <div className="note-content">{formatDisplayContent(note?.content)}</div>
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
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
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
                readOnly={isReadOnly}
              />
              {!isReadOnly && (
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
              )}
            </div>

            {!isReadOnly && (
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
            )}

            <div
              ref={editorRef}
              className={`rich-text-editor ${isReadOnly ? "read-only-mode" : ""}`}
              contentEditable={!isReadOnly}
              onInput={handleEditorChange}
              style={{
                overflowWrap: "break-word",
                wordBreak: "break-word",
                maxWidth: "100%",
              }}
            />

            <div className="editor-footer">
              <button className="cancel-btn" onClick={closeModal}>
                {isReadOnly ? "Close" : "Cancel"}
              </button>
              {!isReadOnly && (
                <button className="save-btn" onClick={saveNote}>
                  <Save size={16} />
                  Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#4CAF50",
            },
          },
          error: {
            style: {
              background: "#F44336",
            },
          },
        }}
      />
    </div>
  );
};

export default StickyNotesApp;
