// ═══════════════════════════════════════════════════════════
//  NEXOWORK — Netlify Serverless Function
//  Wraps the Express app so it runs as a Netlify Function.
//  URL: /.netlify/functions/api/...
//
//  Deploy: Netlify automatically deploys this from /netlify/functions/
// ═══════════════════════════════════════════════════════════

const serverless = require("serverless-http");
const app        = require("../../backend/src/app");

// Wrap Express app as a serverless handler
const handler = serverless(app);

exports.handler = async (event, context) => {
  // Netlify passes cold-start context; reuse DB connections
  context.callbackWaitsForEmptyEventLoop = false;
  return handler(event, context);
};
