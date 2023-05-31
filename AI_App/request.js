const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function sendImage() {
    const form_data = new FormData();

    // Assuming image.png is in the same directory as this script
    form_data.append('file', fs.createReadStream('examples/Cat.jpg'));

    try {
        const response = await axios.post('http://192.168.192.239:5000/predict', form_data, {
            headers: {
                ...form_data.getHeaders()
            }
        });

        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

sendImage();
