// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, Folder, ChevronLeft, ChevronRight } from "lucide-react";
import FolderList from "./FolderList";
import AddFolderModal from "./AddFolderModal";
import {
  fetchFolders as fetchFoldersAPI,
  createFolder as createFolderAPI,
  deleteFolder as deleteFolderAPI,
  downloadFolder as downloadFolderAPI,
  createExcelAPI as createFile
} from "./services/folderService";
import AddItemModal from "./AddItemModal";

const Sidebar = ({ onSelect, orgData, token }) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [modalValue, setModalValue] = useState(""); // generic for folder or file
  const [loading, setLoading] = useState(false);
  const [showAddExcelModal, setShowAddExcelModal] = useState(false);
  const [newExcelName, setNewExcelName] = useState("");
  // Sidebar.jsx
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Fetch folders
  const fetchFolders = async () => {
    if (!token || !orgData?.org_id) return;
    const data = await fetchFoldersAPI(orgData.org_id, token);
    setFolders(data);
  };

  useEffect(() => { fetchFolders(); }, [orgData?.org_id, token]);

  const handleAddFolder = async () => {
    if (!modalValue.trim()) return alert("Name cannot be empty");
    const duplicate = folders.some((f) => f.folder_name.toLowerCase() === modalValue.trim().toLowerCase());
    if (duplicate) return alert("Folder with this name already exists.");
    setLoading(true);
    try {
      await createFolderAPI(orgData.org_id, token, modalValue);
      await fetchFolders();
      setShowAddFolderModal(false);
      setModalValue("");
    } catch (err) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Delete this folder?")) return;
    try { await deleteFolderAPI(folderId,orgData.org_id, token); await fetchFolders(); } catch (err) { console.error(err); }
  };

  const handleDownloadFolder = async (folder) => {
    try { await downloadFolderAPI(folder); } catch (err) { alert(err.message); }
  };


  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]);
  };

  const handleAddExcel = async () => {
    if (!newExcelName.trim()) return alert("Name cannot be empty");
    setLoading(true);
    try {
      await createFile(selectedFolderId, token, newExcelName); // make sure createFileAPI is imported
      await fetchFolders();
      setShowAddExcelModal(false);
      setNewExcelName("");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex h-screen font-sans">
      <motion.div animate={{ width: isCollapsed ? 64 : 256 }} className="bg-gray-900 text-white flex flex-col shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && <motion.h2 layout className="font-bold text-lg">📁 Workspace</motion.h2>}
          <motion.button whileHover={{ scale: 1.1 }} className="p-1 hover:bg-gray-700 rounded" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.button>
        </div>

        <div className="flex flex-col mt-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
            { id: "workspace", label: "My Workspace", icon: <Folder size={18} /> },
            { id: "users", label: "User Management", icon: <Users size={18} /> }
          ].map((nav) => (
            <motion.button
              key={nav.id}
              layout
              onClick={() => setActiveSection(nav.id)}
              className={`flex items-center gap-2 p-3 rounded-lg mx-2 my-1 hover:bg-gray-800 transition-colors ${activeSection === nav.id ? "bg-gray-700" : ""}`}
              whileHover={{ scale: 1.03 }}
            >
              {nav.icon} {!isCollapsed && nav.label}
            </motion.button>
          ))}
        </div>

        {activeSection === "workspace" && !isCollapsed && (
          <FolderList
            folders={folders}
            orgData={orgData}
            token={token}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            onSelect={onSelect}
            onDeleteFolder={handleDeleteFolder}
            onDownloadFolder={handleDownloadFolder}
            setShowAddExcelModal={setShowAddExcelModal}   // pass modal control
            setSelectedFolderId={setSelectedFolderId}     // pass setter
            searchText={searchText}
            setSearchText={setSearchText}
            setShowAddFolderModal ={setShowAddFolderModal}
          />

        )}
      </motion.div>

      <AddFolderModal
        show={showAddFolderModal}
        value={modalValue}
        setValue={setModalValue}
        onCreate={handleAddFolder}
        onClose={() => setShowAddFolderModal(false)}
        loading={loading}
        setShowAddFolderModal ={setShowAddFolderModal}
      />

      <AddItemModal
        show={showAddExcelModal}
        value={newExcelName}
        setValue={setNewExcelName}
        onCreate={handleAddExcel}
        onClose={() => setShowAddExcelModal(false)}
        loading={loading}
        title="Excel File"
      />

    </div>
  );
};

export default Sidebar;
