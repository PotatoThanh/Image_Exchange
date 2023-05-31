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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on("server_upload", (file, callback) => {
        let filename = file.filename;

        // save the content to the disk, for example
        var filePath = `./server_upload/${filename}`;
        fs.writeFile(filePath, file.file, (err) => {
            if (err) {
                console.log('An error occurred while writing the file', err);
            }
            else {
                console.log('File has been saved', filename);
            }
        });

    });


    // Periodically emit an event to the client every 4 seconds
    var sent = []
    const intervalId = setInterval(() => {
        var folderPath = './server_upload'
        fs.readdir(folderPath, (err, filenames) => {
            if (err) {
                console.error('Error reading folder:', err);
                return;
            }

            // console.log('Filenames in the folder:', filenames);
            var nonOverlappingElements = filenames.filter(function (element) {
                return !sent.includes(element);
            });

            sent.push(...nonOverlappingElements);
            if (nonOverlappingElements.length > 0) {
                send_to_client(filenames, socket, "client_upload");
                send_to_client(filenames, socket, "ai_client_upload");
            }
        });

    }, 2000);

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('A client disconnected.');
        // Stop the periodic emission when the client disconnects
        clearInterval(intervalId);
    });


});

function send_to_client(filenames, socket, channel) {
    // send files to clients
    for (var i = 0; i < filenames.length; i++) {
        let filename = filenames[i]
        let filePath = `./server_upload/${filename}`;
        console.log(`Send to ${channel}:`, filePath)
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log('Error reading file: ', err);
            }

            // Send the buffer to server
            socket.emit(channel, { 'filename': filename, 'file': data });
        });
    };
};
http.listen(3000, () => {
    console.log('listening on localhost:3000');
});