const { Builder, By } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function run() {
  let options = new chrome.Options();

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // Ouvrir la page
    await driver.get("https://the-internet.herokuapp.com/geolocation");

    // Activer la géolocalisation via CDP
    await driver.sendDevToolsCommand("Emulation.setGeolocationOverride", {
      latitude: 48.8566, // Paris
      longitude: 2.3522,
      accuracy: 100,
    });

    // Cliquer sur le bouton pour récupérer la position
    await driver.findElement(By.css("button")).click();

    // Attendre un peu pour voir le résultat
    await driver.sleep(5000);
  } finally {
    await driver.quit();
  }
}

run();
