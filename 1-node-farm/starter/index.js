const fs = require('fs'); //File system module
const http = require('http'); //Spawn server

///////////////////////////////////////////////
// FILE SYSTEM
/*This code is Synchronous. Each line will block the next one.*/
/*
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8')
console.log(textIn)
const textOut = `This is what we know about avacado: ${textIn}.\n Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('File Written!')


//Asynchronous file read - Callback leads to callback hell - difficult to maintain code structure.
//readfile and not readfileSync.
fs.readFile('./txt/start.txt', 'utf-8',(err, data1) => {

    fs.readFile(`./txt/${data1}.txt`, 'utf-8',(err, data2) => {
        console.log(data2);

        fs.readFile(`./txt/append.txt`, 'utf-8',(err, data3) => {
            console.log(data3);

            fs.writeFile(`./txt/final.txt`, `${data2}\n${data3}`,'utf-8',  err => {
                console.log('Your file has been written')
            })
        })
    })
})
console.log('Will read file!');
*/


///////////////////////////////////////////////
// SERVER

const server = http.createServer((req, res) => {
    console.log(req)
    res.end('Hello from the server!');
});

server.listen(8000, 'localhost', () => {
    console.log('Listening to request on port 8000')
});
