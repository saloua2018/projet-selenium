const { Builder, By, until } = require("selenium-webdriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // 1. Ouvrir la page
    await driver.get(
      "https://the-internet.herokuapp.com/notification_message_rendered"
    );

    let success = false;
    let attempts = 0;

    while (!success && attempts < 10) {
      // max 10 tentatives
      attempts++;
      console.log(`Tentative ${attempts}...`);

      // 2. Cliquer sur le lien
      await driver.findElement(By.linkText("Click here")).click();

      // 3. Attendre le message
      let messageElement = await driver.wait(
        until.elementLocated(By.id("flash")),
        3000
      );

      let message = await messageElement.getText();
      console.log("Message affiché :", message.trim());

      // 4. Vérifier le succès
      if (message.includes("Action successful")) {
        console.log("✅ Succès obtenu !");
        success = true;
      } else {
        console.log("↩️ Échec, on réessaie...");
      }
    }

    if (!success) {
      console.log("❌ Pas de succès après 10 essais.");
    }
  } finally {
    await driver.quit();
  }
}

run();
