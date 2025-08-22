const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function () {
  // Optionnel : décommente pour exécuter sans fenêtre
  // const options = new chrome.Options().addArguments('--headless=new');

  const driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  try {
    // 1) Ouvrir la page
    await driver.get("https://the-internet.herokuapp.com/dynamic_loading/1");

    // 2) Cliquer sur le bouton "Start"
    const startBtn = await driver.wait(
      until.elementLocated(By.css("#start button")),
      10000
    );
    await startBtn.click();

    // 3) Attendre que le texte apparaisse et soit visible
    const helloText = await driver.wait(
      until.elementLocated(By.css("#finish h4")),
      10000
    );
    await driver.wait(until.elementIsVisible(helloText), 10000);

    // 4) Récupérer le texte une fois visible
    const texte = await helloText.getText();
    console.log(`Texte trouvé : ${texte}`);

    // 5) Vérifier que le texte est bien "Hello World!"
    if (texte.trim() === "Hello World!") {
      console.log("✅ Test réussi : texte correct");
    } else {
      console.log("❌ Test échoué : texte incorrect");
    }
  } finally {
    await driver.quit();
  }
})();
