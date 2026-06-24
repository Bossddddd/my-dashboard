import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 3840, height: 10000 }, 
    deviceScaleFactor: 2 
  });
  const page = await context.newPage();
  
  // Capture console messages to see what mermaid is complaining about
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto(`file://${path.resolve('ci-cd.html')}`);
  await page.waitForTimeout(4000); // Wait for mermaid to render
  const element = await page.$('.mermaid svg');
  if (element) {
    await element.screenshot({ path: 'public/ci-cd-diagram.png', omitBackground: true });
    console.log("Screenshot saved to public/ci-cd-diagram.png");
  } else {
    console.error("Failed to find SVG element.");
  }
  await browser.close();
})();
