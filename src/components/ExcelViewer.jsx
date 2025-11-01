import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import * as XLSX from "xlsx";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  CsvExportModule,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Upload,
  Plus,
  Trash2,
  DownloadCloud,
  Search,
  X,
  Settings,
  RotateCcw,
  RotateCw,
  Eye,
  FileText,
  LayoutList,
  GripVertical,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Paperclip,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);

// --- Helper Functions ---
const generateUniqueRowId = (sheetIndex) => {
  return `${sheetIndex}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
};

const createFieldName = (name) =>
  name.trim().replace(/\s+/g, "_").toLowerCase();

// --- Data Type Icon Component ---
const DataTypeIcon = ({ dataType }) => {
  const iconProps = { size: 14, className: "mr-1" };
  const getIcon = () => {
    switch (dataType) {
      case "Text":
        return <Type {...iconProps} className="text-blue-500 mr-1" />;
      case "Number":
        return <Hash {...iconProps} className="text-green-500 mr-1" />;
      case "Date":
        return <Calendar {...iconProps} className="text-purple-500 mr-1" />;
      case "Boolean":
        return <CheckSquare {...iconProps} className="text-red-500 mr-1" />;
      case "Attachment":
        return <Paperclip {...iconProps} className="text-gray-500 mr-1" />;
      default:
        return null;
    }
  };
  return <div className="inline-flex items-center">{getIcon()}</div>;
};

// --- Custom Grid Header Component ---
const GridHeader = (props) => {
  const { displayName, column } = props;
  const dataType = column.getColDef().dataType;
  return (
    <div className="flex items-center">
      <DataTypeIcon dataType={dataType} />
      <span>{displayName}</span>
    </div>
  );
};

// --- Attachment Viewer Modal ---
const AttachmentViewerModal = ({
  files,
  onAttach,
  onPreview,
  onDownload,
  onDelete,
  onClose,
}) => {
  const fileInputRef = useRef(null);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Paperclip size={24} className="mr-2 text-gray-600" />
            Manage Attachments ({files.length})
          </h2>
          <X
            size={20}
            className="cursor-pointer text-gray-400 hover:text-red-500 transition"
            onClick={onClose}
          />
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {files.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No attachments found for this row.
            </p>
          ) : (
            files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm"
              >
                <div className="flex items-center min-w-0">
                  <FileText
                    size={18}
                    className="text-blue-500 mr-2 flex-shrink-0"
                  />
                  <span
                    className="truncate font-medium text-sm text-gray-800"
                    title={file}
                  >
                    {file}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onPreview(file)}
                    className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                    title="Preview"
                  >
                    <Eye size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => onDownload(file)}
                    className="p-1 rounded-full bg-green-100 hover:bg-green-200 transition"
                    title="Download"
                  >
                    <DownloadCloud size={16} className="text-green-600" />
                  </button>
                  <button
                    onClick={() => onDelete(file)}
                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="pt-4 border-t mt-4">
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <Upload size={18} /> Attach New File(s)
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={(e) => {
              onAttach(e.target.files);
              e.target.value = null;
            }}
            className="hidden"
          />
        </div>
      </motion.div>
    </div>
  );
};

// --- Attachment Cell Renderer ---
const AttachmentCellRenderer = ({ value, data, sheetName, dbInfo, api }) => {
  const [attachedFiles, setAttachedFiles] = useState(
    value
      ? value
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f)
      : [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showToast = (msg, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50 transition-all duration-500 ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };
  const refreshGridCell = useCallback(
    (newFilesArray) => {
      const newFileString = newFilesArray.join(", ");
      data.Attachment = newFileString;
      api.applyTransaction({ update: [data] });
      setAttachedFiles(newFilesArray);
    },
    [data, api],
  );

  const handleAttachFiles = async (files) => {
    if (!files.length) return;
    const formData = new FormData();
    formData.append("rowId", data.id);
    formData.append("sheetName", sheetName);
    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("dbServer", dbInfo.server);
    try {
      const newFileNames = Array.from(files).map((f) => f.name);
      const updatedFiles = [...attachedFiles, ...newFileNames];
      refreshGridCell(updatedFiles);
      showToast(
        `Files uploaded successfully (Placeholder): ${newFileNames.join(", ")}`,
      );
    } catch (err) {
      console.error(err);
      showToast("Upload failed!", "error");
    }
  };

  const handlePreview = (fileName) => {
    const url = `${dbInfo.apiBase}/api/preview-attachment?rowId=${data.id}&sheetName=${sheetName}&fileName=${fileName}`;
    showToast(`Attempting to preview: ${fileName}`, "success");
    window.open(url, "_blank");
  };

  const handleDownload = async (fileName) => {
    const url = `${dbInfo.apiBase}/api/download-attachment?rowId=${data.id}&sheetName=${sheetName}&fileName=${fileName}`;
    showToast(`Downloading: ${fileName}`, "success");
    window.open(url, "_self");
  };

  const handleDelete = async (fileName) => {
    if (
      !window.confirm(`Are you sure you want to delete the file: ${fileName}?`)
    )
      return;
    try {
      const updatedFiles = attachedFiles.filter((f) => f !== fileName);
      refreshGridCell(updatedFiles);
      showToast(`File deleted successfully (Placeholder): ${fileName}`);
    } catch (err) {
      console.error(err);
      showToast("Delete failed!", "error");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-full w-full">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition shadow-sm"
          title="Manage Attachments"
        >
          <Paperclip size={12} className="mr-1" />
          Manage ({attachedFiles.length})
        </button>
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <AttachmentViewerModal
            files={attachedFiles}
            onAttach={handleAttachFiles}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- Column Manager Modal ---
const ColumnManagerModal = ({ columns, setColumns, onClose }) => {
  const dataTypes = ["Text", "Number", "Date", "Boolean", "Attachment"];
  const columnTemplates = useMemo(
    () => [
      {
        id: "type1",
        name: "Type 1 (Simple Match)",
        description: "One column: X (Text)",
        pattern: (name) => [{ headerName: name, dataType: "Text" }],
      },
      {
        id: "type2",
        name: "Type 2 (Custom Match)",
        description: "One column: X (User-defined type)",
        pattern: (name, dataType) => [{ headerName: name, dataType: dataType }],
      },
      {
        id: "type3",
        name: "Type 3 (X, X_D, X_S)",
        description: "Three columns: X (Text), X_D (Date), X_S (Text)",
        pattern: (name) => [
          { headerName: name, dataType: "Text" },
          { headerName: `${name}_D`, dataType: "Date" },
          { headerName: `${name}_S`, dataType: "Text" },
        ],
      },
      {
        id: "type4",
        name: "Type 4 (X, X_D, X_S, X_N)",
        description:
          "Four columns: X (Text), X_D (Date), X_S (Text), X_N (Number)",
        pattern: (name) => [
          { headerName: name, dataType: "Text" },
          { headerName: `${name}_D`, dataType: "Date" },
          { headerName: `${name}_S`, dataType: "Text" },
          { headerName: `${name}_N`, dataType: "Number" },
        ],
      },
    ],
    [],
  );
  const [localColumns, setLocalColumns] = useState(
    columns.map((c, index) => ({
      ...c,
      id: c.field,
      originalField: c.field,
      dataType:
        c.dataType || (c.field === "Attachment" ? "Attachment" : "Text"),
      isNew: false,
    })),
  );
  const [activeTab, setActiveTab] = useState("add");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnTemplateId, setNewColumnTemplateId] = useState("type1");
  const [newColumnDataType, setNewColumnDataType] = useState("Text");
  const selectedTemplate = columnTemplates.find(
    (t) => t.id === newColumnTemplateId,
  );
  const handleUpdateName = (index, newName) => {
    const updated = [...localColumns];
    updated[index].headerName = newName;
    setLocalColumns(updated);
  };
  const handleUpdateDataType = (index, newDataType) => {
    const updated = [...localColumns];
    updated[index].dataType = newDataType;
    if (newDataType === "Attachment") {
      updated[index].originalField = "Attachment";
      updated[index].headerName = "Attachment";
    }
    setLocalColumns(updated);
  };
  const handleAddColumns = () => {
    const trimmedName = newColumnName.trim();
    if (!trimmedName || !selectedTemplate) return;
    let newColumnDefs = [];
    if (selectedTemplate.id === "type2") {
      newColumnDefs = selectedTemplate.pattern(trimmedName, newColumnDataType);
    } else {
      newColumnDefs = selectedTemplate.pattern(trimmedName);
    }
    const newCols = newColumnDefs.map((colDef) => {
      const baseName = createFieldName(colDef.headerName);
      const uniqueSuffix = Date.now().toString(36).substring(0, 4);
      let field =
        colDef.dataType === "Attachment"
          ? "Attachment"
          : `${baseName}_${uniqueSuffix}`;
      return {
        ...colDef,
        id: field,
        field: field,
        originalField: field,
        isNew: true,
      };
    });
    setLocalColumns([...localColumns, ...newCols]);
    setNewColumnName("");
    setNewColumnTemplateId("type1");
    setNewColumnDataType("Text");
    setActiveTab("manage");
  };
  const handleRemoveColumn = (id) => {
    setLocalColumns(localColumns.filter((col) => col.id !== id));
  };
  const handleSave = () => {
    const finalColumns = localColumns
      .map((col) => ({
        headerName: col.headerName,
        field: col.originalField,
        dataType: col.dataType,
      }))
      .filter(
        (col, index, self) =>
          col.field !== "Attachment" ||
          index === self.findIndex((c) => c.field === "Attachment"),
      );
    setColumns(finalColumns);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl"
      >
        <h2 className="text-3xl font-extrabold mb-5 text-gray-800 flex justify-between items-center border-b pb-3">
          <Settings size={28} className="mr-2 text-blue-600" /> Column Manager
          <X
            size={24}
            className="cursor-pointer text-gray-400 hover:text-red-500 transition"
            onClick={onClose}
          />
        </h2>
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === "add" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Plus size={18} className="inline mr-2" /> Add New Columns
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === "manage" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <LayoutList size={18} className="inline mr-2" /> Manage Existing (
            {localColumns.length})
          </button>
        </div>
        {activeTab === "add" && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-inner">
            <h3 className="font-bold text-xl mb-4 text-blue-800">
              1. Define New Column Name
            </h3>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Enter base column name (e.g., 'Project Status')"
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:ring-blue-500 focus:border-blue-500 transition-shadow mb-6"
              onKeyDown={(e) => e.key === "Enter" && handleAddColumns()}
            />
            <h3 className="font-bold text-xl mb-4 text-blue-800">
              2. Select Column Template
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {columnTemplates.map((template) => (
                <label
                  key={template.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${newColumnTemplateId === template.id ? "border-blue-500 bg-blue-100 shadow-md" : "border-gray-300 bg-white hover:border-blue-300"}`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={newColumnTemplateId === template.id}
                    onChange={() => {
                      setNewColumnTemplateId(template.id);
                      if (template.id !== "type2") setNewColumnDataType("Text");
                    }}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-lg text-gray-800">
                    {template.name}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                  {template.id === "type2" &&
                    newColumnTemplateId === "type2" && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                          Select Datatype:
                        </label>
                        <select
                          value={newColumnDataType}
                          onChange={(e) => setNewColumnDataType(e.target.value)}
                          className="p-2 border rounded-lg bg-white w-full text-base"
                        >
                          {dataTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                </label>
              ))}
            </div>
            <button
              onClick={handleAddColumns}
              disabled={!newColumnName.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} className="inline mr-2" /> Add Column(s)
            </button>
          </div>
        )}
        {activeTab === "manage" && (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
            <p className="text-sm text-gray-600 mb-4">
              Click to edit Name, change Datatype, or remove. *Note: Original
              `Field` name cannot be changed for existing columns to maintain
              data mapping.
            </p>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              <div className="flex items-center gap-3 p-2 font-bold text-sm text-gray-700 border-b border-gray-300">
                <GripVertical size={16} className="opacity-0" />
                <span className="w-1/3">Column Name</span>
                <span className="w-1/3">Datatype</span>
                <span className="w-1/3 text-xs text-gray-500">
                  Field (System Name)
                </span>
                <Trash2 size={20} className="opacity-0" />
              </div>
              {localColumns.map((col, index) => (
                <div
                  key={col.id}
                  className={`flex items-center gap-3 p-3 rounded-lg shadow-sm transition-all border ${col.isNew ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:shadow-md"}`}
                >
                  <GripVertical
                    size={16}
                    className="text-gray-400 cursor-grab"
                  />
                  <input
                    type="text"
                    value={col.headerName}
                    onChange={(e) => handleUpdateName(index, e.target.value)}
                    className="w-1/3 p-2 border rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Header Name"
                    disabled={col.dataType === "Attachment"}
                  />
                  <select
                    value={col.dataType}
                    onChange={(e) =>
                      handleUpdateDataType(index, e.target.value)
                    }
                    className="w-1/3 p-2 border rounded-lg text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                    disabled={col.dataType === "Attachment"}
                  >
                    {dataTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <span className="w-1/3 text-xs text-gray-500 font-mono overflow-hidden truncate px-2">
                    {col.originalField}
                  </span>
                  <Trash2
                    size={20}
                    className="text-red-500 cursor-pointer hover:text-red-700 transition ml-auto"
                    onClick={() => handleRemoveColumn(col.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="pt-6 border-t mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-xl"
          >
            Apply Changes and Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- AI Assistant Modal ---
const AIAssistantModal = ({
  onAsk,
  onClose,
  isThinking,
  response,
  question,
  setQuestion,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center text-gray-800">
          <FileText size={24} className="mr-2 text-blue-600" /> Ask AI About
          Your Data
          <X
            size={20}
            className="cursor-pointer text-gray-400 hover:text-red-500 transition"
            onClick={onClose}
          />
        </h2>
        <p className="text-gray-600 mb-4">
          Ask a question about the data in the current sheet. E.g., "What is the
          total value of all items?", or "What are the top 5 countries by
          sales?"
        </p>
        <textarea
          rows="3"
          className="w-full p-3 border rounded-lg resize-none mb-4 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <button
          onClick={onAsk}
          disabled={isThinking || !question.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThinking ? "Thinking..." : "Get Answer"}
        </button>
        {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-2">AI Response:</h3>
            <p className="whitespace-pre-wrap text-gray-800">{response}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Bulk Upload Dialog Component ---
const BulkUploadDialog = ({
  currentSheet,
  sheets,
  activeSheet,
  updateSheets,
  showToast,
  onClose,
}) => {
  const [matchField, setMatchField] = useState("");
  const [matchMethod, setMatchMethod] = useState("Exact Match");
  const [delimiter, setDelimiter] = useState("");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const folderInputRef = useRef(null);

  const commonDelimiters = useMemo(
    () => [
      { value: "", label: "Select or type a delimiter" },
      { value: "_", label: "Underscore (_)" },
      { value: "-", label: "Dash (-)" },
      { value: ".", label: "Period (.)" },
      { value: " ", label: "Space ( )" },
      { value: "custom", label: "Custom Delimiter" },
    ],
    [],
  );

  const handleDelimiterChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setDelimiter("custom");
      setCustomDelimiter("");
    } else {
      setDelimiter(value);
      setCustomDelimiter("");
    }
  };

  const handleBulkUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !matchField) {
      showToast("Please select a match field and a folder.", "error");
      return;
    }

    const effectiveDelimiter =
      delimiter === "custom" ? customDelimiter : delimiter;

    const updatedData = [...currentSheet.data];
    const columnData = updatedData.map((row) => row[matchField]);

    files.forEach((file) => {
      let matchedRow = null;
      const fileNameWithoutExtension = file.name
        .split(".")
        .slice(0, -1)
        .join(".");

      if (matchMethod === "Exact Match") {
        const rowIndex = columnData.findIndex(
          (val) => val === fileNameWithoutExtension,
        );
        if (rowIndex !== -1) {
          matchedRow = updatedData[rowIndex];
        }
      } else if (matchMethod === "Keyword Match") {
        const rowIndex = columnData.findIndex((val) =>
          fileNameWithoutExtension.includes(val),
        );
        if (rowIndex !== -1) {
          matchedRow = updatedData[rowIndex];
        }
      } else if (matchMethod === "Delimiter Match" && effectiveDelimiter) {
        const parts = fileNameWithoutExtension.split(effectiveDelimiter);
        const rowIndex = columnData.findIndex((val) => parts.includes(val));
        if (rowIndex !== -1) {
          matchedRow = updatedData[rowIndex];
        }
      }

      if (matchedRow) {
        const newAttachmentList = matchedRow.Attachment
          ? `${matchedRow.Attachment}, ${file.name}`
          : file.name;
        matchedRow.Attachment = newAttachmentList;
      }
    });

    const updatedSheets = [...sheets];
    updatedSheets[activeSheet].data = updatedData;
    updateSheets(updatedSheets, "BULK_ATTACHMENT_UPLOAD");
    showToast("Bulk attachments processed successfully!");
    onClose();
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold flex items-center mb-4 border-b pb-2">
          <Upload size={24} className="mr-2 text-blue-600" />
          Upload Attachments
        </h2>
        <p className="text-gray-600 mb-4">
          Match files from a folder to rows in your grid using a unique
          identifier.
        </p>
        <div className="space-y-4">
          <select
            value={matchField}
            onChange={(e) => setMatchField(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select Match Field --</option>
            {currentSheet.columns.map((col) => (
              <option value={col.field} key={col.field}>
                {col.headerName}
              </option>
            ))}
          </select>
          <select
            value={matchMethod}
            onChange={(e) => setMatchMethod(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Exact Match">Exact Match</option>
            <option value="Keyword Match">Keyword Match</option>
            <option value="Delimiter Match">Delimiter Match</option>
          </select>
          {matchMethod === "Delimiter Match" && (
            <>
              <select
                value={delimiter}
                onChange={handleDelimiterChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {commonDelimiters.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {delimiter === "custom" && (
                <input
                  type="text"
                  placeholder="Enter custom delimiter"
                  value={customDelimiter}
                  onChange={(e) => setCustomDelimiter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </>
          )}
          <label className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <FolderOpen size={16} className="mr-2 text-gray-600" />
            <span className="text-gray-600 font-semibold">
              Select Folder to Upload
            </span>
            <input
              type="file"
              hidden
              ref={folderInputRef}
              onChange={handleBulkUpload}
              // Using the non-standard attributes for directory selection
              webkitdirectory=""
              directory=""
            />
          </label>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- DynamicWorkbook Component ---
const DynamicWorkbook = () => {
  const [sheets, setSheets] = useState([
    { name: "Sheet 1", columns: [], data: [] },
  ]);
  const [templateColumns, setTemplateColumns] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [editingSheet, setEditingSheet] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState([sheets]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const gridRef = useRef(null);
  const tabsRef = useRef(null);
  const currentSheet = sheets[activeSheet] || { columns: [], data: [] };

  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.children[activeSheet];
      if (activeTab)
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    }
  }, [activeSheet, sheets.length]);

  const showToast = (msg, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50 transition-all duration-500 ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  const updateSheets = useCallback(
    (newSheets, action) => {
      setSheets(newSheets);
      if (action !== "NAVIGATE") {
        const newHistory = history.slice(0, historyIndex + 1);
        if (
          newHistory.length &&
          JSON.stringify(newHistory[newHistory.length - 1]) ===
            JSON.stringify(newSheets)
        )
          return;
        const maxHistory = 50;
        const finalHistory = [...newHistory, newSheets].slice(-maxHistory);
        setHistory(finalHistory);
        setHistoryIndex(finalHistory.length - 1);
      }
    },
    [history, historyIndex],
  );

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSheets(history[historyIndex - 1]);
      showToast("Undo successful");
    } else showToast("Nothing to undo", "error");
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSheets(history[historyIndex + 1]);
      showToast("Redo successful");
    } else showToast("Nothing to redo", "error");
  };

  const onCellValueChanged = useCallback(
    (event) => {
      const { id } = event.data;
      const updatedSheets = [...sheets];
      const newData = updatedSheets[activeSheet].data.map((row) =>
        row.id === id ? { ...event.data } : row,
      );
      updatedSheets[activeSheet] = {
        ...updatedSheets[activeSheet],
        data: newData,
      };
      updateSheets(updatedSheets, "CELL_EDIT");
    },
    [sheets, activeSheet, updateSheets],
  );

  const getRowId = useMemo(() => (params) => params.data.id, []);

  const handleUpdateColumns = useCallback(
    (newColumns) => {
      let updatedSheets = [...sheets];
      updatedSheets[activeSheet].columns = newColumns;
      const newFields = newColumns.map((c) => c.field);
      updatedSheets[activeSheet].data = updatedSheets[activeSheet].data.map(
        (row) => {
          const newRow = { id: row.id };
          newFields.forEach((field) => {
            newRow[field] = row[field] !== undefined ? row[field] : "";
          });
          return newRow;
        },
      );
      if (activeSheet === 0) setTemplateColumns(newColumns);
      updateSheets(updatedSheets, "COL_MANAGE");
      showToast("Columns updated successfully!");
    },
    [sheets, activeSheet, updateSheets],
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws, {
          defval: "",
          raw: false,
        });
        if (!jsonData.length) {
          showToast("Uploaded sheet is empty", "error");
          return;
        }
        const includeAttachment = window.confirm(
          "Include an 'Attachment' column?",
        );
        const columns = Object.keys(jsonData[0]).map((key) => ({
          headerName: key,
          field: key,
          dataType: "Text",
        }));
        const dataWithIds = jsonData.map((row) => {
          const newRow = { id: generateUniqueRowId(activeSheet), ...row };
          if (includeAttachment)
            newRow["Attachment"] = newRow["Attachment"] || "";
          return newRow;
        });
        if (
          includeAttachment &&
          !columns.find((c) => c.field === "Attachment")
        ) {
          columns.push({
            headerName: "Attachment",
            field: "Attachment",
            dataType: "Attachment",
          });
        }
        const updatedSheets = [...sheets];
        updatedSheets[activeSheet] = {
          ...updatedSheets[activeSheet],
          columns,
          data: dataWithIds,
        };
        if (activeSheet === 0) setTemplateColumns(columns);
        updateSheets(updatedSheets, "UPLOAD");
        showToast(`Data uploaded to ${updatedSheets[activeSheet].name}`);
      } catch (err) {
        console.error(err);
        showToast("Failed to parse file", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const addSheet = () => {
    const newSheetName = `Sheet ${sheets.length + 1}`;
    const newSheet = {
      name: newSheetName,
      columns: templateColumns.length ? [...templateColumns] : [],
      data: [],
    };
    updateSheets([...sheets, newSheet], "ADD_SHEET");
    setActiveSheet(sheets.length);
  };

  const addRow = () => {
    if (!currentSheet.columns.length) {
      showToast("No columns defined", "error");
      return;
    }
    const newRow = { id: generateUniqueRowId(activeSheet) };
    currentSheet.columns.forEach((col) => (newRow[col.field] = ""));
    if (gridRef.current?.api)
      gridRef.current.api.applyTransaction({ add: [newRow] });
    const updatedSheets = [...sheets];
    updatedSheets[activeSheet].data.push(newRow);
    updateSheets(updatedSheets, "ADD_ROW");
    showToast("Row added successfully");
  };

  const deleteSelectedRows = () => {
    if (!gridRef.current?.api) return;
    const selectedRows = gridRef.current.api.getSelectedRows();
    if (!selectedRows.length)
      return showToast("Select row(s) to delete", "error");
    gridRef.current.api.applyTransaction({ remove: selectedRows });
    const selectedIds = selectedRows.map((row) => row.id);
    const updatedSheets = [...sheets];
    const newData = updatedSheets[activeSheet].data.filter(
      (row) => !selectedIds.includes(row.id),
    );
    updatedSheets[activeSheet] = {
      ...updatedSheets[activeSheet],
      data: newData,
    };
    updateSheets(updatedSheets, "DELETE_ROWS");
    showToast("Row(s) deleted successfully");
  };

  const downloadGrid = () => {
    if (!gridRef.current?.api) return;
    gridRef.current.api.exportDataAsCsv({
      fileName: `${currentSheet.name}_Export.csv`,
      columnKeys: currentSheet.columns.map((col) => col.field),
    });
    showToast(`Sheet "${currentSheet.name}" exported successfully`);
  };

  const handleAskAI = async () => {
    setIsThinking(true);
    setAiResponse("");
    const cleanedData = currentSheet.data.map((row) => {
      const newRow = {};
      currentSheet.columns.forEach((col) => {
        newRow[col.headerName] = row[col.field];
      });
      return newRow;
    });
    try {
      const response = await fetch("http://localhost:5000/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: aiQuestion,
          data: cleanedData,
          columns: currentSheet.columns.map((c) => c.headerName),
        }),
      });
      const result = await response.json();
      setAiResponse(result.answer || "No answer returned. Please try again.");
    } catch (err) {
      console.error("AI API call failed:", err);
      setAiResponse(
        "Sorry, I could not process that request. Please check the backend service.",
      );
    } finally {
      setIsThinking(false);
    }
  };

  const enhancedColumns = useMemo(() => {
    return currentSheet.columns.map((col) => {
      let colDef = {
        ...col,
        headerComponent: GridHeader,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        sortable: true,
        resizable: true,
        editable: true,
        minWidth: 140,
        dataType: col.dataType || "Text",
      };

      switch (colDef.dataType) {
        case "Attachment":
          colDef.cellRenderer = (params) => (
            <AttachmentCellRenderer
              {...params}
              sheetName={currentSheet.name}
              dbInfo={{
                server: "YOUR_SERVER",
                database: "YOUR_DB",
                schema: "dbo",
                useTrustedConnection: true,
                apiBase: "http://localhost:5000",
              }}
              api={gridRef.current?.api}
            />
          );
          colDef.editable = false;
          colDef.filter = false;
          colDef.floatingFilter = false;
          colDef.minWidth = 220;
          colDef.autoHeight = true;
          break;
        case "Number":
          colDef.filter = "agNumberColumnFilter";
          colDef.valueFormatter = (params) =>
            params.value && !isNaN(Number(params.value))
              ? Number(params.value).toLocaleString()
              : params.value;
          colDef.type = "numericColumn";
          break;
        case "Date":
          colDef.filter = "agDateColumnFilter";
          colDef.cellEditor = "agTextCellEditor";
          break;
        case "Boolean":
          colDef.cellRenderer = "agCheckboxCellRenderer";
          colDef.cellEditor = "agSelectCellEditor";
          colDef.cellEditorParams = { values: [true, false, ""] };
          colDef.filter = "agSetColumnFilter";
          break;
        case "Text":
        default:
          break;
      }
      return colDef;
    });
  }, [currentSheet.columns, currentSheet.name]);

  const defaultColDef = useMemo(
    () => ({
      editable: true,
      sortable: true,
      resizable: true,
      floatingFilter: true,
    }),
    [],
  );
  const isUndoPossible = historyIndex > 0;
  const isRedoPossible = historyIndex < history.length - 1;

  return (
    <div className="flex flex-col w-full h-[90vh] p-4 bg-gray-50 rounded shadow-xl relative">
      <div
        ref={tabsRef}
        className="flex gap-1 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
      >
        <AnimatePresence initial={false}>
          {sheets.map((sheet, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="relative flex items-center gap-1"
            >
              {editingSheet === idx ? (
                <input
                  autoFocus
                  defaultValue={sheet.name}
                  onBlur={() => setEditingSheet(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingSheet(null)}
                  className="px-2 py-1 border rounded w-32 font-semibold"
                />
              ) : (
                <button
                  onClick={() => setActiveSheet(idx)}
                  onDoubleClick={() => setEditingSheet(idx)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap text-sm ${idx === activeSheet ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700"}`}
                >
                  {sheet.name}{" "}
                  {sheets.length > 1 && (
                    <X
                      size={14}
                      className="ml-1 text-gray-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <button
          onClick={addSheet}
          className="px-3 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 shadow hover:scale-[1.02] transition-transform text-sm font-semibold"
        >
          <Plus size={16} /> Add Sheet
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform font-semibold text-sm">
            <Upload size={18} /> Upload Excel
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              onClick={(e) => (e.target.value = null)}
            />
          </label>
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform font-semibold text-sm"
            title="Bulk upload and link attachments"
          >
            <Paperclip size={18} /> Bulk Upload
          </button>
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-lg shadow-md hover:scale-[1.02] transition-transform font-semibold text-sm"
            title="Ask AI a question about your data"
          >
            <FileText size={18} /> Ask AI
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={undo}
            disabled={!isUndoPossible}
            className={`p-2 rounded-lg ${isUndoPossible ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!isRedoPossible}
            className={`p-2 rounded-lg ${isRedoPossible ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
            title="Redo"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            title="Add Row"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={deleteSelectedRows}
            className="flex items-center gap-2 text-sm bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
            title="Delete Selected Rows"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsColumnManagerOpen(true)}
            className="flex items-center gap-2 text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            title="Manage Columns"
          >
            <Settings size={16} /> Columns
          </button>
          <button
            onClick={downloadGrid}
            className="flex items-center gap-2 text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            title="Download as CSV"
          >
            <DownloadCloud size={16} />
          </button>
        </div>
      </div>

      <div className="ag-theme-alpine w-full h-full flex-grow border rounded-lg shadow-inner">
        <AgGridReact
          ref={gridRef}
          columnDefs={enhancedColumns}
          rowData={currentSheet.data}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          animateRows={true}
          editType="fullRow"
          onCellValueChanged={onCellValueChanged}
          getRowId={getRowId}
          pagination={true}
          paginationPageSize={pageSize}
        />
      </div>

      <AnimatePresence>
        {isColumnManagerOpen && (
          <ColumnManagerModal
            columns={currentSheet.columns}
            setColumns={handleUpdateColumns}
            onClose={() => setIsColumnManagerOpen(false)}
          />
        )}
        {isAIAssistantOpen && (
          <AIAssistantModal
            onAsk={handleAskAI}
            onClose={() => setIsAIAssistantOpen(false)}
            isThinking={isThinking}
            response={aiResponse}
            question={aiQuestion}
            setQuestion={setAiQuestion}
          />
        )}
        {isBulkUploadOpen && (
          <BulkUploadDialog
            currentSheet={currentSheet}
            sheets={sheets}
            activeSheet={activeSheet}
            updateSheets={updateSheets}
            showToast={showToast}
            onClose={() => setIsBulkUploadOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DynamicWorkbook;
