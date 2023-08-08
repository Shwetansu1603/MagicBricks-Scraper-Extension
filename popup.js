// Add a click event listener to the button
document.getElementById('scrapeButton').addEventListener('click', () => {
  // Show "Scraping in progress" message
  document.getElementById('progressMessage').classList.remove('hidden');
  document.getElementById('downloadButton').classList.add('hidden');

  // Execute the content script to scrape the data from the active tab
  chrome.tabs.executeScript({
    file: 'content.js'
  });
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.data) {
    // Hide "Scraping in progress" message
    document.getElementById('progressMessage').classList.add('hidden');

    // Show the "Download Excel" button
    document.getElementById('downloadButton').classList.remove('hidden');

    // Store the scraped data in the extension's storage
    chrome.storage.local.set({ scrapedData: message.data });
  }
});

// Add a click event listener to the "Download Excel" button
document.getElementById('downloadButton').addEventListener('click', () => {
  // Retrieve the scraped data from the extension's storage
  chrome.storage.local.get(['scrapedData'], (result) => {
    const scrapedData = result.scrapedData;

    if (scrapedData) {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Create the worksheet from the scraped data
      const worksheet = XLSX.utils.json_to_sheet(scrapedData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Scraped Data');

      // Generate the Excel file
      const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

      // Convert the binary data to a Blob
      const blobData = new Blob([s2ab(excelData)], { type: 'application/octet-stream' });

      // Save the Excel file using the Downloads API
      chrome.downloads.download({
        url: URL.createObjectURL(blobData),
        filename: 'scraped_data.xlsx',
      });
    }
  });
});

// Utility function to convert a string to an ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}
