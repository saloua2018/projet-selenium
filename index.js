const { Builder } = require("selenium-webdriver");

(async function exempleMinimal() {
  const driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://www.google.com");
    await new Promise((r) => setTimeout(r, 4000));
  } finally {
    await driver.quit();
  }
})();
