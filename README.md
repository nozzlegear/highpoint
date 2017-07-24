# Highpoint

Highpoint is a self-hosted, basic serverless function platform ala Azure Functions without the connections. The plan is to support TypeScript functions out-of-the-box, with .NET Core functions support planned for the future.

## Why should I use this over Azure Functions or AWS Lambda?

I don't know! I just wanted to create my own version for funsies. To kind-of answer this question, here are the things that I'm looking to support that isn't supported in (at least) Azure:

1. Always-on functions, without paying $50+/month. 
2. TypeScript functions.
3. Self-hosted.

## TODO

- [ ] Creating a function requires an API key. They should be able to log in and generate that key, or generate it from the CLI.
- [ ] Function URLs need to be hardcoded. Maybe something like `highpoint.url/my-username-or-something-else/guid`? 
    - Maybe the user can designate that guid in a `function.json` or `highpoint.json`.
- [ ] We need logs! And streaming logs!
- [ ] Functions triggered on an HTTP request.
- [ ] Functions triggered on a (cron) schedule.