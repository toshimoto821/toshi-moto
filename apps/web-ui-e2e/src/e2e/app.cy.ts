import { getPrice } from "../support/app.po";
import localForage from "localforage";

describe("web-ui-e2e", () => {
  beforeEach(() => {
    localForage.clear();
  });

  it("Hero", () => {
    cy.viewport(1280, 720);
    cy.intercept("GET", "**/api/prices/simple*", {
      bitcoin: {
        usd: 57482.36,
        usd_24h_vol: 16690539371.276321,
        usd_24h_change: -4.674755682132398,
        last_updated_at: 1720107348,
      },
    }).as("getPrice");
    cy.visit("/");
    // Custom command example, see `../support/commands.ts` file
    // cy.login("my-email@something.com", "myPassword");
    cy.wait("@getPrice", { timeout: 10000 }).then((interception) => {
      console.log(interception.response.body);
    });
    // Function helper example, see `../support/app.po.ts` file
    const p = getPrice();
    // check that p equals 57482.36
    // const v = p.eq("57482.36");
    p.should("be.visible");
    p.contains("$57,482.36");
    cy.screenshot({ capture: "viewport" });
  });
  it.only("should import the wallet", () => {
    cy.actAsToshi("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");
    cy.get("[data-testid=btc-wallet-balance]", {
      timeout: 10000,
    }).should("contain", "0.00,100,000");
    cy.scrollTo(0, 100);

    cy.screenshot({ capture: "viewport" });
  });
});
