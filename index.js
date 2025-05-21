const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/eligibility', async (req, res) => {
    const goid = req.query.goid || 'GO5900';
    try {
        const browser = await puppeteer.launch({
            headless: true,  // Use false for local testing
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const page = await browser.newPage();

        // Set a real browser User-Agent!
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://www.grants.gov.au/Search/GoAdvancedSearchForm?Type=Go&GoType=published&AgencyStatus=0', { waitUntil: 'domcontentloaded', timeout: 0 });
        const html = await page.content();
        require('fs').writeFileSync('debug.html', html);

        // Enter GOID and submit
        await page.waitForSelector('#form-GoId', { visible: true, timeout: 15000 });
        await page.focus('#form-GoId');
        await page.evaluate(() => { document.querySelector('#form-GoId').value = ''; });
        await page.type('#form-GoId', goid, { delay: 80 });
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

        // Scrape eligibility
        const eligibilityText = await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            const eligibilitySpan = spans.find(span => span.textContent.trim() === 'Eligibility:');
            if (!eligibilitySpan) return '';
            const listDescDiv = eligibilitySpan.closest('div.list-desc');
            if (!listDescDiv) return '';
            const innerDiv = listDescDiv.querySelector('div.list-desc-inner');
            if (!innerDiv) return '';
            return Array.from(innerDiv.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean).join('\n');
        });

        await browser.close();
        res.json({ goid, eligibility: eligibilityText || 'Not found.' });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.get('/rules', async (req, res) => {
    const goid = req.query.goid || 'GO5900';
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://www.grants.gov.au/Search/GoAdvancedSearchForm?Type=Go&GoType=published&AgencyStatus=0', { waitUntil: 'domcontentloaded', timeout: 0 });
        const html = await page.content();
        require('fs').writeFileSync('debug.html', html);

        // Enter GOID and submit
        await page.waitForSelector('#form-GoId', { visible: true, timeout: 15000 });
        await page.focus('#form-GoId');
        await page.evaluate(() => { document.querySelector('#form-GoId').value = ''; });
        await page.type('#form-GoId', goid, { delay: 80 });
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

        // Scrape application rules
        const rulesText = await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            const rulesSpan = spans.find(span => span.textContent.trim().includes('Instructions for Application Submission'));
            if (!rulesSpan) return '';
            const listDescDiv = rulesSpan.closest('div.list-desc');
            if (!listDescDiv) return '';
            const innerDiv = listDescDiv.querySelector('div.list-desc-inner');
            if (!innerDiv) return '';
            return Array.from(innerDiv.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean).join('\n');
        });

        await browser.close();
        res.json({ goid, rules: rulesText || 'Not found.' });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.get('/other', async (req, res) => {
    const goid = req.query.goid || 'GO5900';
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://www.grants.gov.au/Search/GoAdvancedSearchForm?Type=Go&GoType=published&AgencyStatus=0', { waitUntil: 'domcontentloaded', timeout: 0 });
        const html = await page.content();
        require('fs').writeFileSync('debug.html', html);

        // Enter GOID and submit
        await page.waitForSelector('#form-GoId', { visible: true, timeout: 15000 });
        await page.focus('#form-GoId');
        await page.evaluate(() => { document.querySelector('#form-GoId').value = ''; });
        await page.type('#form-GoId', goid, { delay: 80 });
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });

        // Scrape application rules
        const rulesText = await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            const rulesSpan = spans.find(span => span.textContent.trim().includes('Other Instructions'));
            if (!rulesSpan) return '';
            const listDescDiv = rulesSpan.closest('div.list-desc');
            if (!listDescDiv) return '';
            const innerDiv = listDescDiv.querySelector('div.list-desc-inner');
            if (!innerDiv) return '';
            return Array.from(innerDiv.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean).join('\n');
        });

        await browser.close();
        res.json({ goid, rules: rulesText || 'Not found.' });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Puppeteer API listening on port', PORT);
});
