declare module "highpoint" {
    import { CouchDoc } from "davenport/bin";

    export interface User extends CouchDoc {
        hashedPassword: string;
    }

    export type FunctionType = "timer" | "http";

    export interface HighpointConfig {
        name: string;
        type: FunctionType;
    }

    export interface HighpointFunction extends CouchDoc, HighpointConfig {
        updatedAt: number;
    }
}