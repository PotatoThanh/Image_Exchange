var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', { reconnect: true });
var fs = require('fs');

const path = require('path');
const fileUtils = require('./utils/file_utils.js')
const dcmtk = require('./utils/dcmtk.js')

const channel = 'sendToClient'
const clientStore = 'store_client'

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

    fileUtils.writeMyFile(filePath, file.file, "CLIENT_WRITE")
});

// Periodically emit an event to the client every 4 seconds
var sent = []
const intervalId = setInterval(() => {
    const ip = "192.168.192.239";
    const port = "11113";
    const aet = "REC_PACS"
    // storescp -aet REC_PACS -od Rec_PACS -v --fork -su '' 11113/192.168.192.239
    // Get all files in the subfolder
    const filenames = fileUtils.getAllFilesInSubfolder(clientStore);

    // console.log('Filenames in the folder:', filenames);
    var nonOverlappingElements = filenames.filter(function (element) {
        return !sent.includes(element);
    });

    sent.push(...nonOverlappingElements);
    if (nonOverlappingElements.length > 0) {
        // send files to clients
        for (var i = 0; i < filenames.length; i++) {
            const filename = filenames[i]
            console.log(`Send to ${aet}:`, filename)
            const storescpProcess = dcmtk.runStorescu(ip, port, filename, aet)
        };
        
    }
}, 4000);

// Handle client disconnection
socket.on('disconnect', () => {
    console.log('A client disconnected.');
    // Stop the periodic emission when the client disconnects
    clearInterval(intervalId);
});
