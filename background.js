// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.scrapedData) {
      // Store the scraped data in the background script
      chrome.storage.local.set({ scrapedData: message.scrapedData });
    } else if (message.initiateDownload) {
      // Retrieve the scraped data from the background script
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
    }
  });
  
  // Utility function to convert a string to an ArrayBuffer
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
  