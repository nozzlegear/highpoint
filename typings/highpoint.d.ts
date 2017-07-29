declare module "highpoint" {
    import { CouchDoc } from "davenport/bin";

    export interface User extends CouchDoc {
        hashedPassword: string;
    }
}