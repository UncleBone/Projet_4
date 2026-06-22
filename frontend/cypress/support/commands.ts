/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('fillRegisterForm', (user) => {
  cy.get('#firstName_input').type(user.firstName);
  cy.get('#lastName_input').type(user.lastName);
  cy.get('#email_input').type(user.email);
  cy.get('#password_input').clear().type(user.password);
});

Cypress.Commands.add('fillLoginForm', (user) => {
  cy.get('#email_input').type(user.email);
  cy.get('#password_input').clear().type(user.password);
});

Cypress.Commands.add('fillCreateForm', (session) => {
  cy.get('[data-cy=name]').type(session.name);
  cy.get('[data-cy=date]').type(session.date.toISOString().split('T')[0]);
  cy.get('[data-cy=description]').type(session.description);
  cy.get('[data-cy=teacher]').select('2');
});