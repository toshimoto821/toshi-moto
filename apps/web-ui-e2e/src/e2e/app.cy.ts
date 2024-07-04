import { getPrice } from "../support/app.po";

describe("web-ui-e2e", () => {
  // beforeEach(() => {

  // });

  it("should display welcome message", () => {
    cy.intercept(
      "GET",
      "**/api/prices/simple*"
      // {
      //   https: true,
      //   hostname: "api.toshimoto.app",
      //   pathname: "/api/prices/simple",
      // },
      // () => {
      //   return {
      //     bitcoin: {
      //       usd: 57482.36,
      //       usd_24h_vol: 16690539371.276321,
      //       usd_24h_change: -4.674755682132398,
      //       last_updated_at: 1720107348,
      //     },
      //   };
      // }
    ).as("getPrice");
    cy.visit("/");
    // Custom command example, see `../support/commands.ts` file
    // cy.login("my-email@something.com", "myPassword");
    cy.wait("@getPrice", { timeout: 10000 });

    // Function helper example, see `../support/app.po.ts` file
    const p = getPrice();

    p.contains(/\$\d+/);
  });
});
