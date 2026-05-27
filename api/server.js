// Express handler pre-built by esbuild during Vercel's build step.
// Using a pre-built CJS bundle avoids ncc having to resolve workspace TypeScript packages.
const handler = require("../artifacts/api-server/dist-vercel/vercel.cjs");
module.exports = handler.default ?? handler;
