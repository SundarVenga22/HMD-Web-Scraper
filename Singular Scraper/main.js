const { spawn } = require('child_process');
const scraperProcess = spawn('node', ['scraper.js']);

scraperProcess.on('close', (code) => {
    if (code === 0) {
        const pythonProcess = spawn('python', ['dataclean.py']);
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('Conversion to Excel complete.');
            } else {
                console.error('Error in Python script.');
            }
        });
    } else {
        console.error('Error in web scraper.');
    }
});
