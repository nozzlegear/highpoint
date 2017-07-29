import * as Constants from '../modules/constants';
import { Client, DatabaseConfiguration } from 'davenport';
import { HighpointFunction } from 'highpoint';

class FunctionDbFactory extends Client<HighpointFunction> {
    constructor() {
        super(Constants.COUCHDB_URL, FunctionDbFactory.Config.name, { warnings: false });
    }

    static Config: DatabaseConfiguration<HighpointFunction> = {
        name: `${Constants.SNAKED_APP_NAME}_functions`,
        indexes: [
            "type"
        ],
        designDocs: [
            {
                name: "list",
                views: [

                ]
            },
        ],
    }

    public get Config(): DatabaseConfiguration<HighpointFunction> {
        return FunctionDbFactory.Config;
    }
}

export const Functions = new FunctionDbFactory();