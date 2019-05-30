// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { ComponentDialog, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { company } = require('../companyDetails');
const { delay } = require('../helperFunctions');

const JOB_SEARCH_DIALOG = 'jobSearchDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

class JobSearchDialog extends ComponentDialog {
    constructor(userProfile, userState) {
        super(JOB_SEARCH_DIALOG);

        this.userProfile = userProfile;
        this.userState = userState;

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.testStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Asks the user why they are on the career site
     */
    async testStep(stepContext) {
        // let user = await this.userProfile.get(stepContext.context);
        // console.log(`User profile from jobSearchDialog ${ JSON.stringify(user) }`);
        // console.log(`User profile from jobSearchDialog ${ JSON.stringify(this.userState.userProfile) }`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity('Made it to the jobSearch dialog!!');

        await stepContext.context.sendActivity('Now to check if it goes back to the main dialog correctly...');
        return await stepContext.endDialog();
    }
}

module.exports.JobSearchDialog = JobSearchDialog;
module.exports.JOB_SEARCH_DIALOG = JOB_SEARCH_DIALOG;
