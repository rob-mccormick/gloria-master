const fs = require('fs');
const request = require('request');

const auth = require('../index');

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

const receiveCompanyData = (hook) => {
    const data = hook.data.fields;

    let existingData = JSON.parse(fs.readFileSync('company/companyInfo.json'));

    if (existingData.lastUpdated && existingData.lastUpdated > data.updated_at) {
        return;
    }

    const companyData = {
        name: data.company,
        privacyNotice: data.privacy_notice_url,
        benefitsLink: data.benefits_url,
        benefitsMessage: data.benefits_message,
        nextSteps: data.next_steps,
        emailContacts: [data.talent_email],
        lastUpdated: data.updated_at
    };

    if (data.company_video_url) {
        companyData['companyVideo'] = data.company_video_url;
    }

    writeToFile(companyData, 'company/companyInfo.json');
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

            const companyData = {
                name: obj.company,
                privacyNotice: obj.privacy_notice_url,
                nextSteps: obj.next_steps,
                emailContacts: [obj.talent_email]
            };

            if (obj.company_video_url) {
                companyData['companyVideo'] = obj.company_video_url;
            }

            writeToFile(companyData, 'company/skinnytest.json');
        }
    });
};

// // Load company data
// let companyData = fs.readFileSync('company/companyData.json');
// let company = JSON.parse(companyData);
// const companyId = company.id;

// // Post data to the API using the provided url
// const postData = (data, id, url) => {
//     // Add the chatbot user id to the data
//     data['chatbot_user_id'] = id;
//     // console.log(`conversation Id from within authorization: ${ JSON.stringify(conversationData.id) }`);

//     // Set the time and add it to the data
//     let now = new Date();
//     data['date_time'] = now.toISOString();

//     // Set up options for request
//     let options = {
//         method: 'POST',
//         uri: baseUrl + url,
//         headers: { 'content-type': 'application/json', authorization: `Api-Key ${ auth.apiKey }` },
//         body: JSON.stringify(data)
//     };

//     // Post to API
//     request(options, (error, response, body) => {
//         if (error) throw new Error(error);
//         // console.log(body);
//         console.log(response.statusCode);
//     });
// };

// // Post job data to the API
// const postJobData = (user, id, data = {}) => {
//     let userData = {
//         specialism_search: `${ user.specialism }`,
//         location_search: `${ user.location }`,
//         role_type_search: `${ user.experience }`,
//         found_job: `${ user.foundJob }`,
//         saw_job_video: `${ user.sawJobVideo }`
//     };

//     let jobData = { ...userData, ...data };

//     postData(jobData, id, `cbjobsdata/${ companyId }/post`);
// };

// // Post question data to the API
// const postQnData = (user, id, data = {}) => {
//     let userData = {
//         has_question: true,
//         search_question: user[user.length - 1]
//     };

//     let qnData = { ...userData, ...data };

//     postData(qnData, id, `cbqnsdata/${ companyId }/post`);
// };

// // Post browsing data to the API
// const postBrowsingData = (id, data = {}) => {
//     let userData = {
//         is_browsing: true
//     };

//     let browsingData = { ...userData, ...data };

//     postData(browsingData, id, `cbbrowsingdata/${ companyId }/post`);
// };

module.exports = { getCompanyData, receiveCompanyData };
