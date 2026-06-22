import { faker } from '@faker-js/faker';
// import Register from '../../src/pages/Register';

const testUser = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
}
const testUserWithDate = { ...testUser, createdAt: new Date() }

const sessions = [
    { id: 1, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher :{ id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName() }},
    { id: 2, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher :{ id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName() }},
]

describe('register then delete new user', () => {
    beforeEach(() => {
        cy.intercept('POST', '/api/auth/register', (req) => {
            req.reply({ statusCode: 201, body: { ...testUser, id: 30, token: "token" } });
        }).as('register');

        cy.intercept('GET', '/api/session', (req) => {
            req.reply({ statusCode: 200, body: sessions });
        }).as('getSessions');

        cy.intercept('GET', '/api/user/30', (req) => {
            req.reply({ statusCode: 200, body: testUserWithDate });
        }).as('getProfile');

        cy.intercept('DELETE', '/api/user/30', (req) => {
            req.reply({ statusCode: 200 });
        }).as('deleteProfile');

        cy.visit('http://localhost:3000/register')
    })

    it('should not submit form if fields missing', () => {
        cy.get('[data-cy="submit"]').click()
        cy.get('[data-cy="title"]').should('contain','Register for Yoga Studio')

        cy.get('#firstName_input').type(faker.person.firstName())
        cy.get('[data-cy="submit"]').click()
        cy.get('@register.all').should('have.length', 0);

        cy.get('#lastName_input').type(faker.person.lastName())
        cy.get('[data-cy="submit"]').click()
        cy.get('@register.all').should('have.length', 0);

        cy.get('#email_input').type(faker.internet.email())
        cy.get('[data-cy="submit"]').click()
        cy.get('@register.all').should('have.length', 0);
    })

    it('should not submit form if format of email is wrong', () => {
        cy.get('#firstName_input').type(faker.person.firstName())
        cy.get('#lastName_input').type(faker.person.lastName())
        cy.get('#email_input').type("abc")
        cy.get('#password_input').type(faker.internet.password())
        cy.get('[data-cy="submit"]').click()
        cy.get('@register.all').should('have.length', 0);
    })

    it('should display error message if post fails', () => {
        cy.intercept('POST', '/api/auth/register', (req) => {
            req.reply({ statusCode: 400, body: { message: 'Email already exists' } });
        }).as('register');

        cy.get('#firstName_input').type(faker.person.firstName())
        cy.get('#lastName_input').type(faker.person.lastName())
        cy.get('#email_input').type(faker.internet.email())
        cy.get('#password_input').clear().type(faker.internet.password())
        cy.get('[data-cy="submit"]').click()
        cy.get('[data-cy="register_error"]').should('exist').should('contain','Email already exists');
    })

    it('should submit complete form and redirect to sessions', () => {
        cy.fillRegisterForm(testUser);
        cy.get('[data-cy="submit"]').click()
        cy.get('@register.all').should('have.length.greaterThan', 0);

        cy.url().should('include', '/sessions');
        cy.get('[data-cy="title"]').should('contain','Yoga Sessions')
        cy.get('@getSessions.all').should('have.length.greaterThan', 0);
    })

    it('should then display profile on click on profile', () => {
        cy.fillRegisterForm(testUser);
        cy.get('[data-cy="submit"]').click()

        cy.get('[data-cy="profile"]').click()
        cy.url().should('include', '/profile');
        cy.get('[data-cy="title"]').should('contain','My Profile')
    })

    it('should delete profile after click on delete then redirect to login page', () => {
        cy.fillRegisterForm(testUser);
        cy.get('[data-cy="submit"]').click()
        cy.get('[data-cy="profile"]').click()
        
        cy.get('[data-cy="delete"]').click()
        cy.get('@deleteProfile.all').should('have.length.greaterThan', 0);
        cy.url().should('include', '/login');
    })
})