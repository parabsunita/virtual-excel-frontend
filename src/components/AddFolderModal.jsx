// src/components/Sidebar/AddFolderModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const AddFolderModal = ({ show, value, setValue, onCreate, onClose, loading,setShowAddFolderModal }) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 w-80 shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Create New</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="border border-gray-300 rounded w-full px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={onCreate} disabled={loading} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500">
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFolderModal;
