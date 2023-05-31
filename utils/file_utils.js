const fs = require('fs');
const path = require('path');

// Function to create a folder and subfolders at a given path
function createFolderAndSubfolders(folderPath) {
    // Get the directory path from the file path
    const directoryPath = path.dirname(folderPath);

    // Normalize the directory path to ensure consistent path separators
    const normalizedDirectoryPath = path.normalize(directoryPath);

    // Create the directory and subdirectories recursively
    fs.mkdirSync(normalizedDirectoryPath, { recursive: true });
}

// Function to recursively get all files in a subfolder
function getAllFilesInSubfolder(folderPath) {
    let files = [];

    // Get all items (files and subfolders) in the given folder
    const items = fs.readdirSync(folderPath);

    items.forEach((item) => {
        const itemPath = path.join(folderPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile()) {
            // If the item is a file, add it to the files array
            files.push(itemPath);
        } else if (stat.isDirectory()) {
            // If the item is a subfolder, recursively call the function
            // to get files in the subfolder and concatenate the results
            const subfolderFiles = getAllFilesInSubfolder(itemPath);
            files = files.concat(subfolderFiles);
        }
    });

    return files;
}

function sendToDestination(filenames, socket, channel) {
    // send files to clients
    for (var i = 0; i < filenames.length; i++) {
        const filename = filenames[i]
        console.log(`Send to ${channel}:`, filename)
        fs.readFile(filename, (err, data) => {
            if (err) {
                console.log('Error reading file: ', err);
            }

            // Send the buffer to server
            socket.emit(channel, { 'filename': filename, 'file': data });
        });
    };
};

function periodicallyEmit(folderPath, socket, channel) {
    // Periodically emit an event to the client every 4 seconds
    var sent = []
    const intervalId = setInterval(() => {
        // Get all files in the subfolder
        const filenames = getAllFilesInSubfolder(folderPath);

        console.log('Filenames in the folder:', filenames);
        var nonOverlappingElements = filenames.filter(function (element) {
            return !sent.includes(element);
        });

        sent.push(...nonOverlappingElements);
        if (nonOverlappingElements.length > 0) {
            sendToDestination(filenames, socket, channel);
        }


    }, 4000);
}

function writeMyFile(pathFile, data, msg) {
    // save the content to the disk, for example
    fs.writeFile(pathFile, data, (err) => {
        if (err) {
            console.log(`${msg}: An error occurred while writing the client file`, err);
        }
        else {
            console.log(`${msg}: Client file has been saved`, pathFile);
        }
    });
}

module.exports.createFolderAndSubfolders = createFolderAndSubfolders;
module.exports.getAllFilesInSubfolder = getAllFilesInSubfolder;
module.exports.sendToDestination = sendToDestination;
module.exports.periodicallyEmit = periodicallyEmit;
module.exports.writeMyFile = writeMyFile;