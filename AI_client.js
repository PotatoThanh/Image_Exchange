var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', { reconnect: true });
var fs = require('fs');

const path = require('path');
const fileUtils = require('./utils/file_utils.js')
const dcmtk = require('./utils/dcmtk.js')
const ai = require('./utils/ai_request.js')

const channel = 'sendToAIClient';
const clientStore = 'store_AIclient';
const sendPrediction = 'sendPrediction';
const receivePrediction = 'receivePrediction';

fs.mkdirSync(clientStore, { recursive: true });

socket.on('connect', (s) => {
    console.log('Connected to server', socket.id);

});

socket.on(channel, (file, callback) => {
    const filename = file.filename;

    // save the content to the disk, for example
    var filePath = path.join(clientStore, filename);
    console.log(`filePath ${filePath}`);
    const createfolders = fileUtils.createFolderAndSubfolders(filePath)

    fileUtils.writeMyFile(filePath, file.file, "AICLIENT_WRITE")
});

// Periodically emit an event to the client every 4 seconds
var sent = []
const intervalId = setInterval(() => {

    // Get all files in the subfolder
    const filenames = fileUtils.getAllFilesInSubfolder(clientStore);

    // console.log('Filenames in the folder:', filenames);
    var nonOverlappingElements = filenames.filter(function (element) {
        return !sent.includes(element);
    });

    sent.push(...nonOverlappingElements);
    if (nonOverlappingElements.length > 0) {
        // send files to ai
        for (var i = 0; i < filenames.length; i++) {
            let filename = filenames[i]
            let ext = path.extname(filename);

            if (ext === '.png' || ext === '.jpeg' || ext === '.jpg') {
                console.log("Send:", filename)
                ai.sendReqImage(filename).then((prediction) =>{
                    var data = {'name': filename, 'prediction': prediction.class_name}
                    console.log(data)
                    socket.emit(sendPrediction, data);                    
                });

            };
        };

    };
}, 1000);

// Handle client disconnection
socket.on('disconnect', () => {
    console.log('A client disconnected.');
    // Stop the periodic emission when the client disconnects
    clearInterval(intervalId);
});
