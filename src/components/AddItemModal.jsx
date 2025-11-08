// src/components/Sidebar/AddItemModal.jsx
import React from "react";
import { motion } from "framer-motion";

const AddItemModal = ({ show, value, setValue, onCreate, onClose, loading, title }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="bg-gray-900 text-white p-6 rounded-lg w-80"
      >
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`Enter ${title}`}
          className="w-full px-3 py-2 rounded text-black"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={loading}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddItemModal;
