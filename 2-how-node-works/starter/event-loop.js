const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 2; //Change threads. by default

setTimeout( () => console.log("Timer 1 finished"), 0);
setImmediate( () => console.log("Immediate 1 finished"));

fs.readFile('test-file.txt', () => {
    console.log('I/O finished');
    setTimeout( () => console.log("Timer 2 finished"), 0);
    setTimeout( () => console.log("Timer 3 finished"), 3000);

    setImmediate( () => console.log("Immediate 2 finished"));

    process.nextTick(() => console.log("Process.nextTick")); //Intermediate operations between each block. in this case I/0 and immediate2

    /*4 Thread pool by default*/
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now()-start, 'Password encrypted')
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now()-start, 'Password encrypted')
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now()-start, 'Password encrypted')
    });
    crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
        console.log(Date.now()-start, 'Password encrypted')
    });
})

console.log("Hello from the top-level code");