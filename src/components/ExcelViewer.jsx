import React from "react";

const ExcelViewer = ({ sheets = [], token }) => {
  if (!sheets.length)
    return <p className="text-gray-500 text-center italic">No sheets found.</p>;

  return (
    <div className="space-y-6">
      {sheets.map((sheet) => (
        <div key={sheet.id} className="bg-white shadow-md p-5 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              📄 {sheet.sheet_name}
            </h3>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              onClick={() => alert(`Upload data for ${sheet.sheet_name}`)}
            >
              Upload Data
            </button>
          </div>

          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Column Name</th>
                <th className="py-2 px-4 text-left">Data Type</th>
              </tr>
            </thead>
            <tbody>
              {sheet.columns?.length ? (
                sheet.columns.map((col) => (
                  <tr key={col.id} className="border-t">
                    <td className="py-2 px-4">{col.column_name}</td>
                    <td className="py-2 px-4">{col.data_type}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-3 text-gray-500 italic"
                  >
                    No columns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ExcelViewer;
