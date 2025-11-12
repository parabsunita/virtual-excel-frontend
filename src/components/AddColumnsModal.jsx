import React, { useEffect, useState } from "react";
import { getSheetByExcelIdAPI, createColumnsAPI, updateColumnsAPI } from "./services/folderService";

const DATA_TYPES = ["NVARCHAR(255)", "DECIMAL(10,2)", "INT", "DATE"];

const AddColumnsModal = ({ excel_id, sheet_id, token, onClose }) => {
  const [sheet, setSheet] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch sheet details on load
  useEffect(() => {
    const fetchSheetDetails = async () => {
      try {
        const res = await getSheetByExcelIdAPI(sheet_id, token);
        if (res.success) {
          setSheet(res.sheets);
          setColumns(res.sheets.columns || []);
        }
      } catch (err) {
        console.error("Failed to fetch sheet:", err);
        alert("Unable to fetch sheet details");
      } finally {
        setLoading(false);
      }
    };
    fetchSheetDetails();
  }, [sheet_id, token]);

  // ✅ Add new empty column row
  const handleAddColumn = () =>
    setColumns([...columns, { column_name: "", data_type: DATA_TYPES[0] }]);

  // ✅ Remove a column row
  const handleRemoveColumn = (index) =>
    setColumns(columns.filter((_, i) => i !== index));

  // ✅ Update input values
  const handleChange = (index, key, value) => {
    const newCols = [...columns];
    newCols[index][key] = value;
    setColumns(newCols);
  };

  // ✅ Save new or updated columns
  const handleSaveColumns = async () => {
    if (columns.some((col) => !col.column_name.trim())) {
      return alert("All columns must have names");
    }

    setLoading(true);
    try {
      const existingCols = columns.filter((c) => c.id); // already existing
      const newCols = columns.filter((c) => !c.id); // new added

      // update existing ones (if any)
      if (existingCols.length > 0) {
        await updateColumnsAPI(sheet.id, token, existingCols);
      }

      // create new ones (if any)
      if (newCols.length > 0) {
        await createColumnsAPI(sheet.id, token, newCols);
      }

      alert("Columns saved successfully");
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save columns");
    } finally {
      setLoading(false);
    }
  };

  if (!sheet)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 text-white p-6 rounded">
          <p>Loading sheet details...</p>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded w-[480px] max-h-[85vh] overflow-auto">
        <h3 className="text-lg font-bold mb-4">
          Manage Columns — {sheet.sheet_name}
        </h3>

        {/* ✅ COLUMN LIST */}
        <div className="space-y-2">
          {columns.map((col, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Column Name"
                value={col.column_name}
                onChange={(e) => handleChange(idx, "column_name", e.target.value)}
                className="flex-1 px-2 py-1 rounded bg-gray-700 border"
              />
              <select
                value={col.data_type}
                onChange={(e) => handleChange(idx, "data_type", e.target.value)}
                className="px-2 py-1 rounded bg-gray-700 border"
              >
                {DATA_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleRemoveColumn(idx)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* ✅ ACTION BUTTONS */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddColumn}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
          >
            + Add Column
          </button>
          <button
            onClick={handleSaveColumns}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Columns"}
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnsModal;
