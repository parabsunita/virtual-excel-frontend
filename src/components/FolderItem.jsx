// src/components/Sidebar/FolderItem.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileSpreadsheet, Plus, Trash, Download, ChevronDown, ChevronUp } from "lucide-react";
import { listExcelsAPI } from "./services/folderService"; // make sure path is correct

const FolderItem = ({
  folder,
  expandedFolders,
  toggleFolder,
  onSelect,
  onDelete,
  onDownload,
  setSelectedFolderId,
  setShowAddExcelModal,
  token
}) => {
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [folderExcels, setFolderExcels] = useState([]);
  const [loadingExcels, setLoadingExcels] = useState(false);

  const isExpanded = expandedFolders.includes(folder.folder_id);

  const handleSelect = (item) => {
    setActiveItem(item);
    onSelect?.(item);
  };

  const renameFolder = (id, newName) => {
    if (!newName.trim()) return;
    folder.folder_name = newName;
    setEditingFolderId(null);
  };

  const renameFile = (fileId, newName) => {
    if (!newName.trim()) return;
    const file = folder.files?.find((f) => f.id === fileId);
    if (file) file.name = newName;
    setEditingFileId(null);
  };

  const deleteFile = (fileId) => {
    folder.files = folder.files?.filter((f) => f.id !== fileId);
    if (activeItem?.id === fileId) setActiveItem(null);
  };

  const handleToggleFolder = async (folderId) => {
    toggleFolder(folderId);

    // fetch Excels only when expanding
    if (!expandedFolders.includes(folderId)) {
      setLoadingExcels(true);
      try {
        const excels = await listExcelsAPI(folderId, token);
        setFolderExcels(excels);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoadingExcels(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-2 hover:bg-gray-800 rounded-md transition mb-1"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Folder Header */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleToggleFolder(folder.folder_id)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <Folder size={18} />
          {editingFolderId === folder.folder_id ? (
            <input
              type="text"
              autoFocus
              defaultValue={folder.folder_name}
              onBlur={(e) => renameFolder(folder.folder_id, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && renameFolder(folder.folder_id, e.target.value)}
              className="px-2 py-1 border rounded w-32 bg-gray-700 text-white"
            />
          ) : (
            <span onDoubleClick={() => setEditingFolderId(folder.folder_id)}>
              {folder.folder_name} ({folder.files || 0})
            </span>
          )}
        </div>

        {/* Folder Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => {
              setSelectedFolderId(folder.folder_id);
              setShowAddExcelModal(true);
            }}
            className="text-green-400"
          >
            <Plus size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => onDownload(folder)}
            className="text-blue-400"
          >
            <Download size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={() => onDelete(folder.folder_id)}
            className="text-red-400"
          >
            <Trash size={16} />
          </motion.button>
        </div>
      </div>

      {/* Excels List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2 space-y-1"
          >
            {loadingExcels ? (
              <div className="text-gray-400 text-sm">Loading Excels...</div>
            ) : (
              folderExcels.map((excel) => (
                <motion.div
                  key={excel.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-gray-700 transition ${activeItem?.id === excel.id ? "bg-blue-600" : ""}`}
                  onClick={() => handleSelect(excel)}
                >
                  <FileSpreadsheet size={16} />
                  <span>{excel.excel_name}</span>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FolderItem;
