// dynamic_table_demo.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function getIeCpu(driver) {
  // La page met à jour le tableau en live : on va être tolérant
  // et essayer plusieurs sélecteurs (structure ARIA + fallback "table").
  // -> On mappe d'abord les en-têtes pour savoir l'index de la colonne "CPU".
  // -> Puis on lit la cellule de la ligne "Internet Explorer".

  // --- Essai 1 : structure ARIA (roles) utilisée par UITesting Playground ---
  try {
    // header
    const headers = await driver.findElements(
      By.css(
        "div[role='table'] div[role='row']:first-child span[role='columnheader']"
      )
    );
    if (headers.length) {
      const names = [];
      for (const h of headers) names.push((await h.getText()).trim());
      const cpuIdx = names.findIndex((n) => n.toLowerCase() === "cpu");
      if (cpuIdx !== -1) {
        // data rows
        const rows = await driver.findElements(
          By.css("div[role='table'] div[role='rowgroup'] div[role='row']")
        );
        for (const row of rows) {
          const cells = await row.findElements(By.css("span[role='cell']"));
          if (!cells.length) continue;
          const first = (await cells[0].getText()).trim().toLowerCase();
          if (first.includes("internet explorer")) {
            const value = (await cells[cpuIdx].getText()).trim();
            if (value) return value;
          }
        }
      }
    }
  } catch (_) {
    /* on tentera le fallback */
  }

  // --- Essai 2 : fallback HTML "table" classique (selon versions) ---
  const ths = await driver.findElements(By.css("table th"));
  if (ths.length) {
    const names = [];
    for (const th of ths) names.push((await th.getText()).trim());
    const cpuIdx = names.findIndex((n) => n.toLowerCase() === "cpu");
    const rows = await driver.findElements(By.css("table tbody tr"));
    for (const r of rows) {
      const tds = await r.findElements(By.css("td"));
      if (!tds.length) continue;
      const label = (await tds[0].getText()).trim().toLowerCase();
      if (
        label.includes("internet explorer") &&
        cpuIdx >= 0 &&
        cpuIdx < tds.length
      ) {
        const value = (await tds[cpuIdx].getText()).trim();
        if (value) return value;
      }
    }
  }

  // Si on arrive ici, on n'a rien trouvé
  throw new Error("Impossible de lire la cellule CPU d’Internet Explorer.");
}

(async function () {
  // Optionnel : exécuter sans fenêtre / calmer les logs SSL
  // const options = new chrome.Options()
  //   .addArguments('--headless=new','--ignore-certificate-errors')
  //   .excludeSwitches('enable-logging');

  const driver = await new Builder()
    .forBrowser("chrome")
    // .setChromeOptions(options)
    .build();

  try {
    // Utilise HTTP pour éviter l’avertissement SSL
    await driver.get("http://www.uitestingplayground.com/dynamictable");

    // Attendre que le tableau (ou ses rôles) soit présent
    await driver.wait(async () => {
      const a = await driver.findElements(By.css("div[role='table']"));
      const b = await driver.findElements(By.css("table"));
      return a.length > 0 || b.length > 0;
    }, 10000);

    // Comme les valeurs bougent, on tente quelques lectures jusqu’à obtenir non-vide
    let cpu = "";
    for (let i = 0; i < 5; i++) {
      cpu = await getIeCpu(driver).catch(() => "");
      if (cpu) break;
      await driver.sleep(500); // attendre une mise à jour
    }

    if (!cpu) throw new Error("CPU IE introuvable après plusieurs tentatives.");

    console.log(`Internet Explorer - CPU : ${cpu}`);
  } finally {
    await driver.quit();
  }
})();
