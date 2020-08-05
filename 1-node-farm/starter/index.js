const fs = require('fs'); //File system module
const http = require('http'); //Spawn server
const url = require('url'); //For webpage routing

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
//./ points to location from where node executes index.js
//${__dirname} points to location where index.js exists

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const productData = JSON.parse(data);

const server = http.createServer((req, res) => {
    const pathName = req.url;
    if (pathName === '/overview' || pathName === '/') {
        res.end('This is Overview');

    } else if (pathName === '/product') {
        res.end('This is Product');

    } else if (pathName === '/api') {
        res.writeHead(200, {
            'Content-type': 'application/json'
        })
        res.end(JSON.stringify(productData));

    } else {
        res.writeHead(404, {
            'Content-type':'text/html',
            'my-custom-header':'Hello World'
        });
        res.end('<h1>Page not found!</h1>');
    }

});

server.listen(8000, 'localhost', () => {
    console.log('Listening to request on port 8000')
});
