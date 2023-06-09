const { exec } = require('child_process');
const fs = require('fs');

// Function to run the storescp command
function runStorescp(aet, od, port, ip) {
    // const cmd = `kill -9 $(lsof -t -i:${port})`;
    // exec(cmd, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error executing command: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.error(`Command stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`Command output: ${stdout}`);
    // });

    // Create the directory and subdirectories recursively
    fs.mkdirSync(od, { recursive: true });

    // Set the command to execute storescp
    const command = `storescp -aet ${aet} -od ${od} -v --fork -sp ${port}/${ip}`;

    // Execute the storescp command
    const storescpProcess = exec(command);

    // Handle process events (optional)
    storescpProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    storescpProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    storescpProcess.on('close', (code) => {
        console.log(`storescp process exited with code ${code}`);
    });

    storescpProcess.on('error', (err) => {
        console.error('storescp process error:', err);
    });

    // Return the storescp process instance (optional)
    return storescpProcess;
}

// Function to run the storescu command
function runStorescu(ip, port, pathFile, aet) {
    
    //"storescu {} {} {} +sd -aet {}".format(PACs_IP, PACs_PORT, os.path.join(FTP_Receiver, i[0]), PACs_AET)
    // Set the command to execute storescu
    const command = `storescu ${ip} ${port} ${pathFile} +sd -aet ${aet}`;

    // Execute the storescp command
    const storescuProcess = exec(command);

    // Handle process events (optional)
    storescuProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    storescuProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    storescuProcess.on('close', (code) => {
        console.log(`storescu process exited with code ${code}`);
    });

    storescuProcess.on('error', (err) => {
        console.error('storescu process error:', err);
    });

    // Return the storescp process instance (optional)
    return storescuProcess;
}

// Function to run the findscu command
function runFindscu(patient, ip, port, aec) {
    
    //"storescu {} {} {} +sd -aet {}".format(PACs_IP, PACs_PORT, os.path.join(FTP_Receiver, i[0]), PACs_AET)
    // Set the command to execute storescu
    const command = `findscu -v -P -k 0008,0052="PATIENT" -k 0010,0010="${patient}" -k 0010,0030="*" -k 0008,0060="*" -k 0008,1030="*" -aec ${aec} ${ip} ${port}`;

    // Execute the storescp command
    const storescuProcess = exec(command);

    // Handle process events (optional)
    var outputs = ''
    storescuProcess.stdout.on('data', (data) => {
        outputs = outputs + data
        console.log(`stdout: ${data}`);
    });

    storescuProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    storescuProcess.on('close', (code) => {
        console.log(`storescu process exited with code ${code}`);
    });

    storescuProcess.on('error', (err) => {
        console.error('storescu process error:', err);
    });

    // Return the storescp process instance (optional)
    return outputs;
}

module.exports.runStorescp = runStorescp;
module.exports.runStorescu = runStorescu;
module.exports.runFindscu = runFindscu;
