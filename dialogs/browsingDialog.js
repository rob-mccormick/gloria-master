// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { ComponentDialog, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay } = require('../helperFunctions');

const BROWSING_DIALOG = 'browsingDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userOptions = {
    whyOnSite: [
        `I'd heard you were hiring and wanted to learn more`,
        `I'm looking at places I might like to work`,
        `I wanted to ask a question`
    ],
    heardHiring: [
        'Some help would be great',
        `I'm fine on my own thanks`
    ],
    lookingAround: [
        'Yes',
        'Not at the moment'
    ]
};

class BrowsingDialog extends ComponentDialog {
    constructor() {
        super(BROWSING_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.whyOnSiteStep.bind(this),
            this.getBackOnTrackStep.bind(this),
            this.redirectStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Asks the user why they are on the career site
     */
    async whyOnSiteStep(stepContext) {
        const conversationData = stepContext.options;
        stepContext.values.conversationData = conversationData;

        const question = MessageFactory.suggestedActions(userOptions.whyOnSite, `What brought you to our career site today?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity('No worries.');

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Tries to get the user back on track to the jobSearch dialog
     * But if user has a question, redirect to askQuestion dialog
     */
    async getBackOnTrackStep(stepContext) {
        switch (stepContext.result) {
        case userOptions.whyOnSite[0]:
            const hiringQuestion = MessageFactory.suggestedActions(userOptions.heardHiring, 'Are you happy looking around, or would you like me to find jobs just for you?');

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity('You heard right - we have some great roles available!');

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(2000);
            await stepContext.context.sendActivity(hiringQuestion);
            return Dialog.EndOfTurn;
        case userOptions.whyOnSite[1]:
            const lookingQuestion = MessageFactory.suggestedActions(userOptions.lookingAround, 'Are you looking in a particular business area?');

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(`You've come to the right place!`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(`Here you can learn about what we offer, check out our offices and hear from our team.`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(2500);
            await stepContext.context.sendActivity(lookingQuestion);
            return Dialog.EndOfTurn;
        default:
            // Set askQuestion in conversationData to true
            const conversationData = stepContext.values.conversationData;
            conversationData.hasQuestion = true;

            // Return to mainDialog and pass the conversationData object
            return await stepContext.endDialog(conversationData);
        }
    }

    /**
     * Based on the user's response, either:
     * - Put back on the jobSearch dialog
     * - End the dialog as doesn't want to engage
     */
    async redirectStep(stepContext) {
        // create the conversationData object
        const conversationData = stepContext.values.conversationData;

        if (stepContext.result === userOptions.heardHiring[0] || stepContext.result === userOptions.lookingAround[0]) {
            // Set jobSearch in conversationData to true
            conversationData.jobSearch = true;

            // Pass the conversationData object back to the mainDialog
            return await stepContext.endDialog(conversationData);
        } else {
            // Set finishedConversation in conversationData to true
            conversationData.finishedConversation = true;

            await stepContext.context.sendActivity(`No problem.`);
            await stepContext.context.sendActivity('This will redirect user to final dialog');

            // Pass the conversationData object back to the mainDialog
            return await stepContext.endDialog(conversationData);
        }
    }
}

module.exports.BrowsingDialog = BrowsingDialog;
module.exports.BROWSING_DIALOG = BROWSING_DIALOG;
