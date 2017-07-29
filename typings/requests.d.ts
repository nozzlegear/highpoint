declare module "requests/sessions" {
    export interface CreateSession {
        username: string;
        password: string;
    }
}

declare module "requests/functions" {
    export interface GetUpdateDeleteParams {
        id: string;
    }
}