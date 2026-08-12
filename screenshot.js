const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  
  // Go to signup
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'signup-local.png' });
  
  await browser.close();
  console.log("Screenshot saved to signup-local.png");
})();
