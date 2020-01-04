const request = require('request');

const auth = require('../index');

const baseUrl = 'http://127.0.0.1:5000/api/';
const companyId = '1';

// Post data to the API using the provided url
const postData = (data, url) => {
    // Add the chatbot user id to the data
    data['chatbot_user_id'] = 'abc123xquxil';

    // Set the time and add it to the data
    let now = new Date();
    data['date_time'] = now.toISOString();

    // Set up options for request
    let options = {
        method: 'POST',
        uri: baseUrl + url,
        headers: { 'content-type': 'application/json', authorization: `Api-Key ${ auth.apiKey }` },
        body: JSON.stringify(data)
    };

    // Post to API
    request(options, (error, response, body) => {
        if (error) throw new Error(error);
        console.log(body);
        console.log(response.statusCode);
    });
};

// Post job data to the API
const postJobData = (user, data = {}) => {
    let userData = {
        specialism_search: `${ user.specialism }`,
        location_search: `${ user.location }`,
        role_type_search: `${ user.experience }`,
        found_job: `${ user.foundJob }`,
        saw_job_video: `${ user.sawJobVideo }`
    };

    let jobData = { ...userData, ...data };

    postData(jobData, `cbjobsdata/${ companyId }/post`);
};

// Post question data to the API
const postQnData = (user, data) => {
    let userData = {
        has_question: true,
        search_question: user[user.length - 1]
    };

    let qnData = { ...userData, ...data };

    postData(qnData, `cbqnsdata/${ companyId }/post`);
};

module.exports = { postJobData, postQnData };
