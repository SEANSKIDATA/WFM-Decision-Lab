// Loads the engine directly from the deployed index.html, so tests always run
// against the code GitHub Pages serves — never a separate copy.
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = src.match(/<script type="text\/babel">([\s\S]*?)<\/script>/)[1];
const engine = js.slice(0, js.indexOf('const hhmm =')).replace('const { useState, useMemo } = React;', '');
const ctx = { Math, Array, Number, Object, JSON, console };
vm.createContext(ctx);
vm.runInContext(engine + '\n;this.E={analyze,demandShape,allocateInt,evaluateDay,redistribute};', ctx);
module.exports = ctx.E;
