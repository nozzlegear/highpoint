import GearworksHttpService from 'gearworks-http';
import { AUTH_HEADER_NAME } from '../modules/constants';

export class BaseService extends GearworksHttpService {
    constructor(basePath: string, authToken?: string) {
        super(basePath, !authToken ? undefined : { [AUTH_HEADER_NAME]: authToken })
    }
}
