export const Paths = {
    api: {
        sessions: {
            create: "/api/v1/sessions"
        },
        functions: {
            create: "/api/v1/functions",
            update: "/api/v1/functions/:id",
            exec: "/api/v1/functions/exec/:id"
        }
    }
}

export default Paths;