const fs = require('fs');
const request = require('request');

const app = require('../index');

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

function setOptions(path) {
    // Sets the get options based on the api url path provided
    const options = {
        method: 'GET',
        uri: app.irApi.baseUrl + `${ path }/${ app.irApi.id }`,
        headers: { 'content-type': 'application/json', authorization: `Api-Key ${ app.irApi.key }` },
        json: true
    };
    return options;
}

function processTime() {
    // Returns the current date time in ISO format
    let now = new Date();
    return now.toISOString();
};

// Get company benefits data from REST API
const getBenefits = () => {
    const options = setOptions('benefit');

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            let objArray = response.body;

            // let existingData;
            // console.log(JSON.stringify(objArray));
            // // Fetch the current benefit data - if it exists
            // try {
            //     if (fs.existsSync('company/benefits.json')) {
            //         existingData = JSON.parse(fs.readFileSync('company/benefits.json'));
            //     }
            // } catch (err) {
            //     console.error(err);
            // };

            // Check if the existing data is more recent than the hook notification
            // If so, exit without making any changes
            // const recentUpdate = whenLastUpdated(objArray);
            // console.log(recentUpdate);

            // if (existingData && existingData.lastUpdated >= recentUpdate) {
            //     return;
            // }

            // Save the benefit data
            let benefits = [];

            let i;
            for (i = 0; i < objArray.length; i++) {
                let obj = objArray[i];

                let benefit = {
                    title: obj.title
                };
                if (obj.blurb) {
                    benefit['blurb'] = obj.blurb;
                }
                if (obj.icon_url) {
                    benefit['imageUrl'] = obj.icon_url;
                }
                benefits.push(benefit);
            }

            // Add the most recent update
            let now = processTime();
            const benefitCards = {
                benefits,
                lastUpdated: now
            };

            writeToFile(benefitCards, 'company/benefits.json');
        }
    });
};

// Get company chatbot data from REST API
const getCompanyData = () => {
    const options = setOptions('companychatbot');
    // const options = {
    //     method: 'GET',
    //     uri: app.irApi.baseUrl + `companychatbot/${ app.irApi.id }`,
    //     headers: { 'content-type': 'application/json', authorization: `Api-Key ${ app.irApi.key }` },
    //     json: true
    // };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            console.log(response.body[0]);

            let obj = response.body[0];

            // let existingData = JSON.parse(fs.readFileSync('company/companyInfo.json'));

            // // Check if the existing data is more recent than the hook notification
            // // If so, exit without making any changes
            // if (existingData.lastUpdated && existingData.lastUpdated >= obj.updated_at) {
            //     return;
            // }
            let now = processTime();

            const companyData = {
                name: obj.company,
                privacyNotice: obj.privacy_notice_url,
                benefitsLink: obj.benefits_url,
                benefitsMessage: obj.benefits_message,
                nextSteps: obj.next_steps,
                emailContacts: [obj.talent_email],
                lastUpdated: now
            };

            if (obj.company_video_url) {
                companyData['companyVideo'] = obj.company_video_url;
            }

            writeToFile(companyData, 'company/companyInfo.json');
        }
    });
};

// Get job data from REST API
const getJobs = () => {
    const options = setOptions('job');
    // const options = {
    //     method: 'GET',
    //     uri: app.irApi.baseUrl + `job/${ app.irApi.id }`,
    //     headers: { 'content-type': 'application/json', authorization: `Api-Key ${ app.irApi.key }` },
    //     json: true
    // };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            let objArray = response.body;

            // let existingData;

            // // Fetch the current benefit data - if it exists
            // try {
            //     if (fs.existsSync('company/benefits.json')) {
            //         existingData = JSON.parse(fs.readFileSync('company/benefits.json'));
            //     }
            // } catch (err) {
            //     console.error(err);
            // };

            // // Check if the existing data is more recent than the hook notification
            // // If so, exit without making any changes
            // const recentUpdate = whenLastUpdated(objArray);

            // if (existingData && existingData.lastUpdated >= recentUpdate) {
            //     return;
            // }

            // Save the benefit data
            let jobs = [];

            let i;
            for (i = 0; i < objArray.length; i++) {
                let obj = objArray[i];

                let job = {
                    title: obj.title,
                    location: 'Silicon Valley',
                    specialism: Array(obj.specialism),
                    minExperience: obj.role_type,
                    intro: obj.intro,
                    jdLink: obj.description_url,
                    applyLink: obj.apply_url,
                    video: obj.video_url
                };

                jobs.push(job);
            }

            // Add the most recent update
            let now = processTime();
            jobs['lastUpdated'] = now;
            // console.log(`jobs: ${ JSON.stringify(jobs) }`);

            writeToFile(jobs, 'company/jobs.json');
        }
    });
};

// Get company jobmap data from REST API
const getJobMap = () => {
    const options = setOptions('jobmap');
    // const options = {
    //     method: 'GET',
    //     uri: app.irApi.baseUrl + `jobmap/${ app.irApi.id }`,
    //     headers: { 'content-type': 'application/json', authorization: `Api-Key ${ app.irApi.key }` },
    //     json: true
    // };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            let objArray = response.body;

            // let existingData;

            // // Fetch the current jobMap data - if it exists
            // try {
            //     if (fs.existsSync('company/jobMap.json')) {
            //         existingData = JSON.parse(fs.readFileSync('company/jobMap.json'));
            //     }
            // } catch (err) {
            //     console.error(err);
            // };

            // // Check if the existing data is more recent than the hook notification
            // // If so, exit without making any changes
            // const recentUpdate = whenLastUpdated(objArray);

            // if (existingData && existingData.lastUpdated >= recentUpdate) {
            //     return;
            // }

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

            let now = processTime();
            const jobMapData = {
                categoryOne,
                specialism,
                lastUpdated: now
            };

            writeToFile(jobMapData, 'company/jobMap.json');
        }
    });
};

// Get company location data from REST API
const getLocations = () => {
    const options = setOptions('location');
    // const options = {
    //     method: 'GET',
    //     uri: app.irApi.baseUrl + `location/${ app.irApi.id }`,
    //     headers: { 'content-type': 'application/json', authorization: `Api-Key ${ app.irApi.key }` },
    //     json: true
    // };

    request(options, (error, response, body) => {
        if (error) throw new Error(error);

        console.log(response.statusCode);

        if (!error && response && response.statusCode === 200) {
            let objArray = response.body;

            // let existingData;

            // // Fetch the current benefit data - if it exists
            // try {
            //     if (fs.existsSync('company/locations.json')) {
            //         existingData = JSON.parse(fs.readFileSync('company/locations.json'));
            //     }
            // } catch (err) {
            //     console.error(err);
            // };

            // // Check if the existing data is more recent than the hook notification
            // // If so, exit without making any changes
            // const recentUpdate = whenLastUpdated(objArray);

            // if (existingData && existingData.lastUpdated >= recentUpdate) {
            //     return;
            // }

            // Save the benefit data
            let locations = [];

            let i;
            for (i = 0; i < objArray.length; i++) {
                let obj = objArray[i];

                let location = {
                    streetAddress: obj.street_address,
                    city: obj.city,
                    country: obj.country
                };

                locations.push(location);
            }

            // Add the most recent update
            let now = processTime();
            const locationData = {
                locations,
                lastUpdated: now
            };
            // console.log(`locationData: ${ JSON.stringify(locationData) }`);

            writeToFile(locationData, 'company/locations.json');
        }
    });
};

// Takes an object and returns the most recent update date
// const whenLastUpdated = (objArray) => {
//     let result;
//     let i;
//     for (i = 0; i < objArray.length; i++) {
//         let updated = objArray[i].updated_at;

//         if (!result || updated >= result) {
//             result = updated;
//         }
//     };
//     return result;
// };

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

module.exports = { getBenefits, getCompanyData, getJobs, getJobMap, getLocations };
