
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
    const checkCellSelector = `#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.mainContent > div.mainPanel > div.comparisonTableContainer > div:nth-child(1) > table > tbody > tr:nth-child(${indexA})`;
    const cellSelector = `#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.mainContent > div.mainPanel > div.comparisonTableContainer > div:nth-child(1) > table > tbody > tr:nth-child(${indexA}) > td.${indexB}`;
    // Evaluating text content
    check_data = await page.$eval(checkCellSelector, (checkCell) => checkCell.textContent);
    if (check_data){
        data = await page.$eval(cellSelector, (cell) => cell.textContent);
    }
    else{
        data = "n/a";
    }
    //console.log(data);
    // Scalable Vector Graphics (SVG) element used at multipe columns seen in array svg_rows
    // Either Checkmark (0 0 512 512) or Cross (0 0 352 512)
    // Converting to Yes or No
    const svg_rows = [11, 24, 34, 35, 36, 37, 38, 42, 43, 44, 47]
    if (svg_rows.includes(indexA)) {
        if (indexB == "bodyCell") {
            const dataHTML = await page.$eval(cellSelector, (cell) => cell.innerHTML);
            if (dataHTML.includes('viewBox="0 0 512 512"')) {
                 data = 'Yes'
            }
            else {
                 data = 'No'
            }
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
    const indexB_cell_type = [
        "specHeadingCell",
        "bodyCell",
    ]
    // Iterating through rows
    for (let i = 1; i < 65; i++) {
        // Printing row index
        console.log(i)
        // Iterating through columns
        for (let x = 0; x < 2; x++) {
            // Extracting data
            const data = await extractData(page, i, indexB_cell_type[x]);
 
            // Inputting data in array to return
            vr_results.push(data)
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
    await page.goto("https://vr-compare.com/headset/varjoxr-4")

    // Scraping data and writing to .txt file
    const vrInfo = await scrapeData(page)
    await fs.writeFile("VR_Detailed_Info.txt", vrInfo.join("\r\n"))

    // Closing browser
    await browser.close()
}

start()