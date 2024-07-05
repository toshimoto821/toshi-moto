export const getPrice = () => cy.get("[data-testid=btc-price]");

export const getToshiBtn = () =>
  cy.get("[data-testid=import-toshi-moto-wallet]");
