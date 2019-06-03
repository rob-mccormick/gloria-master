// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const userIntent = {
    searchJobs: `That'd be great`,
    browsing: `I'm just browsing`
};

// eslint-disable-next-line promise/param-names
const delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = { userIntent, delay };
