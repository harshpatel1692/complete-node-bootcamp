//Module-1 - Class
const C = require('./test-module-1');

const calc = new C();

console.log(calc.add(5,2));



///Module-2 - Inline exports
const calc2 = require('./test-module-2')
console.log(calc2.add(5,7))


///Module-3 - Caching
// 'hello from the module' will pop up once as the require function is cached for later use
require("./test-module-3")();
require("./test-module-3")();