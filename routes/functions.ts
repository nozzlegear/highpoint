import * as Dbs from '../database';
import * as gv from 'gearworks-validation';
import * as Requests from 'requests/functions';
import { Express } from 'express';
import { FunctionType, User } from 'highpoint';
import { HighpointFunction } from 'highpoint';
import { Paths } from '../modules/paths';
import { RouterFunction } from 'gearworks-route/bin';

export async function registerFunctionRoutes(app: Express, route: RouterFunction<User>) {
    const functionTypeValidator = gv.onlyStrings<FunctionType>("timer", "http");

    route({
        label: "Create a function",
        method: "post",
        receivesFiles: true,
        requestSizeLimit: "25mb",
        path: Paths.api.functions.create,
        bodyValidation: gv.object<HighpointFunction>({
            _id: gv.strip(),
            _rev: gv.strip(),
            updatedAt: gv.strip(),
            name: gv.string().required(),
            type: functionTypeValidator.required(),
        }),
        handler: async function (req, res, next) {
            // TODO: Accept and unzip a zip file that contains a package.json and run yarn install on it.
            const func: HighpointFunction = { ...req.validatedBody, updatedAt: Date.now() };
            const result = await Dbs.Functions.post(func);

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
        bodyValidation: gv.object<HighpointFunction>({
            updatedAt: gv.strip(),
            _id: gv.strip(),
            _rev: gv.string().required(),
            name: gv.string(),
            type: functionTypeValidator
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