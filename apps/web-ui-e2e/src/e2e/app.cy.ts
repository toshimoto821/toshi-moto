import { getPrice } from "../support/app.po";
import range from "../fixtures/range.json";
import rangeDiff from "../fixtures/range-diff.json";

const viewport = [1280, 1480] as const;

describe("web-ui-e2e", () => {

  beforeEach(async () => {
    cy.viewport(...viewport);
    const databases = await indexedDB.databases();
    databases.forEach((db) => {
      indexedDB.deleteDatabase(db.name);
    });
    console.log("cleaned db");
    // api/prices/simple?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true
    cy.intercept("GET", "**/api/prices/simple*", {
      bitcoin: {
        usd: 90482.36,
        usd_24h_vol: 16690539371.276321,
        usd_24h_change: -4.674755682132398,
        last_updated_at: 1720107348,
      },
    }).as("getPrice");
    
  });

  it("Hero", () => {
    
    cy.intercept("https://blockchain.info/q/totalbc", "1971957500000000").as(
      "getTotalBc"
    );

    cy.intercept("GET", "**/api/prices/range/diff*", rangeDiff).as(
      "getRangeDiff"
    );
    cy.intercept("GET", "**/api/prices/kline*", range).as("getRange1");

    cy.visit("/#/onboarding");
    // cy.wait(1000);
    cy.get("[data-testid=my-btc-btn]", {
      timeout: 10000,
    }).should("contain", "My BTC");

    // Custom command example, see `../support/commands.ts` file
    // cy.login("my-email@something.com", "myPassword");
    cy.wait("@getPrice", { timeout: 20000 });
    // .then((interception) => {
    //   console.log(interception.response.body);
    // });

    const p = getPrice();
    // cy.debug();
    // p.should("be.visible");
    p.contains("$90,482.36", { timeout: 20000 });

    cy.get("#loader-area", { timeout: 10000 }).should("not.exist");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.fixFixed();
    cy.waitForLogProgress();
    cy.screenshot({ 
      capture: 'fullPage',
      overwrite: true,
    });
  });

  it("should import the wallet", () => {
    


    cy.intercept("https://blockchain.info/q/totalbc", "1971957500000000").as(
      "getTotalBc"
    );


    cy.intercept("GET", "**/api/prices/kline*", range).as("getRange");
    cy.actAsToshi("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");
    

    
  
    
    cy.get("[data-testid=btc-wallet-balance]", {
      timeout: 21000,
    }).should("contain", "0.00,100,000");

    cy.get("[data-testid=btc-wallet-balance]").click();
    
    // wait for address row to be visible
    cy.get("[data-testid=address-row]", {
      timeout: 60000,
    }).should("be.visible");
    cy.wait("@getPrice", { timeout: 20000 });
  
    const p = getPrice();
    // cy.debug();
    // p.should("be.visible");
    p.contains("$90,482.36", { timeout: 20000 });
    
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.fixFixed();
    cy.waitForLogProgress();

    cy.screenshot({ 
      capture: 'fullPage',
      overwrite: true,
    });
  });
});
