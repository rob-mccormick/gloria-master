const request = require('request');

const app = require('../index');

// Post data to the API using the provided url
const postData = (data, id, url) => {
    // Add the chatbot user id to the data
    data['chatbot_user_id'] = id;

    // Set the time and add it to the data
    let now = new Date();
    data['date_time'] = now.toISOString();

    // Set up options for request
    let options = {
        method: 'POST',
        uri: app.irApi.baseUrl + url,
        headers: { 'content-type': 'application/json', authorization: `Api-Key ${ app.irApi.key }` },
        body: JSON.stringify(data)
    };

    // Post to API
    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);
    });
};

// Post job data to the API
const postJobData = (user, id, data = {}) => {
    let userData = {
        specialism_search: `${ user.specialism }`,
        location_search: `${ user.location }`,
        role_type_search: `${ user.experience }`,
        found_job: `${ user.foundJob }`,
        saw_job_video: `${ user.sawJobVideo }`
    };

    let jobData = { ...userData, ...data };

    postData(jobData, id, `cbjobsdata/${ app.irApi.id }/post`);
};

// Post question data to the API
const postQnData = (user, id, data = {}) => {
    let userData = {
        has_question: true,
        search_question: user[user.length - 1]
    };

    let qnData = { ...userData, ...data };

    postData(qnData, id, `cbqnsdata/${ app.irApi.id }/post`);
};

// Post browsing data to the API
const postBrowsingData = (id, data = {}) => {
    let userData = {
        is_browsing: true
    };

    let browsingData = { ...userData, ...data };

    postData(browsingData, id, `cbbrowsingdata/${ app.irApi.id }/post`);
};

module.exports = { postJobData, postQnData, postBrowsingData };
