/**
 * Post-it Todo List CRUD API (Google Apps Script)
 * Sheet ID: 1D8ewPdSBRpnivMxCmcOI2v-yOHECiFylzYrSri0edHI
 * Columns: timestamp | datetime | category | content | color | state | order
 */

const SPREADSHEET_ID = "1D8ewPdSBRpnivMxCmcOI2v-yOHECiFylzYrSri0edHI";
const SHEET_NAME = "Sheet1";

const HEADERS = ["timestamp", "datetime", "category", "content", "color", "state", "order"];

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

// ==========================================
// 1. GET 요청 핸들러 (READ / 전체 조회)
// ==========================================
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createJsonResponse({ success: true, data: [] });
    }

    // 헤더명의 공백을 trim하여 표준화
    const rawHeaders = data[0];
    const headers = rawHeaders.map(h => String(h).trim());
    const rows = data.slice(1);
    
    const result = rows.map((row, index) => {
      const item = { rowIndex: index + 2 };
      headers.forEach((header, colIndex) => {
        item[header] = row[colIndex];
      });
      return item;
    });

    return createJsonResponse({ success: true, data: result });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

// ==========================================
// 2. POST 요청 핸들러 (CREATE, UPDATE, DELETE, CLEARALL)
// ==========================================
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const sheet = getSheet();

    // ----------------------------------------
    // [CREATE] 새 포스트잇 추가
    // ----------------------------------------
    if (action === "create") {
      const inputData = contents.data || {};
      const newTimestamp = inputData.timestamp || Date.now().toString();
      const newDatetime = inputData.datetime || new Date().toISOString();

      sheet.appendRow([
        newTimestamp,
        newDatetime,
        inputData.category || "todo",
        inputData.content || "",
        inputData.color || "yellow",
        inputData.state !== undefined ? inputData.state : "active",
        inputData.order !== undefined ? inputData.order : 0
      ]);

      return createJsonResponse({
        success: true,
        message: "Created successfully",
        data: { timestamp: newTimestamp, datetime: newDatetime }
      });
    }

    // ----------------------------------------
    // [UPDATE] 기존 포스트잇 수정 (timestamp 기준)
    // ----------------------------------------
    if (action === "update") {
      const inputData = contents.data || {};
      const targetTs = String(inputData.timestamp || "").trim();
      if (!targetTs) {
        return createJsonResponse({ success: false, error: "timestamp is required for update" });
      }

      const data = sheet.getDataRange().getValues();
      const rawHeaders = data[0];
      const headers = rawHeaders.map(h => String(h).trim());
      const timestampColIdx = headers.indexOf("timestamp");

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][timestampColIdx]).trim() === targetTs) {
          const rowNum = i + 1;

          if (inputData.category !== undefined) sheet.getRange(rowNum, headers.indexOf("category") + 1).setValue(inputData.category);
          if (inputData.content !== undefined) sheet.getRange(rowNum, headers.indexOf("content") + 1).setValue(inputData.content);
          if (inputData.color !== undefined) sheet.getRange(rowNum, headers.indexOf("color") + 1).setValue(inputData.color);
          if (inputData.state !== undefined) sheet.getRange(rowNum, headers.indexOf("state") + 1).setValue(inputData.state);
          if (inputData.order !== undefined) sheet.getRange(rowNum, headers.indexOf("order") + 1).setValue(inputData.order);
          if (inputData.datetime !== undefined) sheet.getRange(rowNum, headers.indexOf("datetime") + 1).setValue(inputData.datetime);

          return createJsonResponse({ success: true, message: "Updated successfully" });
        }
      }
      return createJsonResponse({ success: false, error: "Item not found with timestamp: " + targetTs });
    }

    // ----------------------------------------
    // [DELETE] 단일 항목 삭제 (timestamp 기준, 공백 안전 처리)
    // ----------------------------------------
    if (action === "delete") {
      const inputData = contents.data || {};
      const targetTs = String(inputData.timestamp || "").trim();
      if (!targetTs) {
        return createJsonResponse({ success: false, error: "timestamp is required for delete" });
      }

      const data = sheet.getDataRange().getValues();
      const rawHeaders = data[0];
      const headers = rawHeaders.map(h => String(h).trim());
      const timestampColIdx = headers.indexOf("timestamp");

      // 뒤에서부터 검색하여 삭제
      for (let i = data.length - 1; i >= 1; i--) {
        if (String(data[i][timestampColIdx]).trim() === targetTs) {
          sheet.deleteRow(i + 1);
          return createJsonResponse({ success: true, message: "Deleted successfully" });
        }
      }
      return createJsonResponse({ success: false, error: "Item not found with timestamp: " + targetTs });
    }

    // ----------------------------------------
    // [CLEAR_ALL] 목록 전체 삭제 (헤더 제외)
    // ----------------------------------------
    if (action === "clearAll") {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return createJsonResponse({ success: true, message: "Cleared all items" });
    }

    return createJsonResponse({ success: false, error: "Invalid action" });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
