import React, { useState } from "react";
import {
  Folder,
  FileSpreadsheet,
  Plus,
  Trash,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Users,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const Sidebar = ({ onSelect }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [folders, setFolders] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const selectSection = (section) => setActiveSection(section);

  // Folder actions
  const addFolder = () => {
    const newFolder = { id: Date.now(), name: "", files: [] };
    setFolders([...folders, newFolder]);
    setEditingFolderId(newFolder.id);
  };

  const renameFolder = (id, newName) => {
    if (!newName.trim()) return;
    setFolders(folders.map((f) => (f.id === id ? { ...f, name: newName } : f)));
    setEditingFolderId(null);
  };

  const deleteFolder = (id) => {
    if (!window.confirm("Delete folder and all files?")) return;
    setFolders(folders.filter((f) => f.id !== id));
    if (activeItem?.folderId === id) setActiveItem(null);
  };

  // File actions
  const addFile = (folderId) => {
    const newFile = {
      id: Date.now(),
      name: "",
      folderId,
      columns: [],
      data: [],
    };
    setFolders(
      folders.map((f) =>
        f.id === folderId ? { ...f, files: [...f.files, newFile] } : f,
      ),
    );
    setEditingFileId(newFile.id);
  };

  const renameFile = (folderId, fileId, newName) => {
    if (!newName.trim()) return;
    setFolders(
      folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              files: f.files.map((file) =>
                file.id === fileId ? { ...file, name: newName } : file,
              ),
            }
          : f,
      ),
    );
    setEditingFileId(null);
  };

  const deleteFile = (folderId, fileId) => {
    if (!window.confirm("Delete this file?")) return;
    setFolders(
      folders.map((f) =>
        f.id === folderId
          ? { ...f, files: f.files.filter((file) => file.id !== fileId) }
          : f,
      ),
    );
    if (activeItem?.id === fileId) setActiveItem(null);
  };

  const handleSelect = (file) => {
    setActiveItem(file);
    if (onSelect) onSelect(file);
  };

  // Download Folder
  const downloadFolder = async (folder) => {
    if (!folder.files.length) return alert("Folder is empty!");
    const zip = new JSZip();
    for (const file of folder.files) {
      const ws = XLSX.utils.aoa_to_sheet(file.data.length ? file.data : [[]]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      zip.file(`${file.name || "New File"}.xlsx`, wbout);
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folder.name || "New Folder"}.zip`);
  };

  const filterFolders = (folders) => {
    if (!searchText) return folders;
    const lower = searchText.toLowerCase();
    return folders
      .map((f) => ({
        ...f,
        files: f.files.filter((file) =>
          file.name.toLowerCase().includes(lower),
        ),
      }))
      .filter(
        (f) => f.name.toLowerCase().includes(lower) || f.files.length > 0,
      );
  };

  const displayedFolders = filterFolders(folders);

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 64 : 256 }}
        className="bg-gray-900 text-white flex flex-col shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <motion.h2 layout className="font-bold text-lg">
              📁 Workspace
            </motion.h2>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="p-1 hover:bg-gray-700 rounded"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col mt-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
            {
              id: "workspace",
              label: "My Workspace",
              icon: <Folder size={18} />,
            },
            {
              id: "users",
              label: "User Management",
              icon: <Users size={18} />,
            },
          ].map((nav) => (
            <motion.button
              key={nav.id}
              layout
              onClick={() => selectSection(nav.id)}
              className={`flex items-center gap-2 p-3 rounded-lg mx-2 my-1 hover:bg-gray-800 transition-colors ${
                activeSection === nav.id ? "bg-gray-700" : ""
              }`}
              whileHover={{ scale: 1.03 }}
            >
              {nav.icon} {!isCollapsed && nav.label}
            </motion.button>
          ))}
        </div>

        {/* Workspace Content */}
        {activeSection === "workspace" && !isCollapsed && (
          <motion.div
            layout
            className="mt-2 px-2 overflow-y-auto max-h-[calc(100vh-200px)]"
          >
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 mb-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search folders/files..."
                className="w-full px-2 py-1 rounded text-black outline-none"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <AnimatePresence>
              {displayedFolders.map((folder) => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-2 hover:bg-gray-800 rounded-md transition mb-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Folder size={18} />
                      {editingFolderId === folder.id ? (
                        <input
                          type="text"
                          autoFocus
                          defaultValue={folder.name}
                          onBlur={(e) =>
                            renameFolder(folder.id, e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            renameFolder(folder.id, e.target.value)
                          }
                          className="px-2 py-1 border rounded w-32 bg-gray-700 text-white"
                        />
                      ) : (
                        <span
                          onDoubleClick={() => setEditingFolderId(folder.id)}
                        >
                          {folder.name || "New Folder"} ({folder.files.length})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        className="text-green-400"
                        onClick={() => addFile(folder.id)}
                      >
                        <Plus size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        className="text-blue-400"
                        onClick={() => downloadFolder(folder)}
                      >
                        <Download size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        className="text-red-400"
                        onClick={() => deleteFolder(folder.id)}
                      >
                        <Trash size={16} />
                      </motion.button>
                    </div>
                  </div>

                  <div className="ml-6 mt-2 space-y-1">
                    {folder.files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`flex items-center gap-2 p-1 rounded cursor-pointer ${activeItem?.id === file.id ? "bg-blue-600" : "hover:bg-gray-700"} transition`}
                      >
                        <FileSpreadsheet
                          size={16}
                          onClick={() => handleSelect(file)}
                        />
                        {editingFileId === file.id ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={file.name}
                            onBlur={(e) =>
                              renameFile(folder.id, file.id, e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              renameFile(folder.id, file.id, e.target.value)
                            }
                            className="px-2 py-1 border rounded w-32 bg-gray-700 text-white"
                          />
                        ) : (
                          <span
                            onDoubleClick={() => setEditingFileId(file.id)}
                            onClick={() => handleSelect(file)}
                          >
                            {file.name || "New File"}
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          className="ml-auto text-red-400"
                          onClick={() => deleteFile(folder.id, file.id)}
                        >
                          <Trash size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              className="flex items-center gap-2 p-2 mt-2 w-full justify-center bg-green-600 hover:bg-green-500 rounded"
              whileHover={{ scale: 1.05 }}
              onClick={addFolder}
            >
              <Plus size={16} /> Add Folder
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        {activeSection === "dashboard" && (
          <h1 className="text-3xl font-bold animate-pulse">
            Dashboard Content
          </h1>
        )}
        {activeSection === "users" && (
          <h1 className="text-3xl font-bold animate-pulse">
            User Management Content
          </h1>
        )}
        {activeSection === "workspace" && activeItem && (
          <div>
            <h2 className="text-xl font-semibold mt-4">{activeItem.name}</h2>
            <pre className="mt-2 p-4 bg-white rounded shadow-lg">
              {JSON.stringify(activeItem.data, null, 2)}
            </pre>
          </div>
        )}
        {activeSection === "workspace" && !activeItem && (
          <p className="text-gray-500 mt-4">
            Select a file to view its content
          </p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
