// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay } = require('../helperFunctions');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const JOB_MORE_INFO_DIALOG = 'jobMoreInfoDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    redoYes: 'Yes please',
    redoNo: 'Not right now'
};

class JobMoreInfoDialog extends CancelAndHelpDialog {
    constructor() {
        super(JOB_MORE_INFO_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.infoOptionsStep.bind(this),
            this.showInfoStep.bind(this),
            this.endStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Show the user what insider info is available
     * Ask if they want to see it
     */
    async infoOptionsStep(stepContext) {
        // Save the info passed in
        const moreInfoJobs = stepContext.options.moreInfoJobs;
        stepContext.values.jobs = moreInfoJobs;

        const firstTime = stepContext.options.firstTime;

        if (moreInfoJobs.length === 1) {
            stepContext.context.sendActivity(`You can hear more about ${ moreInfoJobs[0].title } directly from the hiring manager.`);
            stepContext.context.sendActivity(`Check it out`);

            return stepContext.next();
        }

        if (firstTime) {
            stepContext.context.sendActivity(`You can hear about the roles directly from the hiring managers.`);
        }

        const options = this.buildResponseOptions(stepContext.values.jobs);
        const question = this.buildQuestion(stepContext.values.jobs);

        const message = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(message);
        return Dialog.EndOfTurn;
    }

    /**
     * Get the info to share and display it
     */
    async showInfoStep(stepContext) {
        let info;

        if (stepContext.result) {
            const index = parseInt(stepContext.result, 10) - 1;

            // Save the index so can be used for when there are 2 jobs
            stepContext.values.index = index;

            info = stepContext.values.jobs[index].video;
        } else {
            info = stepContext.values.jobs[0].video;
        }

        // Display the info
        await stepContext.context.sendActivity(this.createVideo(info));

        // If more than one job available, check if they want to see another
        if (stepContext.values.jobs.length > 1) {
            let question;

            if (stepContext.values.jobs.length === 2) {
                question = `Would you like to hear about the other job?`;
            } else {
                question = `Would you like to hear about another job?`;
            }

            const options = [responses.redoYes, responses.redoNo];
            const message = MessageFactory.suggestedActions(options, question);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(2000);
            await stepContext.context.sendActivity(message);
            return Dialog.EndOfTurn;
        }

        // Otherwise, there is only 1 option so end
        return stepContext.endDialog();
    }

    /**
     * If they want to see another one, restart
     * Otherwise end
     */
    async endStep(stepContext) {
        if (stepContext.result === responses.redoYes && stepContext.values.jobs.length > 2) {
            const moreInfoJobs = stepContext.values.jobs;
            const firstTime = false;

            return await stepContext.replaceDialog(JOB_MORE_INFO_DIALOG, { moreInfoJobs, firstTime });
        } else if (stepContext.result === responses.redoYes && stepContext.values.jobs.length === 2) {
            let info;

            // Select the info the user hasn't already seen
            if (stepContext.values.index === 0) {
                info = stepContext.values.jobs[1].video;
            } else {
                info = stepContext.values.jobs[0].video;
            }

            // Display the info
            await stepContext.context.sendActivity(this.createVideo(info));
        }

        return stepContext.endDialog();
    }

    // ======================================
    // Helper functions
    // ======================================

    buildResponseOptions(jobList) {
        let options = [];

        for (var i = 1; i <= jobList.length; i++) {
            options.push(String(i));
        }

        return options;
    }

    buildQuestion(jobList) {
        let question = `Which job would you like to hear about?\n`;

        for (var i = 1; i <= jobList.length; i++) {
            question += `\n${ i } - ${ jobList[i - 1].title }`;
        }

        return question;
    }

    createVideo(videoUrl) {
        return MessageFactory.contentUrl(
            videoUrl,
            'video/mp4'
        );
    }
}

module.exports = { JobMoreInfoDialog, JOB_MORE_INFO_DIALOG };
