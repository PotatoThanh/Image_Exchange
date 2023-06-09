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
const path = require('path');

const fileUtils = require('./utils/file_utils.js')
const serverStore = 'store_server'
const channel = 'sendToServer'

fs.mkdirSync(serverStore, { recursive: true });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on(channel, (file, callback) => {
        const filename = file.filename;

        // save the content to the disk, for example
        var filePath = path.join(serverStore, filename);
        console.log(`filePath ${filePath}`);
        const createfolders = fileUtils.createFolderAndSubfolders(filePath)

        fileUtils.writeMyFile(filePath, file.file, "SERVER_WRITE")

    });

    socket.on('search', (msg, callback) => {
        const patientName = msg.search;
        console.log(patientName)
        io.sockets.emit('gate_findscu', patientName);
        io.sockets.emit('hospital_findscu', patientName);

    });
    socket.on('hospital_findscu_results', (data) => {
        console.log('hospital_findscu_results', data)
        io.sockets.emit('hospital-search', data);

    });
    socket.on('gate_findscu_results', (data) => {
        console.log('gate_findscu_results',data)
        io.sockets.emit('gate-search', data);

    });

    const sendPrediction = 'sendPrediction';
    const receivePrediction = 'receivePrediction';
    socket.on(sendPrediction, (data) => {
        // console.log(data)
        //Send predictions
        io.sockets.emit(receivePrediction, data);
    });

    // Periodically emit an event to the client every 4 seconds
    var sent = []
    const intervalId = setInterval(() => {
        // Get all files in the subfolder
        const filenames = fileUtils.getAllFilesInSubfolder(serverStore);

        // console.log('Filenames in the folder:', filenames);
        var nonOverlappingElements = filenames.filter(function (element) {
            return !sent.includes(element);
        });

        sent.push(...nonOverlappingElements);
        if (nonOverlappingElements.length > 0) {
            fileUtils.sendToDestination(filenames, socket, "sendToClient");
            fileUtils.sendToDestination(filenames, socket, "sendToAIClient");
        }


    }, 1000);

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('A client disconnected.', socket.id);
        // Stop the periodic emission when the client disconnects
        clearInterval(intervalId);
    });


});


http.listen(3000, () => {
    console.log('listening on localhost:3000');
});