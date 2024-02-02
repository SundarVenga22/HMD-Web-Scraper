import { Cluster } from "puppeteer-cluster";
import mysql from "mysql2";

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Vsimrcaf1$!',
    database: 'hmd_app'
}).promise()

async function insertDevice(headset, [sectionHeading, specHeading, body]) {
  await pool.query(`
  INSERT INTO ${headset} (sectionHeading, specHeading, body)
  VALUES (?, ?, ?)
  `, [sectionHeading, specHeading, body])
}

async function start() {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    monitor: true,
    puppeteerOptions: {
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);

    await page.waitForFunction(() => document.querySelectorAll('#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.mainContent > div.mainPanel > div.comparisonTableContainer > div:nth-child(1) > table tr').length >= 20);

    const table = await page.$$eval('#root > div > div.pageContainer > div.pageOuter > div.page > div.pageInner > div.mainContent > div.mainPanel > div.comparisonTableContainer > div:nth-child(1) > table tr', rows => {
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => column.innerText);
        });
    });

    return table;
  });

  try{
    const headset1 = await cluster.execute('https://vr-compare.com/headset/pico5');
    for (const t of headset1) {
      await insertDevice('pico5',t);
    }
  
    const headset2 = await cluster.execute('https://vr-compare.com/headset/pico5promax');
    for (const t of headset2) {
      await insertDevice('pico5promax',t);
    }
  
    const headset3 = await cluster.execute('https://vr-compare.com/headset/pimaxreality12kqled');
    for (const t of headset3) {
      await insertDevice('pimaxreality12kqled',t);
    }
  
    const headset4 = await cluster.execute('https://vr-compare.com/headset/xrealair2ultra');
    for (const t of headset4) {
      await insertDevice('xrealair2ultra',t);
    }
  }
  catch(err) {
    //Handle error
    console.log("error executing");
  }

  await cluster.idle();
  await cluster.close();
}

start()