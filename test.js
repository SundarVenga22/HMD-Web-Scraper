import puppeteer from "puppeteer";
import mysql from "mysql2";

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Vsimrcaf1$!',
    database: 'hmd_app'
}).promise()

async function insertDevice([sectionHeading, specHeading, body]) {
    await pool.query(`
    INSERT INTO headset (sectionHeading, specHeading, body)
    VALUES (?, ?, ?)
    `, [sectionHeading, specHeading, body])
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

    await page.waitForFunction(() => document.querySelectorAll('#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.mainContent > div.mainPanel > div.comparisonTableContainer > div:nth-child(1) > table tr').length >= 20);

    const table = await page.$$eval('#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.mainContent > div.mainPanel > div.comparisonTableContainer > div:nth-child(1) > table tr', rows => {
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => column.innerText);
        });
    });

    for (const t of table) {
        await insertDevice(t);
    }

    // Closing browser
    await browser.close()
}

start()