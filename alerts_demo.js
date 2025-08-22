const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function findPromptButton(driver) {
  // essaie plusieurs sélecteurs possibles
  const candidates = [
    By.id("promtButton"), // orthographe utilisée par UITesting Playground (souvent)
    By.id("promptButton"), // orthographe “normale”
    By.xpath("//button[contains(.,'Prompt')]"), // secours par texte
  ];
  for (const sel of candidates) {
    const found = await driver.findElements(sel);
    if (found.length) return found[0];
  }
  return null;
}

(async function run() {
  const options = new chrome.Options()
    .addArguments("--ignore-certificate-errors")
    .addArguments("--allow-insecure-localhost")
    .excludeSwitches("enable-logging");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // Utilise HTTP pour éviter l’écran SSL
    await driver.get("http://www.uitestingplayground.com/alerts");

    // ----- Alert -----
    const alertBtn = await driver.wait(
      until.elementLocated(By.id("alertButton")),
      10000
    );
    await driver.executeScript("arguments[0].scrollIntoView(true);", alertBtn);
    await alertBtn.click();
    const alert1 = await driver.switchTo().alert();
    console.log("Alert ->", await alert1.getText());
    await alert1.accept();

    // ----- Confirm -----
    const confirmBtn = await driver.findElement(By.id("confirmButton"));
    await driver.executeScript(
      "arguments[0].scrollIntoView(true);",
      confirmBtn
    );
    await confirmBtn.click();
    const alert2 = await driver.switchTo().alert();
    console.log("Confirm ->", await alert2.getText());
    await alert2.dismiss(); // ou .accept()

    // ----- Prompt (robuste) -----
    let promptBtn = await findPromptButton(driver);
    if (!promptBtn) {
      // parfois un petit scroll supplémentaire aide
      await driver.executeScript("window.scrollBy(0, 400);");
      promptBtn = await findPromptButton(driver);
    }
    if (!promptBtn)
      throw new Error("Bouton Prompt introuvable (promtButton/promptButton).");

    await driver.executeScript("arguments[0].scrollIntoView(true);", promptBtn);
    await promptBtn.click();

    const prompt = await driver.switchTo().alert();
    console.log("Prompt ->", await prompt.getText());
    await prompt.sendKeys("Hello Selenium!");
    await prompt.accept();

    console.log("✅ Alert, Confirm et Prompt : OK");
  } finally {
    await driver.quit();
  }
})();
