import React from "react";
import Sidebar from "./Sidebar";
import ExcelViewer from "./ExcelViewer";
import { ToastContainer } from "react-toastify";

const Dashboard = ({ files, setFiles, activeFile, setActiveFile, handleUpload, handleError }) => {
  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-300">
      <Sidebar onSelect={setActiveFile} files={files} setFiles={setFiles} />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex justify-between items-center shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800">
            {activeFile ? activeFile.name : "📑 Excel Viewer"}
          </h2>
        </div>

        <div className="flex-1 p-6 bg-gray-50 overflow-auto rounded-lg shadow-inner">
          {activeFile ? (
            <ExcelViewer
              columns={activeFile.columns || []}
              data={activeFile.data || []}
              onUpload={handleUpload}
              onError={handleError}
            />
          ) : (
            <p className="text-gray-500 flex justify-center items-center h-full text-lg italic">
              📂 Select a file from the sidebar
            </p>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;