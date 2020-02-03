// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');

const { DialogBot } = require('./dialogBot');
const { MessageFactory } = require('botbuilder');

// const { company } = require('../company/companyDetails');
const { userIntent } = require('../helperFunctions');

// Async
// let company;
// fs.readFile('company/companyInfo.json', (err, data) => {
//     if (err) throw err;
//     company = JSON.parse(data);
// });

// Sync
let companyData = fs.readFileSync('company/companyInfo.json');
let company = JSON.parse(companyData);

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog, logger) {
        super(conversationState, userState, dialog, logger);

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const choices = [userIntent.searchJobs, userIntent.browsing];
                    const question = MessageFactory.suggestedActions(choices, `Would you like some help finding a job at ${ company.name }?`);

                    await context.sendActivity(`Hey there! 👋`);
                    await context.sendActivity(question);
                }
            }

            // Calling next() to ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
