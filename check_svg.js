import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto(`file://${path.resolve('ci-cd.html')}`);
  await page.waitForTimeout(4000); // Wait for mermaid to render
  const element = await page.$('.mermaid svg');
  if (element) {
    const textContent = await element.evaluate(el => el.textContent || el.innerHTML);
    console.log("SVG CONTENT PREVIEW:", textContent.substring(0, 500));
  } else {
    console.error("Failed to find SVG element.");
  }
  await browser.close();
})();
