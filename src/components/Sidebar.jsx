import React, { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const Sidebar = ({ onSelect, orgData, token }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [folders, setFolders] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  // 🟢 Fetch all folders
  const fetchFolders = async () => {
    if (!token || !orgData?.org_id) return;
    try {
      const res = await fetch(`${API_URL}/folders/${orgData.org_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.folders) setFolders(data.folders);
    } catch (err) {
      console.error("Error fetching folders:", err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [API_URL, orgData?.org_id, token]);

  // 🟢 Add folder using modal input
  const createFolder = async () => {
    if (!newFolderName.trim()) return alert("Folder name cannot be empty");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/folders/${orgData.org_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ folder_name: newFolderName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create folder");
      await fetchFolders();
      setShowAddFolderModal(false);
      setNewFolderName("");
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renameFolder = (id, newName) => {
    if (!newName.trim()) return;
    setFolders((prev) =>
      prev.map((f) => (f.folder_id === id ? { ...f, folder_name: newName } : f))
    );
    setEditingFolderId(null);
  };

  const deleteFolder = async (id) => {
    if (!window.confirm("Delete this folder?")) return;
    try {
      await fetch(`${API_URL}/folders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchFolders();
    } catch (err) {
      console.error("Error deleting folder:", err);
    }
  };

  const addFile = (folderId) => {
    const newFile = {
      id: Date.now(),
      name: "New File",
      folderId,
      columns: [],
      data: [],
    };
    setFolders((prev) =>
      prev.map((f) =>
        f.folder_id === folderId
          ? { ...f, files: [...(f.files || []), newFile] }
          : f
      )
    );
    setEditingFileId(newFile.id);
  };

  const renameFile = (folderId, fileId, newName) => {
    if (!newName.trim()) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.folder_id === folderId
          ? {
              ...f,
              files: f.files.map((file) =>
                file.id === fileId ? { ...file, name: newName } : file
              ),
            }
          : f
      )
    );
    setEditingFileId(null);
  };

  const deleteFile = (folderId, fileId) => {
    if (!window.confirm("Delete this file?")) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.folder_id === folderId
          ? { ...f, files: f.files.filter((file) => file.id !== fileId) }
          : f
      )
    );
    if (activeItem?.id === fileId) setActiveItem(null);
  };

  const handleSelect = (file) => {
    setActiveItem(file);
    if (onSelect) onSelect(file);
  };

  const downloadFolder = async (folder) => {
    if (!folder.files?.length) return alert("Folder is empty!");
    const zip = new JSZip();
    for (const file of folder.files) {
      const ws = XLSX.utils.aoa_to_sheet(file.data.length ? file.data : [[]]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      zip.file(`${file.name || "New File"}.xlsx`, wbout);
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folder.folder_name || "New Folder"}.zip`);
  };

  const filterFolders = (folders) => {
    if (!searchText) return folders;
    const lower = searchText.toLowerCase();
    return folders
      .map((f) => ({
        ...f,
        files: f.files?.filter((file) =>
          file.name.toLowerCase().includes(lower)
        ),
      }))
      .filter(
        (f) =>
          f.folder_name.toLowerCase().includes(lower) ||
          (f.files && f.files.length > 0)
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
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col mt-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
            { id: "workspace", label: "My Workspace", icon: <Folder size={18} /> },
            { id: "users", label: "User Management", icon: <Users size={18} /> },
          ].map((nav) => (
            <motion.button
              key={nav.id}
              layout
              onClick={() => setActiveSection(nav.id)}
              className={`flex items-center gap-2 p-3 rounded-lg mx-2 my-1 hover:bg-gray-800 transition-colors ${
                activeSection === nav.id ? "bg-gray-700" : ""
              }`}
              whileHover={{ scale: 1.03 }}
            >
              {nav.icon} {!isCollapsed && nav.label}
            </motion.button>
          ))}
        </div>

        {/* Workspace */}
        {activeSection === "workspace" && !isCollapsed && (
          <motion.div
            layout
            className="mt-2 px-2 overflow-y-auto max-h-[calc(100vh-200px)]"
          >
            {/* Search */}
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

            {/* Folder List */}
            <AnimatePresence>
              {displayedFolders.map((folder) => (
                <motion.div
                  key={folder.folder_id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-2 hover:bg-gray-800 rounded-md transition mb-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Folder size={18} />
                      {editingFolderId === folder.folder_id ? (
                        <input
                          type="text"
                          autoFocus
                          defaultValue={folder.folder_name}
                          onBlur={(e) =>
                            renameFolder(folder.folder_id, e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            renameFolder(folder.folder_id, e.target.value)
                          }
                          className="px-2 py-1 border rounded w-32 bg-gray-700 text-white"
                        />
                      ) : (
                        <span
                          onDoubleClick={() =>
                            setEditingFolderId(folder.folder_id)
                          }
                        >
                          {folder.folder_name} ({folder.files?.length || 0})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        className="text-green-400"
                        onClick={() => addFile(folder.folder_id)}
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
                        onClick={() => deleteFolder(folder.folder_id)}
                      >
                        <Trash size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="ml-6 mt-2 space-y-1">
                    {folder.files?.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`flex items-center gap-2 p-1 rounded cursor-pointer ${
                          activeItem?.id === file.id
                            ? "bg-blue-600"
                            : "hover:bg-gray-700"
                        } transition`}
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
                              renameFile(folder.folder_id, file.id, e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              renameFile(folder.folder_id, file.id, e.target.value)
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
                          onClick={() => deleteFile(folder.folder_id, file.id)}
                        >
                          <Trash size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Folder Button */}
            <motion.button
              className="flex items-center gap-2 p-2 mt-2 w-full justify-center bg-green-600 hover:bg-green-500 rounded"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAddFolderModal(true)}
              disabled={loading}
            >
              <Plus size={16} /> Add Folder
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Modal for Add Folder */}
      <AnimatePresence>
        {showAddFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-80 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Create New Folder
                </h3>
                <button
                  onClick={() => setShowAddFolderModal(false)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="border border-gray-300 rounded w-full px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddFolderModal(false)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  disabled={loading}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;