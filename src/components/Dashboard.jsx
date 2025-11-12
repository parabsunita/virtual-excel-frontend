import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ExcelViewer from "./ExcelViewer";
import { ToastContainer, toast } from "react-toastify";
import { listSheetsByExcelAPI, listColumnsAPI } from "./services/folderService"; // ✅ Add this

const Dashboard = ({
  orgData,
  token,
  setIsLoggedIn,
  setOrgData,
  setToken,
}) => {
  const [activeExcel, setActiveExcel] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch sheets + columns for the selected Excel
  const handleSelectExcel = async (excel) => {
    try {
      setLoading(true);
      setActiveExcel(excel);

      const sheetsRes = await listSheetsByExcelAPI(excel.id, token);
      const sheetData = await Promise.all(
        sheetsRes.sheets.map(async (sheet) => {
          const colsRes = await listColumnsAPI(sheet.id, token);
          return {
            ...sheet,
            columns: colsRes.columns || [],
          };
        })
      );

      setSheets(sheetData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sheets or columns");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("orgData");
    setIsLoggedIn(false);
    setOrgData(null);
    setToken(null);
    toast.info("You have been logged out!");
    setTimeout(() => (window.location.href = "/"), 800);
  };

  if (!orgData || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            ⚠️ Unauthorized Access
          </h2>
          <p className="text-gray-500 mt-2">
            Please login to view your organization dashboard.
          </p>
          <a
            href="/"
            className="text-blue-500 hover:underline font-medium mt-4 inline-block"
          >
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-300">
      <Sidebar
        onSelect={handleSelectExcel}
        orgData={orgData}
        token={token}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex justify-between items-center shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800">
            {activeExcel ? activeExcel.excel_name : "📑 Excel Viewer"}
          </h2>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-gray-700 font-semibold">
                {orgData?.org_name || "Organization"}
              </p>
              <p className="text-sm text-gray-500">{orgData?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 bg-gray-50 overflow-auto rounded-lg shadow-inner">
          {loading ? (
            <p className="text-center text-gray-500">Loading sheets...</p>
          ) : activeExcel ? (
            <ExcelViewer sheets={sheets} token={token} />
          ) : (
            <p className="text-gray-500 flex justify-center items-center h-full text-lg italic">
              📂 Select an Excel from the sidebar
            </p>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default Dashboard;
