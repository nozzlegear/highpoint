import * as Constants from '../modules/constants';
import { Client, DatabaseConfiguration } from 'davenport';
import { User } from 'highpoint';

class UserDbFactory extends Client<User> {
    constructor() {
        super(Constants.COUCHDB_URL, UserDbFactory.Config.name, { warnings: false });
    }

    static Config: DatabaseConfiguration<User> = {
        name: `${Constants.SNAKED_APP_NAME}_users`,
        indexes: [],
        designDocs: [
            {
                name: "list",
                views: [

                ]
            },
        ],
    }

    public get Config(): DatabaseConfiguration<User> {
        return UserDbFactory.Config;
    }
}

export const Users = new UserDbFactory();