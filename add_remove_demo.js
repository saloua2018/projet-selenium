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
    await driver.get("https://the-internet.herokuapp.com/add_remove_elements/");

    // 2) Trouver le bouton "Add Element"
    const addBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[normalize-space()='Add Element']")
      ),
      10000
    );

    // 3) Ajouter 5 éléments
    for (let i = 0; i < 5; i++) {
      await addBtn.click();
    }

    // 4) Vérifier qu’on a bien 5 boutons Delete
    let deletes = await driver.findElements(By.css("button.added-manually"));
    console.log(`Après ajout : ${deletes.length} boutons Delete (attendu : 5)`);

    // 5) Supprimer 2 éléments
    for (let i = 0; i < 2; i++) {
      deletes = await driver.findElements(By.css("button.added-manually"));
      if (deletes.length > 0) {
        await deletes[0].click();
      }
    }

    // 6) Vérifier qu’il en reste 3
    deletes = await driver.findElements(By.css("button.added-manually"));
    console.log(
      `Après suppression : ${deletes.length} boutons Delete (attendu : 3)`
    );

    // 7) Afficher le résultat final
    if (deletes.length === 3) {
      console.log("✅ Test réussi : 5 ajoutés, 2 supprimés, 3 restants.");
    } else {
      console.log("❌ Test échoué !");
    }
  } finally {
    await driver.quit();
  }
})();
