// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const userIntent = {
    searchJobs: `Yes please`,
    browsing: `No, I'm just browsing`
};

// eslint-disable-next-line promise/param-names
const delay = ms => new Promise(res => setTimeout(res, ms));

// Get random sentence from a list of options
const randomSentence = (sentencesArray) => {
    let index = Math.floor(Math.random() * (sentencesArray.length - 1));

    return sentencesArray[index];
};

// Options for confirming that the user's question was answered
const questionAnswered = [
    `Was that helpful?`,
    `Did that answer your question?`,
    `Did that help?`,
    `Did I cover everything?`
];

module.exports = { userIntent, delay, randomSentence, questionAnswered };
