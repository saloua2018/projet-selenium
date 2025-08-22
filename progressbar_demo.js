const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function q$(driver, by, timeout = 0) {
  if (!timeout) return (await driver.findElements(by))[0] || null;
  try {
    return await driver.wait(until.elementLocated(by), timeout);
  } catch {
    return null;
  }
}

async function readProgress(driver) {
  const bar = await driver.findElement(By.id("progressBar"));
  const aria = await bar.getAttribute("aria-valuenow");
  if (aria) return parseInt(aria, 10);
  const txt = (await bar.getText()).trim().replace("%", "");
  return parseInt(txt, 10);
}

(async function run() {
  // HTTP pour éviter l’écran SSL
  const options = new chrome.Options().addArguments(
    "--ignore-certificate-errors"
  );
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get("http://www.uitestingplayground.com/progressbar");

    const MAX_TRIES = 30;
    let success = false;

    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      // (re)sélection des contrôles à chaque tentative
      const startBtn = await q$(driver, By.id("startButton"), 5000);
      let stopBtn = await q$(driver, By.id("stopButton"), 2000);
      if (!startBtn || !stopBtn) {
        // page bancale -> refresh
        await driver.navigate().refresh();
        await sleep(300);
        continue;
      }

      await startBtn.click();

      while (true) {
        const val = await readProgress(driver);

        if (val === 75) {
          await stopBtn.click();
          success = true;
          console.log(`✅ Arrêt EXACT à ${val}% (tentative ${attempt})`);
          break;
        }
        if (val > 75) {
          // trop tard → stop, puis reset si dispo, sinon refresh
          await stopBtn.click();

          const resetBtn = await q$(driver, By.id("resetButton"), 1000);
          if (resetBtn) {
            await resetBtn.click();
            await sleep(150);
          } else {
            await driver.navigate().refresh();
            await sleep(300);
          }
          console.log(
            `↩️ Dépassé (${val}%), on retente… (prochaine tentative)`
          );
          break;
        }

        // encore en dessous
        await sleep(12); // polling fin (plus petit = plus précis)
        // rebind de stopBtn (après refresh éventuel)
        stopBtn = (await q$(driver, By.id("stopButton"), 2000)) || stopBtn;
      }

      if (success) break;
    }

    const finalVal = await readProgress(driver).catch(() => NaN);
    if (success && finalVal === 75) {
      console.log("🎉 Test OK : la barre est bien arrêtée à 75%.");
    } else {
      console.log(
        `❌ Pas à 75% (valeur lue : ${isNaN(finalVal) ? "N/A" : finalVal}%).`
      );
    }
  } finally {
    await driver.quit();
  }
})();
