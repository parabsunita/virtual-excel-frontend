// src/components/AttachmentRenderer.js
import React from "react";
import { Paperclip } from "lucide-react";
import { motion } from "framer-motion";

const AttachmentRenderer = React.memo((props) => {
  const { data, colDef } = props;
  const attachmentCount = data?.Attachment?.length || 0;

  const handleClick = (event) => {
    if (colDef.onCellClicked) {
      colDef.onCellClicked(props);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-center h-full cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Paperclip
          size={18}
          className={attachmentCount > 0 ? "text-blue-600" : "text-gray-400"}
        />
      </motion.div>
      {attachmentCount > 0 && (
        <span className="ml-1 text-xs font-semibold text-blue-700">
          ({attachmentCount})
        </span>
      )}
    </div>
  );
});

export default AttachmentRenderer;
