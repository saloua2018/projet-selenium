const { Builder, By, until } = require("selenium-webdriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    // URL avec login:password avant le domaine
    await driver.get(
      "https://admin:admin@the-internet.herokuapp.com/basic_auth"
    );

    // Attendre le paragraphe qui confirme l’authentification
    let successMessage = await driver.wait(
      until.elementLocated(By.css("p")),
      5000
    );

    let text = await successMessage.getText();
    console.log("✅ Texte affiché :", text);
  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    // Fermer le navigateur
    await driver.quit();
  }
}

run();
