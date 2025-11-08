// src/services/folderService.js
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const API_URL = process.env.REACT_APP_API_URL;

export const fetchFolders = async (orgId, token) => {
  if (!orgId || !token) return [];
  try {
    const res = await fetch(`${API_URL}/folders/${orgId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.success && data.folders ? data.folders : [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const createFolder = async (orgId, token, folderName) => {
  const res = await fetch(`${API_URL}/folders/${orgId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ folder_name: folderName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create folder");
  return data;
};

export const deleteFolder = async (folderId,org_id, token) => {
  const res = await fetch(`${API_URL}/folders/${org_id}/${folderId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete folder");
};

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

// src/components/Sidebar/services/excelService.js
export const createExcelAPI = async (folderId, token, excelName) => {
  const res = await fetch(`${API_URL}/excels/${folderId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ excel_name: excelName }),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to create Excel");
  }

  return res.json();
};

// src/components/Sidebar/services/excelService.js
export const listExcelsAPI = async (folderId, token, status = "active") => {
  const res = await fetch(
    `${API_URL}/excels/${folderId}?status=${status}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Failed to fetch excels");
  }

  const data = await res.json();
  return data.excels || [];
};


