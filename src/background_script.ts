// Put all the javascript code here, that you want to execute in background.

import browser from "webextension-polyfill";

async function openApp() {
  await browser.tabs.create({
    url: "app.html",
  });
}

browser.action.onClicked.addListener(openApp);
