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
in [extension/background.js](extension/background.js) to connect to the NodeJS app. 

1. Open [chrome://extensions/](chrome://extensions/).
2. Enable developer mode.
3. Pack Extension (Choose the extension directory of this repository as extension root).
4. Drag and Drop the created `.crx` file into Chrome.

### NodeJS

`npm install puppeteer-extension`
