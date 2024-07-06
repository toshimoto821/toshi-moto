import { getPrice } from "../support/app.po";
import localForage from "localforage";
import range from "../fixtures/range.json";

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
    cy.navigate("/");
    // Custom command example, see `../support/commands.ts` file
    // cy.login("my-email@something.com", "myPassword");
    // cy.wait("@getPrice", { timeout: 20000 });
    // .then((interception) => {
    //   console.log(interception.response.body);
    // });
    // Function helper example, see `../support/app.po.ts` file
    const p = getPrice();
    // check that p equals 57482.36
    // const v = p.eq("57482.36");
    p.should("be.visible");
    p.contains("$57,482.36");
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

    // https://api.toshimoto.app/api/prices/range?vs_currency=usd&from=1562385600&to=1720274400&group_by=1W

    cy.actAsToshi("bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel");

    cy.visit("/#/toshi-moto");

    cy.scrollTo(0, 120);
    cy.get("[data-testid=btc-wallet-balance]", {
      timeout: 60000,
    }).should("contain", "0.00,100,000");

    cy.visit("/#/toshi-moto");

    // eslint-disable-next-line
    // cy.wait(3000);
    cy.scrollTo(0, 500);
    cy.screenshot({ capture: "viewport" });
  });
});
