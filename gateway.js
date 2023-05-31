var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', { reconnect: true });

const fileUtils = require('./utils/file_utils.js')
const dcmtk = require('./utils/dcmtk.js')

// Start the storescp process
const aet = "PACS";
const od = "./storeDCM";
const port = "11112";
const ip = "192.168.192.239";
const storescpProcess = dcmtk.runStorescp(aet, od, port, ip);
// Keep the Node.js application running
process.stdin.resume();

socket.on('connect', (s) => {
    console.log('Connected to server', socket.id);

});

// Periodically emit an event to the client every 4 seconds
var sent = []
const intervalId = setInterval(() => {
    // Get all files in the subfolder
    const filenames = fileUtils.getAllFilesInSubfolder(od);

    // console.log('Filenames in the folder:', filenames);
    var nonOverlappingElements = filenames.filter(function (element) {
        return !sent.includes(element);
    });

    sent.push(...nonOverlappingElements);
    if (nonOverlappingElements.length > 0) {
        fileUtils.sendToDestination(filenames, socket, "sendToServer");
    }


}, 4000);

// Handle client disconnection
socket.on('disconnect', () => {
    console.log('A client disconnected.');
    // Stop the periodic emission when the client disconnects
    clearInterval(intervalId);
});

