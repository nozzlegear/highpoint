declare module "highpoint" {
    import { CouchDoc } from "davenport/bin";

    export interface User extends CouchDoc {
        hashedPassword: string;
    }

    export type FunctionType = "timer" | "http";

    export interface HighpointFunction extends CouchDoc {
        name: string;
        type: FunctionType;
        updatedAt: number;
    }
}