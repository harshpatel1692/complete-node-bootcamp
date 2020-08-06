const EventEmitter = require('events');
const http = require('http');
// const myEmitter = new EventEmitter();

class Sales extends EventEmitter {
    constructor() {
        super(); //Necessary when extended classes are created
    }
}

const myEmitter = new Sales();

myEmitter.on('newSale', () => {
   console.log('There was a new sale!')
});

myEmitter.on('newSale', () => {
    console.log('There was a second sale!')
});

myEmitter.on('newSale', stock => {
    console.log(`There are now ${stock} items left in the stock`);
});

myEmitter.emit('newSale', 9);

////////////////////

const server = http.createServer();

server.on('request', (req, res) => {
    console.log('Request received!')
    res.end('Request received!')
})

server.on('request', (req, res) => {
    console.log('Another request!')
})

server.on('close', () => {
    console.log('Server closed')
})

server.listen(8000, 'localhost', () => {
    console.log('Waiting for requests...');
})