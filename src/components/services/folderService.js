// src/services/folderService.js
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// ----------------------------
// 📁 FOLDERS
// ----------------------------
export const fetchFolders = async (orgId, token) => {
  if (!orgId || !token) return [];
  try {
    const res = await fetch(`${API_URL}/folders/${orgId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.success && data.folders ? data.folders : [];
  } catch (err) {
    console.error("fetchFolders Error:", err);
    return [];
  }
};

export const createFolder = async (orgId, token, folderName) => {
  const res = await fetch(`${API_URL}/folders/${orgId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_name: folderName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create folder");
  return data;
};

export const deleteFolder = async (folderId, orgId, token) => {
  const res = await fetch(`${API_URL}/folders/${orgId}/${folderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete folder");
};

// ZIP download
export const downloadFolder = async (folder) => {
  if (!folder.files?.length) throw new Error("Folder is empty");
  const zip = new JSZip();

  for (const file of folder.files) {
    const ws = XLSX.utils.aoa_to_sheet(file.data.length ? file.data : [[]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    zip.file(`${file.name || "New File"}.xlsx`, wbout);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${folder.folder_name || "New Folder"}.zip`);
};

// ----------------------------
// 📊 EXCELS
// ----------------------------
export const createExcelAPI = async (folderId, token, excelName) => {
  const res = await fetch(`${API_URL}/excels/${folderId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ excel_name: excelName }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create Excel");
  return data;
};

export const listExcelsAPI = async (folderId, token, status = "active") => {
  const res = await fetch(`${API_URL}/excels/${folderId}?status=${status}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch Excels");
  return data.excels || [];
};

// ----------------------------
// 📑 SHEETS
// ----------------------------

// Get all sheets for a given Excel
export const listSheetsByExcelAPI = async (excelId, token) => {
  const res = await fetch(`${API_URL}/sheets/${excelId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch Sheets");
  return data.sheets || [];
};

// Create a new sheet under an Excel
export const createSheetAPI = async (excelId,org_id, token, sheetName) => {
  const res = await fetch(`${API_URL}/sheets/${excelId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sheet_name: sheetName,org_id:org_id }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create Sheet");
  return data;
};

// Soft Delete Sheet (Admin)
export const deleteSheetAPI = async (sheetId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/sheets/${sheetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
};

// Get a sheet by ID
export const getSheetByIdAPI = async (sheetId, token) => {
  const res = await fetch(`${API_URL}/sheets/view/${sheetId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch sheet");
  return data.sheet;
};

// ----------------------------
// 📋 COLUMNS
// ----------------------------
export const createColumnsAPI = async (sheetId, token, columns) => {
  const res = await fetch(`${API_URL}/columns/${sheetId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ columns }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add Columns");
  return data;
};

export const updateColumnsAPI = async (sheetId, token, columns) => {
  try {
    const res = await axios.put(
      `${API_URL}/columns/${sheetId}`,
      { columns },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
};

export const deleteColumnAPI = async (sheetId, columnId, token) => {
  const res = await fetch(`${API_URL}/columns/${sheetId}/${columnId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete Column");
};

// rename this line
export const getSheetByExcelIdAPI = async (excelId, token) => {
  const res = await fetch(`${API_URL}/sheets/sheet/${excelId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get sheets");
  const data = await res.json();
  return data;
};



export const listColumnsAPI = async (sheet_id, token) => {
  const res = await fetch(
    `${API_BASE_URL}/api/columns/${sheet_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
};
