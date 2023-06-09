var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000', { reconnect: true });
const { findScu, findScuOptions } = require('dicom-dimse-native');

const fileUtils = require('./utils/file_utils.js')
const dcmtk = require('./utils/dcmtk.js')

// Start the storescp process
const aet = "STORE_PACS";
const od = "./storeDCM";
const port = "11118";
const ip = "localhost";
const storescpProcess = dcmtk.runStorescp(aet, od, port, ip);
// Keep the Node.js application running
process.stdin.resume();

socket.on('connect', (s) => {
    console.log('Connected to server', socket.id);

});

socket.on('gate_findscu', (s) => {
    const patient = s
    const gate_ip = "localhost";
    const gate_port = "11112";
    const gate_aec = "DCM4CHEE";

    const options = {
        source: {
            aet: "MY_AET",
            ip: "127.0.0.1",
            port: 9999
        },
        target: {
            aet: gate_aec,
            ip: gate_ip,
            port: gate_port
        },
        tags: [
            {
                key: "00080052",
                value: "PATIENT",
            },
            {
                key: "00100010",
                value: patient,
            },
            {
                key: "00100030", // Date of Birth
                value: "",
            },
            {
                key: "00080060", // Modality
                value: "",
            },
            {
                key: "00080020", // Study Date
                value: "",
            },
            {
                key: "00080030", // Study Time
                value: "",
            },
            {
                key: "00081030", // Study Description
                value: "",
            },
        ],
        verbose: false
    };

    findScu(options, (result) => {
        const outputs = JSON.parse(result)
        // let data = JSON.parse(result.container);
        // let patientBirthDates = data.map(item => item['00100030'].Value[0]);
        // console.log(patientBirthDates);
        const outs = JSON.parse(outputs['container']);


        for (let i = 0; i < outs.length; i++) {
            let name = outs[i]['00100010'].Value[0].Alphabetic
            if (name == undefined) {
                name = 'N/A'
            }
            let dob = outs[i]['00100030'].Value[0]
            if (dob == undefined) {
                dob = 'N/A'
            }
            socket.emit('gate_findscu_results', { name: name, dob: dob });

        }

    });


});


socket.on('hospital_findscu', (s) => {
    const patient = s
    const hospital_ip = "192.168.192.16";
    const hospital_port = "11112";
    const hospital_aec = "DCM4CHEE";

    const options = {
        source: {
            aet: "MY_AET",
            ip: "127.0.0.1",
            port: 9999
        },
        target: {
            aet: hospital_aec,
            ip: hospital_ip,
            port: hospital_port
        },
        tags: [
            {
                key: "00080052",
                value: "PATIENT",
            },
            {
                key: "00100010",
                value: patient,
            },
            {
                key: "00100030", // Date of Birth
                value: "",
            },
            {
                key: "00080060", // Modality
                value: "",
            },
            {
                key: "00080020", // Study Date
                value: "",
            },
            {
                key: "00080030", // Study Time
                value: "",
            },
            {
                key: "00081030", // Study Description
                value: "",
            },
        ],
        verbose: false
    };

    findScu(options, (result) => {
        const outputs = JSON.parse(result)
        // let data = JSON.parse(result.container);
        // let patientBirthDates = data.map(item => item['00100030'].Value[0]);
        // console.log(patientBirthDates);
        const outs = JSON.parse(outputs['container']);


        for (let i = 0; i < outs.length; i++) {
            let name = outs[i]['00100010'].Value[0].Alphabetic
            if (name == undefined) {
                name = 'N/A'
            }
            let dob = outs[i]['00100030'].Value[0]
            if (dob == undefined) {
                dob = 'N/A'
            }
            // console.log(name);
            // console.log(dob);
            socket.emit('hospital_findscu_results', { name: name, dob: dob });

        }

    });


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


}, 1000);

// Handle client disconnection
socket.on('disconnect', () => {
    console.log('A client disconnected.');
    // Stop the periodic emission when the client disconnects
    clearInterval(intervalId);
});

