// src/components/Sidebar/ExcelItem.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, FileSpreadsheet } from "lucide-react";
import SheetsModal from "./SheetsModal";
import { listSheetsAPI } from "./services/folderService"; // implement API call

const ExcelItem = ({ excel, token }) => {
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [loadingSheets, setLoadingSheets] = useState(false);

  const fetchSheets = async () => {
    setLoadingSheets(true);
    try {
      const data = await listSheetsAPI(excel.id, token);
      setSheets(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleOpenSheets = async () => {
    await fetchSheets();
    setShowSheetsModal(true);
  };

  return (
    <div className="flex items-center justify-between p-1 rounded hover:bg-gray-700">
      <div className="flex items-center gap-2 cursor-pointer">
        <FileSpreadsheet size={16} />
        <span>{excel.excel_name}</span>
      </div>
      <motion.button whileHover={{ scale: 1.2 }} onClick={handleOpenSheets} className="text-blue-400">
        <Edit size={16} />
      </motion.button>

      {showSheetsModal && (
        <SheetsModal
          excel={excel}
          sheets={sheets}
          setSheets={setSheets}
          token={token}
          onClose={() => setShowSheetsModal(false)}
        />
      )}
    </div>
  );
};

export default ExcelItem;
