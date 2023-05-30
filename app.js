var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http, {
    maxHttpBufferSize: 1e8, // 100 MB we can upload to server (By Default = 1MB)
    pingTimeout: 60000, // increate the ping timeout 
    cors: {
        origin: "*",
    },
});
const fs = require('fs');

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/index.html');
});

io.on('connection', function (socket) {
    console.log('A user connected', socket.id);
    socket.on("upload", (file, callback) => {
        console.log(file); // <Buffer 25 50 44 ...>

        // save the content to the disk, for example
        fs.writeFile(__dirname+'/upload/', file, (err) => {
            console.log(err);
        });
    });

});
http.listen(3000, function () {
    console.log('listening on localhost:3000');
});