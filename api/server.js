// Built into this same directory by esbuild during Vercel's build step.
// All pino worker .cjs files are co-located here and declared via includeFiles.
const handler = require("./vercel.cjs");
module.exports = handler.default ?? handler;
