import * as boom from 'boom';
import * as Cache from 'gearworks-cache';
import * as constants from '../modules/constants';
import * as Db from '../database';
import * as gv from 'gearworks-validation';
import { compareSync } from 'bcryptjs';
import { CreateSession } from 'requests/sessions';
import { DavenportError } from 'davenport/bin';
import { Express } from 'express';
import { Paths } from '../modules/paths';
import { RouterFunction } from 'gearworks-route/bin';
import { User } from 'highpoint';

export function registerSessionRoutes(app: Express, route: RouterFunction<User>) {
    route({
        label: "Create session",
        method: "post",
        path: Paths.api.sessions.create,
        requireAuth: false,
        bodyValidation: gv.object<CreateSession>({
            username: gv.string().required(),
            password: gv.string().required(),
        }),
        handler: async function (req, res, next) {
            const model: CreateSession = req.validatedBody;
            let user: User;

            try {
                user = await Db.Users.get(model.username.toLowerCase());
            } catch (_e) {
                const e: DavenportError = _e;

                if (e.status === 404) {
                    return next(boom.notFound(`No user with username ${model.username} exists.`));
                }

                throw e;
            }

            if (!compareSync(model.password, user.hashedPassword)) {
                return next(boom.unauthorized(`Password is incorrect.`));
            }

            await res.withSessionToken(user);

            // User has logged in successfully, remove their id from the auth-invalidation cache.
            await Cache.deleteValue(constants.CACHE_SEGMENT_AUTH, user._id);

            return next();
        }
    });
}