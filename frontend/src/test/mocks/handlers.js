import { http, HttpResponse } from 'msw'

const sessions = [
    { id: 1, name: "Session 1", date: new Date(), description: "Description 1", users: [], teacher :{ id: 1, firstName: "John", lastName: "Doe" }},
    { id: 2, name: "Session 2", date: new Date(), description: "Description 2", users: [1,2], teacher :{ id: 2, firstName: "Jean", lastName: "Martin" }},
];

export const postParticipationHandler = vi.fn();
export const deleteParticipationHandler = vi.fn();
export const postSessionHandler = vi.fn();
export const editSessionHandler = vi.fn();
export const deleteUserHandler = vi.fn();
export const promoteAdminHandler = vi.fn();

export const handlers = [
    // Simuler GET /api/users/:id
    http.get( // 1 - Définition de la méthode HTTP
        '/api/session', // 2 - Définition de la route
        () => { // 3 - Définition de la fonction de traitement

            // Simuler une réponse réussie
            return HttpResponse.json(sessions)
        }),

    http.get( 
        '/api/session/:id', 
        ({ params }) => { 
            const { id } = params 
            
            return HttpResponse.json(sessions[0])
        }),
    
    http.post( 
        '/api/session/:id/participate/:uid', 
        ({ params }) => { 
            const { id, uid } = params 

            postParticipationHandler({ id, uid });

            return HttpResponse({ status: 200 })
        }),

    http.delete( 
        '/api/session/:id/participate/:uid', 
        ({ params }) => { 
            const { id, uid } = params 

            deleteParticipationHandler({ id, uid });

            return HttpResponse({ status: 200 })
        }),

    http.get( // 1 - Définition de la méthode HTTP
        '/api/teacher', // 2 - Définition de la route
        () => { // 3 - Définition de la fonction de traitement

            // Simuler une réponse réussie
            return HttpResponse.json([
                { id: 1, firstName: "John", lastName: "Doe" },
                { id: 2, firstName: "Jean", lastName: "Martin" },
            ])
        }),

    http.post( 
        '/api/session', 
            async ({ request }) => { 
            const data = await request.json();
            const { name, date, teacherId, description } = data

            postSessionHandler(data);

            return HttpResponse({ status: 201 })
        }),

    http.put( 
        '/api/session/:id', 
        async ({ request, params }) => { 
            const { id } = params 
            const data = await request.json();
            const { name, date, teacherId, description } = data

            editSessionHandler(id,data);

            return HttpResponse({ status: 201 })
        }),

    http.get( 
        '/api/user/:id', 
        ({ params }) => { 
            const { id } = params 
            
            return HttpResponse.json({ 
                firstName: "Bob", 
                lastName: "Sponge",
                email: "email@email.com",
                createdAt: new Date()
            })
        }),

    http.delete( 
        '/api/user/:id', 
        ({ params }) => { 
            const { id } = params 

            deleteUserHandler(id)
            
            return HttpResponse({ status: 200 })
        }),

    http.post( 
        '/api/user/promote-admin', 
        () => { 

            promoteAdminHandler()
            
            return HttpResponse({ status: 200 })
        }),
]