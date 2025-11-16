import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL;

const ExcelViewer = ({ sheets }) => {
  const [activeSheet, setActiveSheet] = useState(sheets?.[0] || null);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]); // ⭐ selected rows for delete
  const [excelFile, setExcelFile] = useState(null); // ⭐ excel upload

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  // Fetch rows
  const fetchRows = async (sheet_id) => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/rows/${sheet_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRows(res.data.rows || []);
    } catch (err) {
      console.error("❌ Fetch rows error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSheet) {
      fetchRows(activeSheet.id);
      setNewRow({});
      setSelectedRows([]);
    }
  }, [activeSheet]);

  // Save row only if user entered values
  const handleSaveRow = async () => {
    const hasValues = Object.values(newRow).some((v) => v !== "");

    if (!hasValues) {
      alert("Please enter at least one value before saving.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/rows/${activeSheet.id}/${userId}`,
        { row_data: newRow },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchRows(activeSheet.id);
      setNewRow({});
    } catch (err) {
      console.error("❌ Save row error:", err);
    }
  };

  // ⭐ Toggle row selection
  const toggleRowSelection = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // ⭐ Delete selected rows
 const handleDeleteSelected = async () => {
  if (selectedRows.length === 0) {
    alert("Please select at least one row.");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} rows?`))
    return;

  try {
    await axios.delete(
      `${API_BASE}/rows/${activeSheet.id}`,   // FIXED
      {
        data: { ids: selectedRows },                   // PASS ARRAY
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchRows(activeSheet.id);
    setSelectedRows([]);
  } catch (err) {
    console.error("❌ Delete error:", err);
  }
};


  // ⭐ Handle Excel File Upload
  const handleUploadExcel = async () => {
    if (!excelFile) {
      alert("Select an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);
    formData.append("user_id", userId);

    try {
      await axios.post(
        `${API_BASE}/excel/upload/${activeSheet.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchRows(activeSheet.id);
      setExcelFile(null);
    } catch (err) {
      console.error("❌ Excel upload error:", err);
    }
  };

  if (!sheets || sheets.length === 0) {
    return <div className="text-center text-gray-500 italic py-10">No sheets found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-5">

      {/* Sheet Tabs */}
      <div className="flex space-x-2 border-b pb-2 mb-4">
        {sheets.map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheet(sheet)}
            className={`px-4 py-2 rounded-t-lg font-medium ${activeSheet?.id === sheet.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {sheet.sheet_name}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold text-gray-800">📄 {activeSheet.sheet_name}</h3>

        <div className="flex gap-3">
          {/* Excel Upload */}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setExcelFile(e.target.files[0])}
            className="border p-1 rounded"
          />
          <button
            onClick={handleUploadExcel}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md shadow"
          >
            ⬆ Upload Excel
          </button>

          {/* Delete Selected */}
          <button
            onClick={handleDeleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
          >
            🗑 Delete Selected
          </button>

          {/* Save Row */}
          <button
            onClick={handleSaveRow}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
          >
            💾 Save Row
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-gray-300 rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-10 text-center border-b">✔</th>
              {activeSheet.columns.map((col) => (
                <th key={col.id} className="py-2 px-4 border-b text-left font-medium text-gray-700">
                  {col.column_name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Input Row */}
            <tr className="bg-blue-50">
              <td className="border-t text-center">—</td>
              {activeSheet.columns.map((col) => (
                <td key={col.id} className="py-2 px-4 border-t">
                  <input
                    type={col.data_type.includes("DATE") ? "date" : "text"}
                    value={newRow[col.column_name] || ""}
                    onChange={(e) =>
                      setNewRow({ ...newRow, [col.column_name]: e.target.value })
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
              ))}
            </tr>

            {/* Existing Rows */}
            {loading ? (
              <tr>
                <td colSpan={activeSheet.columns.length + 1} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row) => {
                const data = row;

                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="text-center border-b">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                      />
                    </td>

                    {activeSheet.columns.map((col) => (
                      <td key={col.id} className="py-2 px-4 border-b">
                        {data[col.column_name] || ""}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={activeSheet.columns.length + 1}
                  className="text-center text-gray-400 py-4 italic"
                >
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelViewer;
