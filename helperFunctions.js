// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const userIntent = {
    searchJobs: `That'd be great`,
    browsing: `I'm just browsing`
};

// eslint-disable-next-line promise/param-names
const delay = ms => new Promise(res => setTimeout(res, ms));

// Validate name
const validateName = (input) => {
    const name = input && input.trim();
    return name !== undefined
        ? { success: true, name: name }
        : { success: false, message: 'Please enter a name that contains at least one character.' };
};

const validateEmail = (input) => {
    const name = input && input.trim();
    return name !== undefined
        ? { success: true, name: name }
        : { success: false, message: 'Please enter a name that contains at least one character.' };
};

module.exports = { userIntent, delay, validateName, validateEmail };
