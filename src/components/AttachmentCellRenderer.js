import React, { useRef, useState } from "react";
import {
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  UploadFile as UploadFileIcon,
} from "@mui/icons-material";

const AttachmentCellRenderer = ({
  value,
  data,
  onAttachmentUpload,
  onFilePreview,
}) => {
  const fileInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const attachments = Array.isArray(value) ? value : [];

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0 && typeof onAttachmentUpload === "function") {
      Array.from(files).forEach((file) => onAttachmentUpload(data.ID, file));
    }
    event.target.value = null;
    handleMenuClose();
  };

  const handleFilePreviewClick = () => {
    if (typeof onFilePreview === "function") onFilePreview(data);
    handleMenuClose();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Tooltip title="Manage Attachments" arrow>
        <IconButton
          onClick={handleMenuClick}
          size="small"
          style={{ color: "#2980b9" }}
          aria-controls={open ? "attachment-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Badge
            badgeContent={attachments.length}
            color="primary"
            overlap="rectangular"
          >
            <AttachFileIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="attachment-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        {attachments.length > 0 && (
          <MenuItem onClick={handleFilePreviewClick}>
            Preview ({attachments.length})
          </MenuItem>
        )}
        <MenuItem>
          <Button
            component="label"
            fullWidth
            sx={{ textTransform: "none" }}
            startIcon={<UploadFileIcon />}
          >
            Attach Files
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </Button>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AttachmentCellRenderer;
