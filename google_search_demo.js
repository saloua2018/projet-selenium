// google_search_demo.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");

const QUERY = "Selenium Python tutorial";
const TIMEOUT = 15000; // attente max par essai
const MAX_TRIES = 3; // nb de réessais si pas de résultats

async function acceptConsentIfPresent(driver) {
  // Essayer toutes les iframes
  const iframes = await driver.findElements(By.css("iframe"));
  for (const f of iframes) {
    try {
      await driver.switchTo().frame(f);
      const btn = await driver.findElements(
        By.xpath(
          "//button[.//text()[contains(.,'Accepter') or contains(.,'Accept')]]"
        )
      );
      if (btn.length) {
        await btn[0].click();
        await driver.switchTo().defaultContent();
        return true;
      }
      await driver.switchTo().defaultContent();
    } catch {
      try {
        await driver.switchTo().defaultContent();
      } catch {}
    }
  }
  // Bouton direct (hors iframe)
  const btn = await driver.findElements(
    By.xpath(
      "//button[.//text()[contains(.,'Accepter') or contains(.,'Accept')]]"
    )
  );
  if (btn.length) {
    await btn[0].click();
    return true;
  }
  return false;
}

async function waitResults(driver) {
  // variantes de sélecteurs possibles
  const sels = ["div#search h3", "div#rso h3", "a h3"];
  const start = Date.now();
  while (Date.now() - start < TIMEOUT) {
    for (const sel of sels) {
      const els = await driver.findElements(By.css(sel));
      if (els.length) return els;
    }
    // petit scroll puis micro-pause
    await driver.executeScript(
      "window.scrollBy(0, Math.floor(window.innerHeight/2));"
    );
    await new Promise((r) => setTimeout(r, 400));
  }
  return [];
}

(async function run() {
  const options = new chrome.Options()
    // .addArguments('--headless=new')   // décommente si tu veux sans fenêtre
    .addArguments("--window-size=1200,900")
    .addArguments("--disable-notifications")
    .addArguments("--disable-blink-features=AutomationControlled")
    .excludeSwitches("enable-automation", "enable-logging")
    .addArguments(
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  try {
    let results = [];
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      // Aller directement sur la page résultats (évite la saisie + redirection)
      const url = `https://www.google.com/search?hl=fr&pws=0&num=10&q=${encodeURIComponent(
        QUERY
      )}`;
      await driver.get(url);

      // Essayer de fermer le consentement si présent
      await acceptConsentIfPresent(driver);

      // Attendre des résultats
      results = await waitResults(driver);
      if (results.length) break; // OK → on sort
      // sinon on retente (Google a peut-être servi une variante)
    }

    if (!results.length) {
      const png = await driver.takeScreenshot();
      fs.writeFileSync("debug_google.png", png, "base64");
      throw new Error(
        "Toujours aucun <h3>. Capture enregistrée dans 'debug_google.png'."
      );
    }

    console.log("Résultats de recherche :");
    let n = 0;
    for (const el of results) {
      const t = (await el.getText()).trim();
      if (t) {
        n++;
        console.log(`${n}. ${t}`);
        if (n >= 5) break;
      }
    }
    if (n === 0) console.log("(Aucun titre lisible)");
  } finally {
    await driver.quit();
  }
})();
