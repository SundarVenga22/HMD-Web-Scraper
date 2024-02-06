# HMD-Web-Scraper
Web scrapes data on VR/MR headsets to be used in a web app

Requires installation of:
- puppeteer cluster: npm install puppeteer-cluster
- mysql server extension: npm install mysql

MAIN FILE
detailedScraper.js:
- Uses Puppeteer Cluster to scrape 4 HMD pages in an efficient manner
- loads HMD data into mySql server
