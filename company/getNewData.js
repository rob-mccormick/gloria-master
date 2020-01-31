const fs = require('fs');
const request = require('request');

// const auth = require('../index');

// const baseUrl = 'https://app.idealrole.com/api/';
const baseUrl = 'http://127.0.0.1:5000/api/';

function writeToFile(data, path) {
    const json = JSON.stringify(data, null, 2);

    fs.writeFile(path, json, (err) => {
        if (err) {
            console.error(err);
            throw err;
        }

        console.log('Saved data to file');
    });
};

// Get company chatbot data from REST API
const getCompanyData = (apiKey) => {
    let options = {
        method: 'GET',
        uri: baseUrl + `companychatbot/1`,
        // uri: baseUrl + `companychatbot/${ auth.companyId }`,
        headers: { 'content-type': 'application/json', authorization: `Api-Key ${ apiKey }` },
        json: true
    };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            console.log(response.body[0]);

            let obj = response.body[0];

            let existingData = JSON.parse(fs.readFileSync('company/companyInfo.json'));

            // Check if the existing data is more recent than the hook notification
            // If so, exit without making any changes
            if (existingData.lastUpdated && existingData.lastUpdated >= obj.updated_at) {
                return;
            }

            const companyData = {
                name: obj.company,
                privacyNotice: obj.privacy_notice_url,
                benefitsLink: obj.benefits_url,
                benefitsMessage: obj.benefits_message,
                nextSteps: obj.next_steps,
                emailContacts: [obj.talent_email],
                lastUpdated: obj.updated_at
            };

            if (obj.company_video_url) {
                companyData['companyVideo'] = obj.company_video_url;
            }

            writeToFile(companyData, 'company/companyInfo.json');
        }
    });
};

// Get company chatbot data from REST API
const getJobMap = (apiKey) => {
    let options = {
        method: 'GET',
        uri: baseUrl + `jobmap/1`,
        // uri: baseUrl + `companychatbot/${ auth.companyId }`,
        headers: { 'content-type': 'application/json', authorization: `Api-Key ${ apiKey }` },
        json: true
    };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            console.log(response.body);

            let objArray = response.body;

            // let existingData;

            // // Async check - not great as responds after the model updates
            // // fs.access('company/jobMap.json', fs.F_OK, (err) => {
            // //     if (err) {
            // //         console.error(err);
            // //         return;
            // //     }
            // //     existingData = JSON.parse(fs.readFileSync('company/jobMap.json'));
            // // });

            // try {
            //     if (fs.existsSync('company/jobMap.json')) {
            //         existingData = JSON.parse(fs.readFileSync('company/jobMap.json'));
            //     }
            // } catch (err) {
            //     console.error(err);
            // };

            // // Check if the existing data is more recent than the hook notification
            // // If so, exit without making any changes
            // if (existingData && existingData.lastUpdated && existingData.lastUpdated >= objArray[0].updated_at) {
            //     return;
            // }

            console.log(objArray);

            let categoryOne = [];
            let specialism = [];

            let i;
            for (i = 0; i < objArray.length; i++) {
                let obj = objArray[i];

                // Create categoryOne array
                if (categoryOne.indexOf(obj.category_one) === -1) {
                    categoryOne.push(obj.category_one);
                }

                // Create array of specialisms linked to categoryOne array
                if (!specialism[categoryOne.indexOf(obj.category_one)]) {
                    let specArray = [obj.specialism];
                    specialism.push(specArray);
                } else if (specialism[categoryOne.indexOf(obj.category_one)].indexOf(obj.specialism) === -1) {
                    specialism[categoryOne.indexOf(obj.category_one)].push(obj.specialism);
                }
            };

            const jobMapData = {
                categoryOne,
                specialism
            };

            console.log(jobMapData);

            writeToFile(jobMapData, 'company/jobMap.json');
        }
    });
};

// Version for receiving fat payload via hook
// Not using as lacks proper security
// const receiveCompanyData = (hook) => {
//     const data = hook.data.fields;

//     let existingData = JSON.parse(fs.readFileSync('company/companyInfo.json'));

//     if (existingData.lastUpdated && existingData.lastUpdated > data.updated_at) {
//         return;
//     }

//     const companyData = {
//         name: data.company,
//         privacyNotice: data.privacy_notice_url,
//         benefitsLink: data.benefits_url,
//         benefitsMessage: data.benefits_message,
//         nextSteps: data.next_steps,
//         emailContacts: [data.talent_email],
//         lastUpdated: data.updated_at
//     };

//     if (data.company_video_url) {
//         companyData['companyVideo'] = data.company_video_url;
//     }

//     writeToFile(companyData, 'company/companyInfo.json');
// };

module.exports = { getCompanyData, getJobMap };
