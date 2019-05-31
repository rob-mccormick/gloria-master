// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { ComponentDialog, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory, AttachmentLayoutTypes, ActivityTypes } = require('botbuilder');

const { company } = require('../companyDetails');
const { delay } = require('../helperFunctions');

const JOB_SEARCH_DIALOG = 'jobSearchDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    foundOneJob: 'I was',
    foundManyJobs: 'I did',
    foundNoJob: 'Unfortunately not',
    pipelineYes: `That'd be great`,
    pipelineNo: `It's ok, I'll just check back`
};

class JobSearchDialog extends ComponentDialog {
    constructor() {
        super(JOB_SEARCH_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.jobDisclaimerStep.bind(this),
            this.selectCategoryOneStep.bind(this),
            this.selectCategoryTwoStep.bind(this),
            this.selectLocationStep.bind(this),
            this.presentAvailableJobsStep.bind(this),
            this.checkIfFoundJobStep.bind(this),
            this.askToAddToPipelineStep.bind(this),
            this.endStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Saves the conversation abd user data passed from the mainDialog
     * Shows the disclaimer if the user hasn't seen it this conversation
     */
    async jobDisclaimerStep(stepContext) {
        // Save the conversationData passed from mainDialog
        const conversationData = stepContext.options.conversationData;
        stepContext.values.conversationData = conversationData;

        // Save the userProfile passed from mainDialog
        const userProfile = stepContext.options.userProfile;
        stepContext.values.userProfile = userProfile;

        if (!stepContext.values.conversationData.seenJobDisclaimer) {
            const disclaimer = MessageFactory.suggestedActions(['Good to know'], `If I had lips they'd be sealed!`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(`Excellent. Just so you know, our chat won't be linked to any job application.`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(disclaimer);
            return Dialog.EndOfTurn;
        }

        // If user has seen the disclaimer this conversation, go to next step
        return stepContext.next();
    }

    /**
     * Sets seenJobDisclaimer to true
     * Asks the user to select from the available categoryOne options
     */
    async selectCategoryOneStep(stepContext) {
        // Set seenJobDisclaimer to true
        stepContext.values.conversationData.seenJobDisclaimer = true;

        // Present categoryOne options and ask user to select
        const options = company.categoryOne;
        const question = MessageFactory.suggestedActions(options, `So, what are you interested in?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's categoryOne selection
     * Ask the user to select from the avaiable category two options
     */
    async selectCategoryTwoStep(stepContext) {
        // Save user's categoryOne selection
        stepContext.values.userProfile.categoryOne = stepContext.result;

        // Get the correct options to present to the user
        const index = company.categoryOne.indexOf(stepContext.result);
        const options = company.categoryTwo[index];

        // Present categoryTwo options and ask user to select
        const question = MessageFactory.suggestedActions(options, `Which area would you be working in?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's categoryTwo selection
     * Ask the user to select which location they're interested in
     */
    async selectLocationStep(stepContext) {
        // Save user's categoryTwo selection
        stepContext.values.userProfile.categoryTwo = stepContext.result;

        // Present categoryTwo options and ask user to select
        const options = company.locations;
        const question = MessageFactory.suggestedActions(options, `And which location?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's location selection
     * If there are available jobs:
     * - Save them to the userProfile
     * - Present them to the user
     */
    async presentAvailableJobsStep(stepContext) {
        // Save user's categoryTwo selection
        stepContext.values.userProfile.location = stepContext.result;
        console.log(JSON.stringify(stepContext.values.userProfile));

        // Find available jobs
        const availableJobs = this.findRelevantJobs(company.jobs, stepContext.values.userProfile);

        // Send the user a message on the job search results
        let response;

        if (availableJobs.length > 0) {
            // Save the jobs to the user profile
            stepContext.values.userProfile.jobs = availableJobs;

            // Generate the message response
            const jobPlural = (availableJobs.length > 1) ? 'jobs' : 'job';
            response = `Perfect! We have ${ availableJobs.length } ${ jobPlural } available.`;
        } else {
            stepContext.values.userProfile.jobs = [];
            response = `Sorry, we don't have any ${ stepContext.values.userProfile.categoryTwo } jobs in ${ stepContext.values.userProfile.location } at the moment.`;
        }

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(response);

        // If there were jobs, present them to the user
        if (availableJobs.length > 0) {
            let jobsToDisplay = [];

            // Create thumbnail cards to display the results
            availableJobs.forEach(el => jobsToDisplay.push(this.createThumbnailCard(el)));

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity({
                attachments: jobsToDisplay,
                attachmentLayout: AttachmentLayoutTypes.Carousel
            });
        }

        // Not expecting a response from the user - move to the next step
        return stepContext.next();
    }

    /**
     * Check if the user found a job they like
     * If there are no available jobs, go to the next step
     */
    async checkIfFoundJobStep(stepContext) {
        if (stepContext.values.userProfile.jobs.length > 0) {
            let options;
            let question;
            if (stepContext.values.userProfile.jobs.length === 1) {
                options = [userResponses.foundOneJob, userResponses.foundNoJob];
                question = `Were you interested in the job?`;
            } else {
                options = [userResponses.foundManyJobs, userResponses.foundNoJob];
                question = `Did you find a job you're interested in?`;
            }

            let message = MessageFactory.suggestedActions(options, question);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(3000);
            await stepContext.context.sendActivity(message);
            return Dialog.EndOfTurn;
        }

        // If no jobs were displayed, pass to the next step
        return stepContext.next();
    }

    /**
     * If there were no jobs, or the user didn't like the jobs found:
     * Ask if they want to join the pipeline
     */
    async askToAddToPipelineStep(stepContext) {
        // If user didn't like the jobs found send them a sorry message
        if (stepContext.result === userResponses.foundNoJob) {
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity('Sorry to hear that.');
        }

        // If the user found a job move them to the next step
        if (stepContext.result === userResponses.foundOneJob || stepContext.result === userResponses.foundManyJobs) {
            return await stepContext.next();
        }

        // Otherwise ask user if they want to join the pipeline
        let options = [userResponses.pipelineYes, userResponses.pipelineNo];
        let question = MessageFactory.suggestedActions(options, `Would you like me to let you know when we have a new opening?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
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

    // ======================================
    // Helper functions
    // ======================================

    findRelevantJobs(jobList, user) {
        let relevantJobs = [];

        // Iterate over the items in the list and find those with correct cat1 & cat2
        for (var i = 0; i < jobList.length; i++) {
            if (jobList[i].cat1 === user.categoryOne && jobList[i].cat2 === user.categoryTwo && jobList[i].location === user.location) {
                relevantJobs.push(jobList[i]);
            }
        }
        return relevantJobs;
    }

    createThumbnailCard(jobObj) {
        return CardFactory.thumbnailCard(
            `${ jobObj.title }`,
            [{ url: '' }],
            [{
                type: 'openUrl',
                title: 'Learn more',
                value: `${ jobObj.link }`
            }],
            {
                subtitle: `${ jobObj.location }`,
                text: `${ jobObj.intro }`
            }
        );
    }
}

module.exports.JobSearchDialog = JobSearchDialog;
module.exports.JOB_SEARCH_DIALOG = JOB_SEARCH_DIALOG;
