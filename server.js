import http from 'http';
import fs from 'fs';
// import express from 'express';
// const app = express()
const port = 5173;

const server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

        fs.readFile ('index.html', function (error, data ){
            if (error) {
                res.writeHead(404)
                res.write ('Error: File not found')
            } else 
            {
                res.write(data)
            }
            res.end();
        })
});

server.listen(port, function(error) {
    if (error) {
        console.log('Error Code:', error);
    } else {
        console.log('Server is listening on port ' + port);
    }
});
