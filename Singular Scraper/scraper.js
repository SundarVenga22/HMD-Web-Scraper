/**
 * This program is a Web Scraper that harvests data from the VR-Compare website, 
 * in order to build latency data for headsets of interest to DRDC and Future Aircrew training (FAcT) immersive training devices
 * 
 * This program uses Node.JS and Puppeteer to scrape data, and build an array containing information on VR/AR Headsets
 * The output also includes a .txt file which can then be further analyzed, edited, and converted into other data formats
 * 
 * @author: Sundar Vengadeswaran, Senior Lab Assistant, RCAF Aerospace Warfare Centre (AWC), DND
 */

// Puppeteer needs these require statements in order to run
const puppeteer = require('puppeteer')
const fs = require('fs/promises')

/**
 * Extracts Data from a specific row and column in the VR-Compare main table
 * 
 * @param {newPage} page - The browser page that has loaded VR-Compare
 * @param {number} indexA - Table row index
 * @param {number} indexB - Table column index 
 * @returns {String} The text content of the indexed table element
 */
async function extractData(page, indexA, indexB) {
    // CSS Selector of Table elements
    const cellSelector = `#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.headsetsTableContainer > div.infinite-scroll-component__outerdiv > div > table > tbody > tr:nth-child(${indexA}) > td:nth-child(${indexB})`;
    // Evaluating text content
    data = await page.$eval(cellSelector, (cell) => cell.textContent);

    // Scalable Vector Graphics (SVG) element used at columns 4 and 12
    // Either Checkmark (0 0 512 512) or Cross (0 0 352 512)
    // Converting to Yes or No
    if (indexB == 4 || indexB == 12) {
        const dataHTML = await page.$eval(cellSelector, (cell) => cell.innerHTML);
        if (dataHTML.includes('viewBox="0 0 512 512"')) {
             data = 'Yes'
        }
        else {
             data = 'No'
        }
    }
    return data;
}

/**
 * Scrolls down VR-Compare website to continuously load data that can be extracted 
 * Loops through table and calls extractData to input VR-Compare main table data into an array
 * 
 * @param {newPage} page - The browser page that has loaded VR-Compare
 * @returns Array containing VR-Compare main table data
 */
async function scrapeData(page) {
    // Initializing array to return
    const vr_results = []
    // Array of rows containing ads on VR-Compare (No text content)
    const ad_rows = [15, 31, 47, 63, 79, 95, 111, 127, 143, 159, 175, 191, 207, 223, 239, 255]
    // Iterating through rows
    for (let i = 1; i < 255; i++) {
        // Printing row index
        console.log(i)
        // Iterating through columns
        for (let x = 2; x < 13; x++) {
            // Continuing without scraping if row index is a row containing an ad
            if (ad_rows.includes(i)){
                continue
            }
            else{
                // Extracting data
                const data = await extractData(page, i, x); 
                // Inputting data in array to return
                vr_results.push(data)
            }
        }
        // Scrolling down 100 pixels every 100 ms to continuously load table
        try {
            await page.evaluate('window.scrollBy(0, 100)')
            await page.waitForTimeout(100)
          } catch(e) { }
    }
    return vr_results
}

/**
 * Initializes browser page with VR-Compare URL
 * Calls scrapeData to begin scraping process and writes to .txt file
 */
async function start() {
    // Initializing browser and new page
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    const page = await browser.newPage()
    page.setViewport({ width: 1280, height: 926 });

    // Adding url to page
    await page.goto("https://vr-compare.com/")

    // Scraping data and writing to .txt file
    const vrInfo = await scrapeData(page)
    await fs.writeFile("VR_Info.txt", vrInfo.join("\r\n"))

    // Closing browser
    await browser.close()
}

start()