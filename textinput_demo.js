// textinput_demo.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

(async function () {
  // Optionnel : exécuter sans fenêtre
  // const options = new chrome.Options().addArguments('--headless=new');

  const driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  try {
    // 1) Ouvrir la page (en HTTP pour éviter l’avertissement SSL)
    await driver.get("http://www.uitestingplayground.com/textinput");

    // 2) Attendre les éléments
    const input = await driver.wait(
      until.elementLocated(By.id("newButtonName")),
      10000
    );
    const button = await driver.wait(
      until.elementLocated(By.id("updatingButton")),
      10000
    );

    // 3) Taper un nouveau nom puis cliquer sur Update
    const nouveauNom = "Mon Nouveau Bouton";
    await input.clear();
    await input.sendKeys(nouveauNom);
    await button.click();

    // 4) Vérifier que le texte du bouton a changé
    // (attendre que l’attribut/texte soit mis à jour)
    await driver.wait(async () => {
      const txt = await driver.findElement(By.id("updatingButton")).getText();
      return txt.trim() === nouveauNom;
    }, 10000);

    const texteFinal = await button.getText();
    console.log(`Texte du bouton : "${texteFinal}"`);

    if (texteFinal.trim() === nouveauNom) {
      console.log("✅ Test réussi : le bouton a été renommé.");
    } else {
      console.log(
        "❌ Test échoué : le bouton ne correspond pas au texte saisi."
      );
    }
  } finally {
    await driver.quit();
  }
})();
