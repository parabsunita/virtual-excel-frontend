// src/components/Sidebar/SheetsModal.jsx
import React, { useState } from "react";
import AddColumnsModal from "./AddColumnsModal";
import { createSheetAPI } from "./services/folderService";

const SheetsModal = ({ excel, sheets, setSheets, token, onClose }) => {
  const [sheetName, setSheetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);

  const handleAddSheet = async () => {
    if (!sheetName.trim()) return alert("Sheet name cannot be empty");
    setLoading(true);
    try {
      const newSheet = await createSheetAPI(excel.id, token, sheetName);
      setSheets([...sheets, newSheet]);
      setSheetName("");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded w-96 max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Sheets for {excel.excel_name}</h2>

        {/* Add New Sheet */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet Name"
            className="flex-1 px-2 py-1 rounded bg-gray-700 border"
          />
          <button onClick={handleAddSheet} className="bg-green-500 px-3 rounded">Add</button>
        </div>

        {/* Existing Sheets */}
        <div className="space-y-2">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
              <span>{sheet.sheet_name}</span>
              <button
                className="text-blue-400"
                onClick={() => setSelectedSheet(sheet)}
              >
                Edit Columns
              </button>
            </div>
          ))}
        </div>

        {/* Add/Edit Columns */}
        {selectedSheet && (
          <AddColumnsModal
            sheet={selectedSheet}
            token={token}
            onClose={() => setSelectedSheet(null)}
          />
        )}

        <button onClick={onClose} className="mt-4 bg-red-500 px-4 py-1 rounded">Close</button>
      </div>
    </div>
  );
};

export default SheetsModal;
