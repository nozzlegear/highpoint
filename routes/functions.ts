import * as boom from 'boom';
import * as Dbs from '../database';
import * as gv from 'gearworks-validation';
import * as Requests from 'requests/functions';
import { Express } from 'express';
import { FunctionType, User } from 'highpoint';
import {
    getHighpointFunction,
    getHighpointFunctionPath,
    installAndPack,
    unzip
    } from '../modules/installer';
import { HighpointConfig, HighpointFunction } from 'highpoint';
import { inspect } from 'logspect/bin';
import { Paths } from '../modules/paths';
import { RouterFunction } from 'gearworks-route/bin';
import { v4 as guid } from 'node-uuid';

export async function registerFunctionRoutes(app: Express, route: RouterFunction<User>) {
    const configValidator = gv.object<HighpointConfig>({
        name: gv.string().required(),
        type: gv.onlyStrings<FunctionType>("timer", "http").required(),
    })

    route({
        label: "Execute a request on the function",
        method: "all",
        path: Paths.api.functions.exec,
        paramValidation: gv.object<Requests.GetUpdateDeleteParams>({
            id: gv.string().required()
        }),
        handler: async function (req, res, next) {
            const params: Requests.GetUpdateDeleteParams = req.validatedParams;
            const func = getHighpointFunction(params.id);

            await func(req, res, (...args: any[]) => inspect(...args));

            res.json({ ok: true });

            return next();
        }
    })

    route({
        label: "Create a function",
        method: "post",
        receivesFiles: true,
        requestSizeLimit: "25mb",
        path: Paths.api.functions.create,
        handler: async function (req, res, next) {
            // TODO: Accept and unzip a zip file that contains a package.json and run yarn install on it.

            if (!req.files) {
                req.files = {};
            }

            const zipFile = req.files["function"];

            if (!zipFile) {
                return next(boom.badData("function file is required."));
            }

            // Create the directory named by the doc's id and place the user's data in it.
            const id = guid();
            const dirPath = getHighpointFunctionPath(id);
            let config: HighpointConfig;

            try {
                config = await unzip(zipFile, dirPath);
            } catch (e) {
                // There was likely a missing package.json or highpoint.json
                return next(boom.badData(e));
            }

            // Validate the highpoint.json config
            const validation = gv.validate<HighpointConfig>(config, configValidator);

            if (!validation.error) {
                return next(boom.badData(validation.error));
            }

            // Create the doc
            const func: HighpointFunction = { ...validation.value, _id: id, updatedAt: Date.now() };
            const result = await Dbs.Functions.put(id, func, undefined as any);

            await installAndPack(dirPath);

            res.json<HighpointFunction>({ ...func, _id: result.id, _rev: result.rev });

            return next();
        }
    })

    route({
        label: "Update a function",
        method: "put",
        receivesFiles: true,
        requestSizeLimit: "25mb",
        path: Paths.api.functions.update,
        paramValidation: gv.object<Requests.GetUpdateDeleteParams>({
            id: gv.string().required()
        }),
        handler: async function (req, res, next) {
            // TODO: Accept and unzip a zip file that contains a package.json and run yarn install on it.
            const params: Requests.GetUpdateDeleteParams = req.validatedParams;
            const func: HighpointFunction = req.validatedBody;
            const original = await Dbs.Functions.get(params.id);
            const updated: HighpointFunction = { ...original, ...func, updatedAt: Date.now() };
            const result = await Dbs.Functions.put(params.id, updated, func._rev as string);

            res.json<HighpointFunction>({ ...updated, _id: result.id, _rev: result.rev });

            return next();
        }
    })
}