// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { ComponentDialog, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay } = require('../helperFunctions');

// Import other dialogs
const { GdprDialog, GDPR_DIALOG } = require('./gdprDialog');
const { NameAndEmailDialog, NAME_AND_EMAIL_DIALOG } = require('./nameAndEmailDialog');

const PIPELINE_DIALOG = 'pipelineDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    emailCorrect: 'Yes please',
    emailWrong: `Actually I'd rather use a different email`
};

class PipelineDialog extends ComponentDialog {
    constructor() {
        super(PIPELINE_DIALOG);

        this.addDialog(new GdprDialog())
            .addDialog(new NameAndEmailDialog())
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.checkGdprStatusStep.bind(this),
                this.checkNameAndEmailStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Saves the conversation abd user data passed from the mainDialog
     * Redirect the user to the GDPR dialog if they have not consented previously
     */
    async checkGdprStatusStep(stepContext) {
        // Save the userProfile passed from mainDialog
        const userProfile = stepContext.options;
        stepContext.values.userProfile = userProfile;

        // Redirect to GDPR dialog if has not given consent
        if (!userProfile.gdprAccepted) {
            return await stepContext.beginDialog(GDPR_DIALOG);
        }

        // If user has consented to the GDPR notice, go to next step
        return stepContext.next();
    }

    /**
     * If the user went to the GDPR dialog - save the result
     * If GDPR consent is not given, end the dialog
     * Otherwise, check if already have the user's name and email
     * - if no, send to new dialog
     * - if yes, confirm email
     */
    async checkNameAndEmailStep(stepContext) {
        const userProfile = stepContext.values.userProfile;

        // If just asked about GDPR, save the answer
        if (stepContext.result) {
            userProfile.gdprAccepted = true;
        } else if (!stepContext.result) {
            userProfile.gdprAccepted = false;

            // As did not accept, end dialog
            return await stepContext.endDialog(userProfile);
        }

        await stepContext.context.sendActivity('Excellent.');

        // If we don't have the user's name and email, send to new dialog
        if (!userProfile.name || !userProfile.email) {
            return await stepContext.beginDialog(NAME_AND_EMAIL_DIALOG);
        }

        // If we have their details, check they're correct
        const options = [userResponses.emailCorrect, userResponses.emailWrong];
        const question = MessageFactory.suggestedActions(options, `Ok ${ userProfile.name }, just to make sure, I should send new jobs to ${ userProfile.email }?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * If went to nameAndEmailDialog - save the results
     * Redirect the user if they want to use a different email
     * Provide the user with a confirmation message
     * Return the userProfile to the mainDialog
     */
    async endStep(stepContext) {
        const userProfile = stepContext.values.userProfile;

        // Handle case where user's email is wrong
        if (stepContext.result === userResponses.emailWrong) {
            // Set email to empty string
            userProfile.email = '';

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity('Alright, let me grab your details again.');

            // Replace with this dialog
            return await stepContext.beginDialog(PIPELINE_DIALOG, userProfile);
        }

        // If correct, confirm with user the job's they'll be contacted for
        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
        await stepContext.context.sendActivity(`Perfect, we'll let you know when any ${ userProfile.categoryTwo } jobs in ${ userProfile.location } come up.`);

        return await stepContext.endDialog(userProfile);
    }
}

module.exports.PipelineDialog = PipelineDialog;
module.exports.PIPELINE_DIALOG = PIPELINE_DIALOG;
