// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');

const { DialogBot } = require('./dialogBot');
const { MessageFactory } = require('botbuilder');

const { userIntent } = require('../helperFunctions');

class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog, logger) {
        super(conversationState, userState, dialog, logger);

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    // Get company data
                    const company = JSON.parse(fs.readFileSync('company/companyInfo.json'));

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
