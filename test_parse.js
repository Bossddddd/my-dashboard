import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto(`file://${path.resolve('ci-cd.html')}`);
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    const text = document.querySelector('.mermaid').textContent;
    try {
      mermaid.parse(text);
      console.log("Parse OK");
    } catch (e) {
      console.log("PARSE ERROR:", e.message || e);
    }
  });

  await browser.close();
})();
