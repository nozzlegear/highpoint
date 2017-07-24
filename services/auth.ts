import * as Requests from 'requests/sessions';
import { BaseService } from './base';
import { SessionTokenResponse } from 'gearworks-route/bin';

export class SessionService extends BaseService {
    constructor(authToken?: string) {
        super("/api/v1/sessions", authToken);
    }

    public create = (data: Requests.CreateSession) => this.sendRequest<SessionTokenResponse>("", "POST", { body: data });
}
