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
import "./StickyNotesApp.css";

const StickyNotesApp = () => {
  // State for all notes
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Social Media",
      content: "- Plan social content\n- Build content calendar\n- Plan promotion and distribution",
      color: "#fff9c4",
      lastEdited: new Date("2025-02-10"),
    },
    {
      id: 2,
      title: "Content Strategy",
      content:
        "Would need time to get insights (goals, personas, budget, audits), but after, it would be good to focus on assembling my team (start with SEO specialist, then perhaps an email marketer?). Also need to brainstorm on tooling.",
      color: "#e0f7fa",
      lastEdited: new Date("2025-02-12"),
    },
    {
      id: 3,
      title: "Email A/B Tests",
      content: "- Subject lines\n- Sender\n- CTA\n- Sending times",
      color: "#ffebee",
      lastEdited: new Date("2025-02-15"),
    },
    {
      id: 4,
      title: "Banner Ads",
      content:
        "Notes from the workshop:\n- Sizing matters\n- Choose distinctive imagery\n- The landing page must match the display ad",
      color: "#fff3e0",
      lastEdited: new Date("2025-02-17"),
    },
  ]);

  // State for active note
  const [activeNote, setActiveNote] = useState(null);

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for editor
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorColor, setEditorColor] = useState("#fff9c4");

  // Reference for the editor div
  const editorRef = useRef(null);

  // Function to initialize editor with content
  const initializeEditor = (content) => {
    if (editorRef.current) {
      // If content has newlines, properly format them for the contentEditable div
      const formattedContent = content.replace(/\n/g, "<br>");
      editorRef.current.innerHTML = formattedContent;
      setEditorContent(formattedContent);
    }
  };

  // Text formatting functions with selection check
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
      // Save the current selection
      const range = selection.getRangeAt(0);
      const selectedContent = range.toString();

      // Only apply list if there's a selection or the cursor is positioned
      if (selectedContent || range.collapsed) {
        document.execCommand(
          type === "bullet" ? "insertUnorderedList" : "insertOrderedList",
          false,
          null
        );
        if (editorRef.current) {
          setEditorContent(editorRef.current.innerHTML);
        }
      }
    }
  };

  // Remove list formatting
  const removeListFormatting = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Check if we're in a list
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

  // Open note for editing
  const openNoteEditor = (note) => {
    setEditorTitle(note.title);
    setActiveNote(note);
    setEditorColor(note.color);
    setIsModalOpen(true);

    // Delay initialization to ensure modal is rendered
    setTimeout(() => {
      initializeEditor(note.content);
    }, 50);
  };

  // Create new note
  const createNewNote = () => {
    setEditorTitle("");
    setEditorContent("");
    setEditorColor("#fff9c4");
    setActiveNote(null);
    setIsModalOpen(true);

    // Delay initialization to ensure modal is rendered
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }, 50);
  };

  // Convert HTML to plain text while preserving line breaks
  const htmlToText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Replace <br>, <div>, <p> with newlines
    const content = tempDiv.innerHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<div>/gi, "\n")
      .replace(/<p>/gi, "\n")
      .replace(/<\/div>|<\/p>/gi, "");

    // Now extract the text content
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Save note
  const saveNote = () => {
    // Get content from the editor ref to ensure we have the latest
    const currentContent = editorRef.current ? editorRef.current.innerHTML : editorContent;
    // Convert HTML content to plain text, preserving line breaks
    const plainText = htmlToText(currentContent);

    if (activeNote) {
      // Update existing note
      setNotes(
        notes.map((note) =>
          note.id === activeNote.id
            ? {
                ...note,
                title: editorTitle,
                content: plainText,
                color: editorColor,
                lastEdited: new Date(),
              }
            : note
        )
      );
    } else {
      // Create new note
      const newNote = {
        id: Date.now(),
        title: editorTitle || "Untitled Note",
        content: plainText,
        color: editorColor,
        lastEdited: new Date(),
      };
      setNotes([...notes, newNote]);
    }
    setIsModalOpen(false);
  };

  // Delete note
  const deleteNote = (id, e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  // View note (read-only)
  const viewNote = (note, e) => {
    e.stopPropagation(); // Prevent event bubbling
    setActiveNote(note);
    setEditorTitle(note.title);
    setEditorColor(note.color);
    setIsModalOpen(true);

    // Delay initialization to ensure modal is rendered
    setTimeout(() => {
      initializeEditor(note.content);

      // Make the editor read-only
      if (editorRef.current) {
        editorRef.current.setAttribute("contenteditable", "false");
        // Add a visual indicator for read-only mode
        editorRef.current.classList.add("read-only-mode");
      }

      // Hide formatting toolbar in view mode
      const toolbar = document.querySelector(".formatting-toolbar");
      if (toolbar) {
        toolbar.style.display = "none";
      }

      // Change the save button to a close button
      const saveBtn = document.querySelector(".save-btn");
      if (saveBtn) {
        saveBtn.innerText = "Close";
        saveBtn.onclick = () => setIsModalOpen(false);
      }
    }, 50);
  };

  // Format display content (fixed to properly handle plain text)
  const formatDisplayContent = (content) => {
    // Preview logic - truncate and format for display
    const MAX_LENGTH = 100;
    let preview = content;

    if (content.length > MAX_LENGTH) {
      preview = content.substring(0, MAX_LENGTH) + "...";
    }

    return preview.split("\n").map((line, i) => <div key={i}>{line}</div>);
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

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only apply shortcuts if the modal is open
      if (isModalOpen) {
        // Handle keyboard shortcuts
        if (e.ctrlKey) {
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
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Handle editor content changes
  const handleEditorChange = () => {
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);

      // Fix for editor container overflow bug
      // Ensure editor content stays within boundaries
      const container = editorRef.current.parentElement;
      if (container) {
        container.style.overflowY = "auto";
      }
    }
  };

  // Reset modal to editing mode when opened
  useEffect(() => {
    if (isModalOpen && editorRef.current) {
      // Set timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        // Check if not in view mode
        if (!document.querySelector(".read-only-mode")) {
          editorRef.current.setAttribute("contenteditable", "true");

          // Focus at the end of the content
          const selection = window.getSelection();
          const range = document.createRange();

          editorRef.current.focus();

          if (editorRef.current.childNodes.length > 0) {
            const lastChild = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
            range.selectNodeContents(lastChild);
            range.collapse(false); // Collapse to the end
          } else {
            range.selectNodeContents(editorRef.current);
            range.collapse(false); // Collapse to the end
          }

          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 100);
    }
  }, [isModalOpen]);

  // Close modal and clean up
  const closeModal = () => {
    setIsModalOpen(false);

    // Reset states
    if (editorRef.current) {
      editorRef.current.classList.remove("read-only-mode");
    }

    // Show toolbar again
    const toolbar = document.querySelector(".formatting-toolbar");
    if (toolbar) {
      toolbar.style.display = "flex";
    }
  };

  // Fix for editor overflow when selecting full lines
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && isModalOpen) {
        // Ensure editor container has proper overflow settings
        editorRef.current.style.overflowWrap = "break-word";
        editorRef.current.style.wordBreak = "break-word";
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isModalOpen]);

  return (
    <div className="sticky-notes-app">
      <header className="app-header">
        <h1>Sticky Wall</h1>
        <a href="https://quicknote.io/" target="_blank" rel="noopener noreferrer">
          <button className="new-note-btn">
            <span>Web Note</span>
          </button>
        </a>
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
                <button className="icon-button" onClick={(e) => deleteNote(note.id, e)}>
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
            <div className="note-content">{formatDisplayContent(note.content)}</div>
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
              id="richTextEditor"
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
