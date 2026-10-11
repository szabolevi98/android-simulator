// Every page loads strings.js (AndroidStrings) before its modules; a test that runs modules in a vm context gets it the
// same way: require('./lib/vm-strings.cjs') before using node:vm.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const SOURCE = fs.readFileSync(path.join(__dirname, '..', '..', 'strings.js'), 'utf8');
const {runInNewContext, runInContext} = vm;
const prepare = context => {
  if (context && typeof context === 'object' && !context.AndroidStrings) {
    if (vm.isContext(context)) runInContext.call(vm, SOURCE, context); else runInNewContext.call(vm, SOURCE, context);
  }
};
vm.runInNewContext = function (code, context, ...rest) { prepare(context); return runInNewContext.call(vm, code, context, ...rest); };
vm.runInContext = function (code, context, ...rest) { prepare(context); return runInContext.call(vm, code, context, ...rest); };
