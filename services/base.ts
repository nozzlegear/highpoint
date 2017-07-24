import GearworksHttpService from 'gearworks-http';
import { AUTH_HEADER_NAME } from '../modules/constants';
import { inspect } from 'logspect/bin';

export class BaseService extends GearworksHttpService {
    constructor(basePath: string, authToken?: string) {
        super(basePath, { [AUTH_HEADER_NAME]: authToken })
    }
}
