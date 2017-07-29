import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import { HighpointConfig } from 'highpoint';
import { UploadedFile } from 'gearworks-route/bin';
import decompress = require("decompress");

/**
 * REQUIRE_FUNCTION is injected by webpack. Necessary because using regular requires will fail, as Webpack will replace
 * the require function with a webpack error that the dynamic module couldn't be found.
 */
declare const REQUIRE_FUNCTION: (id: string) => (req: any, res: any, log: any) => void;

const exists = (path: string) => new Promise<boolean>((resolve, reject) => {
    fs.exists(path, (exists) => {
        return resolve(exists);
    })
});

const readFile = (path: string) => new Promise<string>((resolve, reject) => {
    fs.readFile(path, (err, data) => {
        if (err) {
            return reject(err);
        }

        return resolve(data.toString());
    })
})

/**
 * Gets the path to the function's folder.
 * @param functionId The function's id.
 */
export function getHighpointFunctionPath(functionId: string) {
    return path.join(__dirname, "user-functions", functionId);
}

/**
 * Takes a zip file and unzips it at the given path.
 * @param zipFile The zipped file. Will be checked that it contains a package.json and highpoint.json, throwing an error if false.
 * @param path Folder path to install the zipped files to.
 */
export async function unzip(zipFile: UploadedFile, folderPath: string): Promise<HighpointConfig> {
    await createDir(folderPath);
    await decompress(zipFile.data, folderPath);

    const highpointPath = path.join(folderPath, "highpoint.json");
    const highpointExists = await exists(highpointPath);
    const packageExists = await exists(path.join(folderPath, "package.json"));

    if (!packageExists) {
        throw new Error("package.json is required.");
    }

    if (!highpointExists) {
        throw new Error("highpoint.json is required.");
    }

    const highpointConfig = await readFile(highpointPath);

    return JSON.parse(highpointConfig);
}

/**
 * Takes a path and runs yarn install and webpack on the package.json there.
 * @param path Folder path that contains the package.json.
 */
export async function installAndPack(path: string) {
    await yarnInstall(path);
    await webpack(path);
}

/**
 * Requires and returns a Highpoint function with the given id.
 */
export function getHighpointFunction(functionId: string) {
    const path = getHighpointFunctionPath(functionId);

    return REQUIRE_FUNCTION(path);
}

const createDir = (path: string) => new Promise<string>((resolve, reject) => {
    fs.exists(path, exists => {
        if (exists) {
            return resolve();
        }

        mkdirp(path, (err, made) => {
            if (err) {
                return reject(err);
            }

            return resolve(made);
        })
    })
});

const yarnInstall = (path: string) => new Promise<void>((resolve, reject) => {
    return resolve();
});

const webpack = (path: string) => new Promise<void>((resolve, reject) => {
    return resolve();
})