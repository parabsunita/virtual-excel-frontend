// src/components/Sidebar/FolderItem.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FileSpreadsheet,
  Plus,
  Trash,
  Download,
  ChevronDown,
  ChevronUp,
  Columns,
  Table
} from "lucide-react";
import {
  listExcelsAPI,
  listSheetsByExcelAPI,
  deleteSheetAPI,
  deleteColumnAPI,
  createSheetAPI
} from "./services/folderService";
import AddColumnsModal from "./AddColumnsModal";

const FolderItem = ({
  folder,
  expandedFolders,
  orgData,
  token,
  toggleFolder,
  onSelect,
  onDelete,
  onDownload,
  setSelectedFolderId,
  setShowAddExcelModal
}) => {
  const [folderExcels, setFolderExcels] = useState([]);
  const [loadingExcels, setLoadingExcels] = useState(false);
  const [expandedExcels, setExpandedExcels] = useState([]);
  const [excelSheets, setExcelSheets] = useState({});
  const [showAddColumnsModal, setShowAddColumnsModal] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState(null);

  // Add Sheet Modal
  const [showAddSheetModal, setShowAddSheetModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [selectedExcelId, setSelectedExcelId] = useState(null);

  const isExpanded = expandedFolders.includes(folder.folder_id);

  // --- Folder Expand ---
  const handleToggleFolder = async (folderId) => {
    toggleFolder(folderId);
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

  // --- Excel Expand to load sheets ---
  const handleToggleExcel = async (excelId) => {
    if (expandedExcels.includes(excelId)) {
      setExpandedExcels(expandedExcels.filter((id) => id !== excelId));
      onSelect(null); // deselect excel on collapse
    } else {
      setExpandedExcels([...expandedExcels, excelId]);
      try {
        const sheets = await listSheetsByExcelAPI(excelId, token);
        onSelect(excelId); // select excel on expand
        setExcelSheets((prev) => ({ ...prev, [excelId]: sheets }));
        
      } catch (err) {
        alert("Error fetching sheets: " + err.message);
      }
    }
  };

  // --- Open Add Columns Modal ---
  const handleOpenAddColumns = (sheetId) => {
    setSelectedSheetId(sheetId);
    setShowAddColumnsModal(true);
  };

  // --- Delete Column ---
  const handleDeleteColumn = async (sheetId, columnId) => {
    if (!window.confirm("Delete this column?")) return;
    try {
      await deleteColumnAPI(sheetId, columnId, token);
      alert("Column deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Delete Sheet (soft delete) ---
  const handleDeleteSheet = async (sheetId) => {
    if (!window.confirm("Soft delete this sheet?")) return;
    try {
      await deleteSheetAPI(sheetId, token);
      alert("Sheet deleted successfully");

      // Optionally refresh sheets
      const sheets = await listSheetsByExcelAPI(selectedExcelId, token);
      setExcelSheets((prev) => ({ ...prev, [selectedExcelId]: sheets }));
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Open Add Sheet Modal ---
  const handleOpenAddSheet = (excelId) => {
    setSelectedExcelId(excelId);
    setShowAddSheetModal(true);
  };

  // --- Create Sheet ---
  const handleCreateSheet = async () => {
    if (!newSheetName.trim()) return alert("Enter sheet name");
    try {
      await createSheetAPI(selectedExcelId, orgData.org_id, token, newSheetName);
      alert("Sheet created successfully");
      setShowAddSheetModal(false);
      setNewSheetName("");
      // refresh sheets for that excel
      const sheets = await listSheetsByExcelAPI(selectedExcelId, token);
      setExcelSheets((prev) => ({ ...prev, [selectedExcelId]: sheets }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-2 hover:bg-gray-800 rounded-md transition mb-1"
    >
      {/* --- Folder Header --- */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleToggleFolder(folder.folder_id)}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <Folder size={18} />
          <span>{folder.folder_name}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedFolderId(folder.folder_id);
              setShowAddExcelModal(true);
            }}
            className="text-green-400"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onDownload(folder)}
            className="text-blue-400"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => onDelete(folder.folder_id)}
            className="text-red-400"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* --- Excels under Folder --- */}
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
                <motion.div key={excel.id} className="ml-2">
                  {/* Excel Header */}
                  <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-700 transition">
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => handleToggleExcel(excel.id)}
                    >
                      <FileSpreadsheet size={16} />
                      <span>{excel.excel_name}</span>
                      {expandedExcels.includes(excel.id) ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronUp size={14} />
                      )}
                    </div>

                    {/* ➕ Add Sheet */}
                    <button
                      onClick={() => handleOpenAddSheet(excel.id)}
                      className="text-green-400"
                      title="Add Sheet"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Sheets under Excel */}
                  <AnimatePresence>
                    {expandedExcels.includes(excel.id) &&
                      excelSheets[excel.id]?.map((sheet) => (
                        <motion.div
                          key={sheet.sheet_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-6 mt-1 p-1 flex items-center gap-2 rounded hover:bg-gray-700"
                        >
                          <Table size={14} />
                          <span>{sheet.sheet_name}</span>

                          {/* Add Columns */}
                          <button
                            onClick={() => handleOpenAddColumns(sheet.id)}
                            className="text-yellow-400 ml-auto"
                            title="Add Columns"
                          >
                            <Columns size={14} />
                          </button>

                          {/* Delete Sheet */}
                          <button
                            onClick={() => handleDeleteSheet(sheet.id)}
                            className="text-red-400"
                            title="Delete Sheet"
                          >
                            <Trash size={14} />
                          </button>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Columns Modal */}
      {showAddColumnsModal && (
        <AddColumnsModal
          excel_id={selectedExcelId}
          sheet_id={selectedSheetId}
          token={token}
          onClose={() => setShowAddColumnsModal(false)}
        />
      )}

      {/* Add Sheet Modal */}
      {showAddSheetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-4 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-3 text-white">
              Add New Sheet
            </h3>
            <input
              type="text"
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              placeholder="Enter sheet name"
              className="w-full p-2 rounded bg-gray-800 text-white mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddSheetModal(false)}
                className="px-3 py-1 rounded bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSheet}
                className="px-3 py-1 rounded bg-green-600 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FolderItem;
