declare const _VERSION: string;

/**
 * A legacy function that used to gets the version from two different sources: the _VERSION constant injected by webpack if run in the browser, or from the package.json if run on the server.
 * Now that we're using Webpack, we just let it inject the _VERSION variable.
 */
export function getVersion(): string {
    return _VERSION;
}

export default getVersion;