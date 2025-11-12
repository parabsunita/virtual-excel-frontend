import React, { useState } from "react";

const ExcelViewer = ({ sheets }) => {
  const [activeSheet, setActiveSheet] = useState(sheets?.[0] || null);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({});

  if (!sheets || sheets.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500 italic">
        📂 No sheets found. Please create a new one.
      </div>
    );
  }

  const handleAddRow = () => {
    setRows([...rows, newRow]);
    setNewRow({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      {/* Sheet Tabs */}
      <div className="flex space-x-2 border-b pb-2 mb-4">
        {sheets.map((sheet) => (
          <button
            key={sheet.id}
            onClick={() => {
              setActiveSheet(sheet);
              setRows([]); // reset rows when switching sheet
              setNewRow({});
            }}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeSheet?.id === sheet.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {sheet.sheet_name}
          </button>
        ))}
      </div>

      {/* Active Sheet Display */}
      {activeSheet ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              📄 {activeSheet.sheet_name}
            </h3>

            <button
              onClick={handleAddRow}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow"
            >
              ➕ Add Row
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto border border-gray-300 rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  {activeSheet.columns.length > 0 ? (
                    activeSheet.columns.map((col) => (
                      <th
                        key={col.id}
                        className="py-2 px-4 text-left border-b font-medium text-gray-700"
                      >
                        {col.column_name}{" "}
                        <span className="text-xs text-gray-400">
                          ({col.data_type})
                        </span>
                      </th>
                    ))
                  ) : (
                    <th className="py-3 px-4 text-gray-400 text-center">
                      No columns yet
                    </th>
                  )}
                </tr>
              </thead>

              {activeSheet.columns.length > 0 && (
                <tbody>
                  {/* Existing Rows */}
                  {rows.length > 0 ? (
                    rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {activeSheet.columns.map((col) => (
                          <td key={col.id} className="py-2 px-4 border-b">
                            {row[col.column_name] || ""}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={activeSheet.columns.length}
                        className="py-4 text-center text-gray-400 italic"
                      >
                        No data yet. Add a row to start.
                      </td>
                    </tr>
                  )}

                  {/* New Row Inputs */}
                  <tr className="bg-blue-50">
                    {activeSheet.columns.map((col) => (
                      <td key={col.id} className="py-2 px-4 border-t">
                        <input
                          type={col.data_type.includes("DATE") ? "date" : "text"}
                          value={newRow[col.column_name] || ""}
                          onChange={(e) =>
                            setNewRow({
                              ...newRow,
                              [col.column_name]: e.target.value,
                            })
                          }
                          placeholder={col.column_name}
                          className="w-full border rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center italic">
          Please select a sheet to view.
        </p>
      )}
    </div>
  );
};

export default ExcelViewer;
