// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { ComponentDialog, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { company } = require('../companyDetails');
const { delay } = require('../helperFunctions');

// Import other dialogs
const { GdprDialog, GDPR_DIALOG } = require('./gdprDialog');

const PIPELINE_DIALOG = 'pipelineDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    foundOneJob: 'I was',
    foundManyJobs: 'I did',
    foundNoJob: 'Unfortunately not',
    pipelineYes: `That'd be great`,
    pipelineNo: `It's ok, I'll just check back`
};

class PipelineDialog extends ComponentDialog {
    constructor() {
        super(PIPELINE_DIALOG);

        this.addDialog(new GdprDialog())
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

        // Present categoryOne options and ask user to select
        return stepContext.next();
    }

    /**
     * Update userProfile to be added to the pipeline (if relevant)
     * In the conversationState, return the jobSearch to false
     * Return the conversationData and userProfile to the mainDialog
     */
    async endStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;

        // Check if the user wanted to be added to the pipeline
        if (stepContext.result === userResponses.pipelineYes) {
            userProfile.addToPipeline = true;
        }

        // Reset the jobSearch to false in conversationData
        conversationData.jobSearch = false;

        console.log(`conversationData: ${ JSON.stringify(conversationData) }`);
        console.log(`userProfile: ${ JSON.stringify(userProfile) }`);

        // End the dialog and return the conversationData and userProfile
        return await stepContext.endDialog({ conversationData, userProfile });
    }
}

module.exports.PipelineDialog = PipelineDialog;
module.exports.PIPELINE_DIALOG = PIPELINE_DIALOG;
