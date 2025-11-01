import React, { useState } from "react";
import { Paperclip, Plus, X } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const AttachmentCellRenderer = ({
  value,
  rowData,
  tableName,
  updateRowAttachments,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [attachments, setAttachments] = useState(value || []);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("rowId", rowData.id);
    formData.append("tableName", tableName);

    try {
      setUploading(true);
      const res = await axios.post(
        "http://localhost:5000/api/upload-attachment",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      if (res.data.status === "success") {
        setAttachments(res.data.attachments);
        if (updateRowAttachments)
          updateRowAttachments(rowData.id, res.data.attachments);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      <div
        className="flex items-center gap-1 cursor-pointer hover:text-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Paperclip size={18} />
        <span className="text-sm">{attachments.length}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-6 left-0 z-50 w-64 bg-white border shadow-lg p-2 rounded-md"
          >
            <div className="max-h-40 overflow-y-auto mb-2">
              {attachments.length === 0 && (
                <div className="text-gray-400 text-sm">No attachments</div>
              )}
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center mb-1 p-1 border-b text-sm"
                >
                  <span>{att.name}</span>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>

            <label
              className={`flex items-center gap-1 cursor-pointer text-sm ${uploading ? "opacity-50 pointer-events-none" : "text-blue-600 hover:text-blue-800"}`}
            >
              <Plus size={14} /> Attach File
              <input type="file" multiple hidden onChange={handleFileChange} />
            </label>

            <X
              size={16}
              className="absolute top-1 right-1 cursor-pointer text-gray-500 hover:text-red-500"
              onClick={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentCellRenderer;
