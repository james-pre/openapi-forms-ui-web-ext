import browser from "webextension-polyfill";

async function openApp() {
  await browser.tabs.create({
    url: "main.html",
  });
}

browser.action.onClicked.addListener(openApp);
