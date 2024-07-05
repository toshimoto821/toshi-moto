import { getToshiBtn } from "./app.po";
import { getAddressResponse } from "../fixtures/address";
import { getTxsResponse } from "../fixtures/txs";
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => {
//   console.log("Custom command example: Login", email, password);
// });

Cypress.Commands.add("actAsToshi", (initAddress?: string) => {
  // mocks
  // https://mempool.space/api/address/bc1qaql0jc6v3qutqkge38wynzr39xfdk7jeet6eeh?ttl=86400000
  // https://mempool.space/api/address/bc1qpc54dq6p0xfvy305hga42chpaa02tzj3ajtqel/txs?ttl=86400000

  cy.intercept("GET", "**/api/address/*", (req) => {
    const url = new URL(req.url);
    const [, , , address] = url.pathname.split("/");

    if (/txs$/.test(url.pathname)) {
      // @todo stub
      if (initAddress === address) {
        cy.debug();
        const resp = getTxsResponse({ address, sum: 100000 });
        req.reply(resp);
      } else {
        const resp = getTxsResponse({ address });
        req.reply(resp);
      }
    } else {
      let numTxs = 0;
      let sum = 0;
      if (initAddress === address) {
        numTxs = 1;
        sum = 100000;
      }

      const resp = getAddressResponse({ address, numTxs, sum });

      req.reply(resp);
    }
  }).as("getAddress");

  cy.intercept("GET", "**/api/prices/simple*", {
    bitcoin: {
      usd: 57482.36,
      usd_24h_vol: 16690539371.276321,
      usd_24h_change: -4.674755682132398,
      last_updated_at: 1720107348,
    },
  }).as("getPrice");
  cy.visit("/");
  cy.wait("@getPrice", { timeout: 10000 });
  const btn = getToshiBtn();
  btn.click();
  // cy.url().debug();
  console.log(cy.url());

  // .then((interception) => {
  //   console.log(interception.response.body);
  // });
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
