const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function run() {
  const options = new chrome.Options();
  options.addArguments("--ignore-certificate-errors");
  options.addArguments("--allow-insecure-localhost");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.get("https://www.uitestingplayground.com/alerts");

    // Attendre que "Paramètres avancés" apparaisse
    await driver.wait(until.elementLocated(By.id("details-button")), 5000);

    // Cliquer sur "Paramètres avancés"
    const detailsBtn = await driver.findElement(By.id("details-button"));
    await detailsBtn.click();

    // Cliquer sur "Continuer quand même"
    const proceedBtn = await driver.findElement(By.id("proceed-button"));
    await proceedBtn.click();

    console.log("✅ Page débloquée !");
  } finally {
    await driver.quit();
  }
}

run();
