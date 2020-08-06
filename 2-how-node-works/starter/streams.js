const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res)=> {
    //Huge file read can block the code
    /*fs.readFile('test-file.txt', (err, data)=>{
        if (err) console.log(err);
        res.end(data);
    })*/

    //Stream data
    /*const readable = fs.createReadStream('test-file.txt')
    readable.on('data', chunk => {
       res.write(chunk);
    });
    readable.on('end', () => {
        res.end();
    });
    readable.on('error', () => {
        res.statusCode = '500';
        res.end('File not found');
    })*/

    //Stream without back pressure
    const readable = fs.createReadStream('test-file.txt')
    readable.pipe(res); //readableSource.pipe(writeableDest)


})

server.listen(8000, 'localhost', () => {
    console.log('Listening...')
})