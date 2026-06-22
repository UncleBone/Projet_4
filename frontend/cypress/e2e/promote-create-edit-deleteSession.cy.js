import { faker } from '@faker-js/faker';
import Register from '../../src/pages/Register';

let testUser = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    admin: false
}

const teachers = [
    { id: 1, firstName: faker.person.firstName(), lastName: faker.person.lastName() },
    { id: 2, firstName: faker.person.firstName(), lastName: faker.person.lastName() },
    { id: 3, firstName: faker.person.firstName(), lastName: faker.person.lastName() },
]

const newSession = {
    name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher : teachers[2]
}

const editSessionName = faker.lorem.word();
const editSessionDescription = faker.lorem.paragraph();

describe('login - see session details - join - logout', () => {
    beforeEach(() => {
        cy.intercept('POST', '/api/auth/login', (req) => {
            // const data = req;
            req.reply({ statusCode: 200, body: { ...testUser, id: 30, token: "token" } });
        }).as('login');

        cy.intercept('GET', '/api/session', (req) => {
            req.reply({ statusCode: 200, body: sessions });
        }).as('getSessions');

        cy.intercept('GET', '/api/user/30', (req) => {
            req.reply({ statusCode: 200, body: testUserWithDate });
        }).as('getProfile');

        cy.intercept('POST', '/api/user/promote-admin', (req) => {
            testUserWithDate.admin = true;
            req.reply({ statusCode: 200, body: testUserWithDate });
        }).as('promote');

        cy.intercept('GET', '/api/teacher', (req) => {
            req.reply({ statusCode: 200, body: teachers });
        }).as('getTeachers');

        cy.intercept('POST', '/api/session', (req) => {
            sessions.push({...newSession, id: 3, users: [] });
            req.reply({ statusCode: 200 });
        }).as('createSession');

        cy.intercept('GET', '/api/session/3', (req) => {
            req.reply({ statusCode: 200, body: sessions[2] });
        }).as('getSession3');

        cy.intercept('PUT', '/api/session/3', (req) => {
            sessions[2].name = editSessionName;
            sessions[2].description = editSessionDescription;
            req.reply({ statusCode: 200 });
        }).as('putSession3');

        cy.intercept('DELETE', '/api/session/3', (req) => {
            sessions.splice(2,1);
            req.reply({ statusCode: 200 });
        }).as('deleteSession3');

        testUser.admin = false;
        let testUserWithDate = { ...testUser, createdAt: new Date() }
        let sessions = [
            { id: 1, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher : teachers[0] },
            { id: 2, name: faker.lorem.word(), date: new Date(), description: faker.lorem.paragraph(), users: [], teacher : teachers[1] },
        ]

        cy.visit('http://localhost:3000/')
    })

    it('should promote to admin when click promote', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="account-type"]').should('contain','User') 
        cy.get('[data-cy="promote"]').click()
        cy.get('@promote.all').should('have.length', 1);
        cy.get('[data-cy="account-type"]').should('contain','Administrator') 
    })

    it('should return to sessions page when click back to sessions', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.url().should('include', '/sessions');
        
        cy.get('[data-cy="title"]').should('contain','Yoga Sessions') 
        cy.get('[data-cy="create"]').should('exist') 
    })

    it('should show create form when click create', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()

        cy.url().should('include', '/create');
        cy.get('[data-cy="title"]').should('contain','Create New Session') 
    })

    it('should submit form when click create session', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()

        cy.fillCreateForm(newSession);
        cy.get('[data-cy="submit"]').click()
        cy.get('@createSession.all').should('have.length', 1);
    })

    it('should show new session in sessions page', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()
        cy.fillCreateForm(newSession);
        cy.get('form').submit()
        
        cy.url().should('include', '/sessions');
        cy.get('[data-cy="session_3"]').should('exist')
        cy.get('[data-cy="session_3"] [data-cy="name"]').should('contain',newSession.name)
        cy.get('[data-cy="session_3"] [data-cy="description"]').should('contain',newSession.description)
    })

    it('should show new session details', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()
        cy.fillCreateForm(newSession);
        cy.get('form').submit()
        
        cy.get('[data-cy="session_3"] [data-cy="details"]').click()

        cy.url().should('include', '/sessions/3');
        cy.get('[data-cy="name"]').should('contain',newSession.name) 
        cy.get('[data-cy="description"]').should('contain',newSession.description) 
    })

    it('should display edit form', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()
        cy.fillCreateForm(newSession);
        cy.get('form').submit()
        
        cy.get('[data-cy="session_3"] [data-cy="details"]').click()
        cy.get('[data-cy="edit"]').click()

        cy.url().should('include', '/edit/3');
        cy.get('[data-cy="title"]').should('contain','Edit Session') 
    })

    it('should call api when submit edit form', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()
        cy.fillCreateForm(newSession);
        cy.get('form').submit()
        
        cy.get('[data-cy="session_3"] [data-cy="details"]').click()
        cy.get('[data-cy="edit"]').click()

        cy.get('[data-cy=name]').clear().type(editSessionName);
        cy.get('[data-cy=description]').clear().type(editSessionDescription);
        cy.get('[data-cy="submit"]').click()
        cy.get('@putSession3.all').should('have.length', 1);
    })

    it('should show edited session in sessions page', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()
        cy.fillCreateForm(newSession);
        cy.get('form').submit()
        
        cy.get('[data-cy="session_3"] [data-cy="details"]').click()
        cy.get('[data-cy="edit"]').click()

        cy.get('[data-cy=name]').clear().type(editSessionName);
        cy.get('[data-cy=description]').clear().type(editSessionDescription);
        cy.get('[data-cy="submit"]').click()
    
        cy.url().should('include', '/sessions');
        cy.get('[data-cy="session_3"] [data-cy="name"]').should('contain',editSessionName)
        cy.get('[data-cy="session_3"] [data-cy="description"]').should('contain',editSessionDescription)
    })

    it('should delete session when click delete', () => {
        cy.fillLoginForm(testUser);
        cy.get('form').submit()
        cy.get('[data-cy="profile"]').click()
        cy.get('[data-cy="promote"]').click()
        cy.get('[data-cy="back"]').click()
        cy.get('[data-cy="create"]').click()
        cy.fillCreateForm(newSession);
        cy.get('form').submit()
        
        cy.get('[data-cy="session_3"] [data-cy="details"]').click()
        cy.get('[data-cy="edit"]').click()

        cy.get('[data-cy=name]').clear().type(editSessionName);
        cy.get('[data-cy=description]').clear().type(editSessionDescription);
        cy.get('[data-cy="submit"]').click()
    
        cy.get('[data-cy="session_3"] [data-cy="delete"]').click()
        cy.get('@deleteSession3.all').should('have.length', 1);
        cy.get('[data-cy="session_3"]').should('not.exist')
    })
})