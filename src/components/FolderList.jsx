// src/components/Sidebar/FolderList.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import FolderItem from "./FolderItem";

const FolderList = ({
  folders,
  expandedFolders,
  toggleFolder,
  setShowAddFolderModal,
  onSelect,
  onDeleteFolder,
  onDownloadFolder,
  searchText,
  setSearchText,
  setSelectedFolderId,
  setShowAddExcelModal,
  
}) => {
  // Filter folders and files by search
  const filterFolders = (folders) => {
    if (!searchText) return folders;
    const lower = searchText.toLowerCase();
    return folders
      .map((f) => ({
        ...f,
        files: f.files?.filter((file) =>
          (file.name || "").toLowerCase().includes(lower)
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
    <motion.div
      layout
      className="mt-2 px-2 overflow-y-auto max-h-[calc(100vh-200px)]"
    >
      {/* Search Bar */}
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
        {displayedFolders.map((folder, idx) => (
          <FolderItem
            key={folder.folder_id || `folder-${idx}`}
            folder={folder}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            onSelect={onSelect}
            onDelete={onDeleteFolder}
            onDownload={onDownloadFolder}
            setSelectedFolderId={setSelectedFolderId}
            setShowAddExcelModal={setShowAddExcelModal}
            setShowAddFolderModal ={setShowAddFolderModal}
          />
        ))}
      </AnimatePresence>

      {/* Add Folder Button */}
      <motion.button
        className="flex items-center gap-2 p-2 mt-2 w-full justify-center bg-green-600 hover:bg-green-500 rounded"
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowAddFolderModal(true)}
      >
        <Plus size={16} /> Add Folder
      </motion.button>
    </motion.div>
  );
};

export default FolderList;
