import { getPrice } from "../support/app.po";
import range from "../fixtures/range.json";
import rangeDiff from "../fixtures/range-diff.json";

describe("web-ui-e2e", () => {
  beforeEach(async () => {
    cy.clearLocalStorage();
    const databases = await indexedDB.databases();
    databases.forEach((db) => {
      indexedDB.deleteDatabase(db.name);
    });
  });

  it("Hero", () => {
    cy.intercept("https://blockchain.info/q/totalbc", "1971957500000000").as(
      "getTotalBc"
    );
    cy.intercept("GET", "**/api/prices/simple*", {
      bitcoin: {
        usd: 90482.36,
        usd_24h_vol: 16690539371.276321,
        usd_24h_change: -4.674755682132398,
        last_updated_at: 1720107348,
      },
    }).as("getPrice1");
    cy.intercept("GET", "**/api/prices/range/diff*", rangeDiff).as(
      "getRangeDiff"
    );
    cy.intercept("GET", "**/api/prices/range*", range).as("getRange1");
    cy.debug();
    cy.visit("/#/onboarding");
    // cy.wait(1000);
    cy.get("[data-testid=my-btc-btn]", {
      timeout: 10000,
    }).should("contain", "My BTC");

    // Custom command example, see `../support/commands.ts` file
    // cy.login("my-email@something.com", "myPassword");
    cy.wait("@getPrice1", { timeout: 20000 });
    // .then((interception) => {
    //   console.log(interception.response.body);
    // });

    const p = getPrice();
    // cy.debug();
    // p.should("be.visible");
    p.contains("$90,482.36");
    cy.screenshot({ capture: "viewport" });
  });

  it("should import the wallet", () => {
    cy.intercept("https://blockchain.info/q/totalbc", "1971957500000000").as(
      "getTotalBc"
    );
    cy.intercept("GET", "**/api/prices/simple*", {
      bitcoin: {
        usd: 57482.36,
        usd_24h_vol: 16690539371.276321,
        usd_24h_change: -4.674755682132398,
        last_updated_at: 1720107348,
      },
    }).as("getPrice");

    cy.intercept("GET", "**/api/prices/range*", range).as("getRange");

    cy.actAsToshi("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");

    cy.visit("/#/toshi-moto");

    cy.scrollTo(0, 120);
    cy.get("[data-testid=btc-wallet-balance]", {
      timeout: 60000,
    }).should("contain", "0.00,100,000");

    cy.visit("/#/toshi-moto");

    cy.screenshot({ capture: "viewport" });
  });
});
