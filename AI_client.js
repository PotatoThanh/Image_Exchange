var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', {reconnect: true});
var fs = require('fs');

socket.on('connect', (s) => {
    console.log('Connected to server', socket.id);
    
});
const path = require('path');
const fileUtils = require('./utils/file_utils.js')

const channel = 'sendToAIClient'
const clientStore = 'store_AIclient'


socket.on(channel, (file, callback) => {
    const filename = file.filename;

    // save the content to the disk, for example
    var filePath = path.join(clientStore, filename);
    console.log(`filePath ${filePath}`);
    const createfolders = fileUtils.createFolderAndSubfolders(filePath)

    fileUtils.writeMyFile(filePath, file.file, "AI_CLIENT_WRITE")
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

