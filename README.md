# Puppeteer Extension

Puppeteer Extension is software used for browser automation.
Its main goal is to support the API of [puppeteer](https://github.com/puppeteer/puppeteer),
while 3rd party websites cannot detect browser automation (especially with Chromium).
It works by using the default browser with GUI (that normal users use),
which hast the extension of this repository installed, 
that communicates to the controller - a NodeJS/express app.

Since the browser will be run without telling it,
that it will be automated, a real headless mode isn't supported.
I personally use it with Xvfb and Chromium on a RaspberryPI.

## Installation

### Browser Extension

Since there is no UI yet, you might want to configure the URL of the middleware
in [extension/background.ts](extension/background.ts) to connect to the NodeJS app. 

1. Compile the extension: `npm run build:extension`
2. Open [chrome://extensions/](chrome://extensions/).
3. Enable developer mode.
4. Click "Load unpacked" (recommended for Chrome) or "Pack extension" (recommended for Chromium).
5. Choose the `dist/extension` directory that was created in step 1 as extension root.
6. *If extension was packed in step 4:* Drag and Drop the created `.crx` file into Chromium.

### NodeJS

`npm install puppeteer-extension`
