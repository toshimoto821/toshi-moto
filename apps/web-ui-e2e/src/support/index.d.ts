// cypress/support/index.d.ts

/// <reference types="cypress" />

declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Chainable<Subject = any> {
    actAsToshi(address?: string): Chainable<Subject>;
  }
}
