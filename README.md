# Puppeteer Extension

[![npm puppeteer-extension package](https://img.shields.io/npm/v/puppeteer-extension.svg)](https://npmjs.org/package/puppeteer-extension)

Puppeteer Extension is software used for browser automation. Its main goal is to support the API
of [puppeteer](https://github.com/puppeteer/puppeteer), while 3rd party websites cannot detect browser automation (
especially with Chromium). It works by using the default browser with GUI (that normal users use), which has the browser
extension of this repository installed, that communicates to the controller - a NodeJS/express app.

Since the browser will be run without telling it, that it will be automated, a real headless mode isn't supported. I
personally use it with Xvfb and Chromium on a RaspberryPI.

## Installation

### Browser Extension

> **Note:** Since there is no UI yet, you first might want to configure the URL of the middleware
in [extension/background.ts](extension/background.ts) to connect to the NodeJS app.

1. Compile the extension: `npm run build:extension`
2. Open [chrome://extensions/](chrome://extensions/).
3. Enable developer mode.
4. Click "Load unpacked" (recommended for Chrome) or "Pack extension" (recommended for Chromium).
5. Choose the `dist/extension` directory that was created in step 1 as extension root.
6. *If extension was packed in step 4:* Drag and Drop the created `.crx` file into Chromium.

### NodeJS

`npm install puppeteer-extension`

## Usage

Create the browser connector and add the middleware to an express server. Not perfect at all, but a quick solution.

```typescript
import puppeteer from 'puppeteer-extension';
import * as express from 'express';

// server for communication between browser extension and NodeJS
const app = express();
app.use(express.json());
const server = app.listen(8088);

puppeteer.launch({
  executablePath: '/path/to/chrome-or-chromium'
}).then(async browser => {
  // Register communication endpoint
  app.use('/api/bridge/puppeteer', browser.middleware());

  // do something with puppeteer
  const page = await browser.newPage();
  await page.goto('https://example.com');

  const content = await page.evaluate('document.documentElement.innerHTML');
  if(content.includes('<a')) {
    await page.click('a');
  }

  // shut everything down
  await page.close();
  browser.close();
  server.close();
});
```
