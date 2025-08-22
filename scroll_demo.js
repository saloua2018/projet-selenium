const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function () {
  // Optionnel: exécuter headless et/ou ignorer les erreurs certif
  // const options = new chrome.Options()
  //   .addArguments('--headless=new')
  //   .addArguments('--ignore-certificate-errors')
  //   .addArguments('--allow-running-insecure-content');

  const driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  try {
    // 1) Utiliser HTTP pour éviter l’écran SSL
    await driver.get("http://www.uitestingplayground.com/scrollbars");

    // 2) Attendre que le bouton existe
    const hiddenBtn = await driver.wait(
      until.elementLocated(By.id("hidingButton")),
      10000
    );

    // 3) Scroller jusqu’au bouton + attendre visibilité
    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      hiddenBtn
    );
    await driver.wait(until.elementIsVisible(hiddenBtn), 5000);

    // (fallback) si pas visible, scroller par petits pas
    let visible = await hiddenBtn.isDisplayed();
    for (let i = 0; !visible && i < 10; i++) {
      await driver.executeScript("window.scrollBy(0, 100);");
      try {
        await driver.wait(until.elementIsVisible(hiddenBtn), 800);
        visible = true;
      } catch {}
    }

    // 4) Cliquer
    await hiddenBtn.click();
    console.log("✅ Bouton cliqué avec succès !");
  } finally {
    await driver.quit();
  }
})();
