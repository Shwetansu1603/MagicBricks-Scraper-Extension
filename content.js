function scrapeData() {
  const propertyDivs = Array.from(document.querySelectorAll('.mb-srp__card'));

  if (propertyDivs.length === 0) {
    return null;
  }

  const data = propertyDivs.map((div) => {
    const propertyData = {
      'Details': 'N/A',
      'Location': 'N/A',
      'Price per Size': 'N/A',
      'Price': 'N/A'
    };

    const detailsLocation = div.querySelector('h2.mb-srp__card--title');
    if (detailsLocation) {
      const detailsLocationText = detailsLocation.textContent.trim();
      let details, location;
      if (detailsLocationText.includes('for')) {
        [details, location] = detailsLocationText.split('for', 2);
      } else {
        details = detailsLocationText;
        location = '';
      }
      propertyData['Details'] = details.trim();
      propertyData['Location'] = location.trim();
    }

    const summaryList = div.querySelector('div.mb-srp__card__summary__list');
    if (summaryList) {
      const labels = Array.from(summaryList.querySelectorAll('div.mb-srp__card__summary--label'));
      const values = Array.from(summaryList.querySelectorAll('div.mb-srp__card__summary--value'));

      labels.forEach((label, index) => {
        const labelText = label.textContent.trim();
        const valueText = values[index].textContent.trim();
        if (labelText !== '') {
          propertyData[labelText] = valueText;
        }
      });
    }

    const pricePerSizeElement = div.querySelector('div.mb-srp__card__price--size');
    if (pricePerSizeElement) {
      propertyData['Price per Size'] = pricePerSizeElement.textContent.trim();
    }

    const priceElement = div.querySelector('div.mb-srp__card__price--amount');
    if (priceElement) {
      propertyData['Price'] = priceElement.textContent.trim();
    }

    return propertyData;
  });

  return data;
}

// Send the scraped data to the popup script
chrome.runtime.sendMessage({ data: scrapeData() });