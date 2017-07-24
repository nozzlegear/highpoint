import * as boom from 'boom';
import * as gv from 'gearworks-validation';
import * as Requests from 'requests/functions';
import { Express } from 'express';
import { Paths } from '../modules/paths';
import { RouterFunction } from 'gearworks-route/bin';
import { User } from 'highpoint';

export async function registerFunctionRoutes(app: Express, route: RouterFunction<User>) {
    route({
        label: "Create a function",
        method: "post",
        receivesFiles: true,
        requestSizeLimit: "25mb",
        path: Paths.api.functions.create,
        handler: async function (req, res, next) {
            return next(boom.notImplemented());
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
            return next(boom.notImplemented());
        }
    })
}