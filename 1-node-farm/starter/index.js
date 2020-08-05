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
const replaceTemplate = (temp, product) => {
    let output  = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
    output  = output.replace(/{%ID%}/g, product.id);
    output  = output.replace(/{%IMAGE%}/g, product.image);
    output  = output.replace(/{%QUANTITY%}/g, product.quantity);
    output  = output.replace(/{%PRICE%}/g, product.price);
    output  = output.replace(/{%FROM%}/g, product.from);
    output  = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output  = output.replace(/{%DESCRIPTION%}/g, product.description);

    if (!product.organic) output  = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic'); //css class name
    return output
};
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8')
const dataObj = JSON.parse(data);

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8')
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8')


const server = http.createServer((req, res) => {
    // console.log(url.parse(req.url, true))
    // const pathName = req.url;
    const {query, pathname } = url.parse(req.url, true) //exact value on the left side will fetch the names from the right side

    //Overview Page
    if (pathname === '/overview' || pathname === '/') {
        res.writeHead(200, {'Content-type':'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join(''); //join array to a single string
        const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);
        res.end(output);

    } else if (pathname === '/product') {
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.writeHead(200, {'Content-type':'text/html'});
        res.end(output);

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
