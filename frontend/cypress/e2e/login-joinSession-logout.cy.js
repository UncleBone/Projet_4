import { faker } from '@faker-js/faker';
import Register from '../../src/pages/Register';

const testUser = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password()
}

let sessions = [
    { id: 1, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher :{ id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName() }},
    { id: 2, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher :{ id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName() }},
]

describe('login - see session details - join - logout', () => {
    beforeEach(() => {
        cy.intercept('POST', '/api/auth/login', (req) => {
            // const data = req;
            req.reply({ statusCode: 200, body: { ...testUser, id: 30, token: "token" } });
        }).as('login');

        cy.intercept('GET', '/api/session', (req) => {
            req.reply({ statusCode: 200, body: sessions });
        }).as('getSession');

        cy.intercept('GET', '/api/session/1', (req) => {
            req.reply({ statusCode: 200, body: sessions[0] });
        }).as('getSession1');

        cy.intercept('POST', '/api/session/1/participate/30', (req) => {
            if(!sessions[0].users.includes(30))
                sessions[0].users.push(30)
            req.reply({ statusCode: 200 });
        }).as('participate');

        cy.intercept('DELETE', '/api/session/1/participate/30', (req) => {
            sessions[0].users  = [];
            req.reply({ statusCode: 200 });
        }).as('unparticipate');

        cy.visit('http://localhost:3000/')
    })

    it('landing page should show login form ', () => {
        cy.get('[data-cy="title"]').should('contain','Login to Yoga Studio')
        cy.get('[data-cy="email_label"]').should('exist')
        cy.get('[data-cy="register"]').should('exist')
    })

    it('should not submit form if fields missing', () => {
        // cy.get('form').submit()
        cy.get('[data-cy="submit"]').click()
        cy.get('@login.all').should('have.length', 0);

        cy.get('#email_input').type(faker.internet.email())
        // cy.get('form').submit()
        cy.get('[data-cy="submit"]').click()
        cy.get('@login.all').should('have.length', 0);

        cy.get('#email_input').clear()
        cy.get('#password_input').type(faker.internet.password())
        // cy.get('form').submit()
        cy.get('[data-cy="submit"]').click()
        cy.get('@login.all').should('have.length', 0);
    })

    it('should not submit form if format of email is wrong', () => {
        cy.get('#email_input').type("abc")
        cy.get('#password_input').type(faker.internet.password())
        cy.get('[data-cy="submit"]').click()
        cy.get('@login.all').should('have.length', 0);
    })

    it('should display error message if post fails', () => {
        cy.intercept('POST', '/api/auth/login', (req) => {
            req.reply({ statusCode: 400, body: { message: 'Wrong credentials' } });
        }).as('login');

        cy.fillLoginForm(testUser);
        cy.get('[data-cy="submit"]').click()
        cy.get('[data-cy="login_error"').should('exist').should('contain','Wrong credentials');
    })

    it('should submit complete form and redirect to sessions', () => {
        cy.fillLoginForm(testUser);
        cy.get('[data-cy="submit"]').click()
        cy.get('@login.all').should('have.length', 1);
        cy.url().should('include', '/sessions');
        cy.get('[data-cy="title"]').should('contain','Yoga Sessions')
    })

    it('should display sessions in sessions page', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        sessions.map((session) => { 
            cy.get('[data-cy="session_'+session.id+'"] [data-cy="name"]').should('contain',session.name) 
            cy.get('[data-cy="session_'+session.id+'"] [data-cy="description"]').should('contain',session.description) 
            cy.get('[data-cy="session_'+session.id+'"] [data-cy="details"]').should('exist') 
        })
    })

    it('should redirect to session details when click on view details', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="session_1"] [data-cy="details"]').click() 
        cy.url().should('include', '/sessions/1');
        cy.get('[data-cy="name"]').should('contain',sessions[0].name) 
        cy.get('[data-cy="description"]').should('contain',sessions[0].description) 
    })

    it('should join session when click on join session', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="session_1"] [data-cy="details"]').click() 
        cy.get('[data-cy="participants"]').should('contain',"Participants: 0") 
        cy.get('[data-cy="join"]').click() 
        cy.get('@participate.all').should('have.length', 1);
        cy.get('[data-cy="participants"]').should('contain',"Participants: 1") 
        cy.get('[data-cy="leave"]').should('exist') 
    })

    it('should leave session when click on leave session', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="session_1"] [data-cy="details"]').click() 
        cy.get('[data-cy="leave"]').click() 
        cy.get('@unparticipate.all').should('have.length', 1);
        cy.get('[data-cy="participants"]').should('contain',"Participants: 0") 
    })

    it('should log out and redirect to login page when click on log out', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="logout"]').click() 
        cy.url().should('include', '/login');
    })
})