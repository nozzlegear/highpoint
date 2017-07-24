import inspect from 'logspect';
import isBrowser from 'is-in-browser';
import { resolve } from 'path';
import { snakeCase } from 'lodash';
import { User } from 'highpoint';

// NODE_ENV and _VERSION are injected by webpack.
declare const NODE_ENV: string;

const env = process && process.env || {};

export const isWebpack = process && process.mainModule && /webpack.js$/.test(process.mainModule.filename) && process.argv.find(arg => /webpack$/.test(arg)) !== undefined;

export const APP_NAME = "Highpoint";

export const SNAKED_APP_NAME = snakeCase(APP_NAME.toLowerCase());

function get(baseKey: string, defaultValue = undefined) {
    const snakedAppName = SNAKED_APP_NAME.toUpperCase();
    const snakedKey = snakeCase(baseKey).toUpperCase();

    return env[`${snakedAppName}_${snakedKey}`] || env[`GEARWORKS_${snakedKey}`] || env[snakedKey] || env[`${snakedAppName}_${baseKey}`] || env[baseKey] || defaultValue;
}

// Checking the process for NODE_ENV when on the server so we can test the packaged app on dev machine without it redirecting to https
export const ISLIVE = isBrowser ? NODE_ENV === "production" : env["NODE_ENV"];

export const COUCHDB_URL = get("COUCHDB_URL", "http://localhost:5984");

export const JWT_SECRET_KEY = get("JWT_SECRET_KEY");

export const IRON_PASSWORD = get("IRON_PASSWORD");

export const SCI_API_KEY = get("SCI_API_KEY");

export const AUTH_HEADER_NAME = "x-highpoint-token";

export const HOST = get("HOST", "127.0.0.1");

export const PORT = get("PORT", 3000);

/**
 * A list of properties on a user or sessiontoken object that will be automatically sealed and unsealed by Iron.
 */
export const SEALABLE_USER_PROPERTIES = [];

export const CACHE_SEGMENT_AUTH = "auth-invalidation";

if (!isBrowser && !isWebpack) {
    if (!JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY was not found in environment variables. Session authorization would be unsecure and exhibit unwanted behavior.")
    }

    if (!IRON_PASSWORD) {
        throw new Error("IRON_PASSWORD was not found in environment variables. Session authorization would be unsecure and exhibit unwanted behavior.");
    }
}