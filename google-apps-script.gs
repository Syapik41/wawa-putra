function doPost(event) {
  if (!event || !event.postData || !event.postData.contents) {
    throw new Error('Missing wish submission.');
  }

  const submission = JSON.parse(event.postData.contents);
  const name = cleanText(submission.name, 80);
  const wish = cleanText(submission.wish, 300);
  if (!name || !wish) {
    throw new Error('A name and wish are required.');
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Wishes');
  if (!sheet) sheet = spreadsheet.insertSheet('Wishes');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Received at', 'Name', 'Wish']);
  }
  sheet.appendRow([new Date(), safeCell(name), safeCell(wish)]);

  return ContentService
    .createTextOutput(JSON.stringify({ saved: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function safeCell(value) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}
