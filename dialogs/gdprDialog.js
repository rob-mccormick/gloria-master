// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const { delay } = require('../helperFunctions');

const GDPR_DIALOG = 'gdprDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    yes: 'Yeah, of course',
    no: `I'd rather not`
};

class GdprDialog extends CancelAndHelpDialog {
    constructor() {
        super(GDPR_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.gdprNoticeStep.bind(this),
            this.endStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Provides a disclaimer about using the user's data
     * Asks for the user's consent
     */
    async gdprNoticeStep(stepContext) {
        // Create question asking for consent
        const options = [userResponses.yes, userResponses.no];
        const question = MessageFactory.suggestedActions(options, 'Is this ok with you?');

        // Load company data
        const company = JSON.parse(fs.readFileSync('company/companyInfo.json'));

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(`To get back to you I'll need your name and email address.
        \n\n We’ll store this information so we can pick up the conversation later, and to send you follow-up emails.
        \n\n You can see our privacy policy here: ${ company.privacyNotice }`);

        // Ask the user if they consent to providing their details
        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(3000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's response
     * End the dialog and return the result
     */
    async endStep(stepContext) {
        // Set user consent to false as default
        let userConsent = -1;

        // Update consent to true if the user agreed to the GDPR notice
        if (stepContext.result === userResponses.yes) {
            userConsent = 1;
        }

        // End the dialog and return the result
        return await stepContext.endDialog(userConsent);
    }
}

module.exports.GdprDialog = GdprDialog;
module.exports.GDPR_DIALOG = GDPR_DIALOG;
