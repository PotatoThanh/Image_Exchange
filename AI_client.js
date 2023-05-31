var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});
var fs = require('fs');

socket.on('connect', (s) => {
    console.log('Connected to server', socket.id);
    
});

socket.on('ai_client_upload', (file, callback) => {
    const filename = file.filename;

    // save the content to the disk, for example
    fs.writeFile(`./AI_client_upload/${filename}`, file.file, (err) => {
        if (err) {
            console.log('An error occurred while writing the client file', err);
        }
        else {
            console.log('Client file has been saved', filename);
        }
    });
});
socket.on('disconnect', function () {
    console.log('Disconnected from server');
});
