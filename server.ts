import * as Cache from 'gearworks-cache';
import * as Constants from './modules/constants';
import * as express from 'express';
import * as http from 'http';
import * as httpsRedirect from 'redirect-https';
import * as path from 'path';
import * as routeConfigurations from './routes';
import importObjectToArray from 'import-to-array';
import inspect from 'logspect';
import routerFactory from 'gearworks-route';
import { BoomError, notFound, wrap } from 'boom';
import { configureDatabase, DatabaseConfiguration } from 'davenport/bin';
import { getVersion } from './modules/version';
import { User } from 'highpoint';

// This is injected by Webpack during the build process. Unfortunately necessary because
// Zeit's pkg tool has a bug that makes it impossible to call .toString() on a function and
// get its source code, which we use in the CouchDB views.
declare const _DB_CONFIGURATIONS: DatabaseConfiguration<any>[];

// Server configurations
async function startServer(hostname: string, port: number) {
    const app = express();

    app.use((req, res, next) => {
        res.setHeader("x-powered-by", `Gearworks https://github.com/nozzlegear/gearworks`);

        next();
    });

    // Redirect http requests to https when live
    if (Constants.ISLIVE) {
        app.use(httpsRedirect());
    }

    // Any request to the /dist or /images paths should serve static files.
    // NOTE: We're combining with dirname + ../ because this app may be running inside Zeit's pkg where such things are necessary.
    app.use("/dist", express.static(path.join(__dirname, "../dist")));
    app.use("/images", express.static(path.join(__dirname, "../images")));

    // Let express trust the proxy that may be used on certain hosts (e.g. Azure and other cloud hosts). 
    // Enabling this will replace the `request.protocol` with the protocol that was requested by the end user, 
    // rather than the internal protocol used by the proxy.
    app.enable("trust proxy");

    // Configure routing function
    const router = routerFactory<User>(app, {
        auth_header_name: Constants.AUTH_HEADER_NAME,
        iron_password: Constants.IRON_PASSWORD,
        jwt_secret_key: Constants.JWT_SECRET_KEY,
        sealable_user_props: Constants.SEALABLE_USER_PROPERTIES,
        shopify_secret_key: "unused",
        userAuthIsValid: async (user) => {
            if (!user || !user._id) {
                return false;
            }

            // If user id exists in invalidation cache, return a 401 unauthed response.
            try {
                const cacheValue = await Cache.getValue(Constants.CACHE_SEGMENT_AUTH, user._id);

                if (!!cacheValue) {
                    return false;
                }
            } catch (e) {
                inspect(`Error attempting to retrieve ${user._id} value from auth-invalidation cache.`, e);

                return false;
            }

            return true;
        },
    });

    // Configure the server, cache, databases and routes
    const httpServer = http.createServer(app);
    await Cache.initialize();
    await Promise.all(_DB_CONFIGURATIONS.map(config => configureDatabase(Constants.COUCHDB_URL, config, { warnings: false })));
    await Promise.all(importObjectToArray(routeConfigurations).map(r => r(app, router)));

    // Wildcard route must be registered after all other routes.
    app.get("*", (req, res) => {
        if (res.finished) {
            return;
        }

        if (/^\/?api/i.test(req.url) || /^\/?dist/i.test(req.url) || /^\/?images/i.test(req.url)) {
            throw notFound();
        }

        res.sendFile(path.join(__dirname, "..", "index.html"));
    })

    // Typescript type guard for boom errors
    function isBoomError(err: any): err is BoomError {
        return err.isBoom;
    }

    // Register an error handler for all routes
    app.use(function (err: Error | BoomError, req: express.Request, res: express.Response, next: Function) {
        const fullError = isBoomError(err) ? err : wrap(err);

        if (fullError.output.statusCode >= 500) {
            inspect(`Error in ${req.url}`, err);
        }

        res.status(fullError.output.statusCode).json(fullError.output.payload);

        return next();
    } as any);

    httpServer.listen(port, hostname)
}

const host = Constants.HOST;
const port = Constants.PORT;

startServer(host, port).then(server => {
    inspect("Version:", getVersion());
    inspect(`HTTP server is listening on ${host}:${port}.`);
}).catch(e => {
    inspect("Error starting server.", e);
});