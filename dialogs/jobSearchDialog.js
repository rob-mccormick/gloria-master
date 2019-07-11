// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory, AttachmentLayoutTypes, ActivityTypes } = require('botbuilder');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { company, jobs } = require('../companyDetails');
const { delay, randomSentence } = require('../helperFunctions');

// Import job more info dialog
const { JobMoreInfoDialog, JOB_MORE_INFO_DIALOG } = require('./jobMoreInfoDialog');

const JOB_SEARCH_DIALOG = 'jobSearchDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    back: 'Go back',
    allLocations: 'Show me all locations',
    yearsExperience: ['0', '1', '2', '3', '4', '5', '6', '7+'],
    allExperience: 'All jobs please',
    moreInfoYes: 'Go on',
    moreInfoNo: 'No thanks',
    foundOneJob: 'Yeah, it looks good',
    foundManyJobs: 'I did',
    foundNoJob: 'Unfortunately not',
    pipelineYes: `That'd be great`,
    pipelineNo: `It's ok, I'll just check back`
};

class JobSearchDialog extends CancelAndHelpDialog {
    constructor() {
        super(JOB_SEARCH_DIALOG);

        this.addDialog(new JobMoreInfoDialog())
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.jobDisclaimerStep.bind(this),
                this.selectCategoryOneStep.bind(this),
                this.selectSpecialismStep.bind(this),
                this.selectLocationStep.bind(this),
                this.experienceStep.bind(this),
                this.presentAvailableJobsStep.bind(this),
                this.seeMoreInfoStep.bind(this),
                this.redirectForMoreInfoStep.bind(this),
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
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(`Excellent. Just so you know, our chat won't be linked to any job application.`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(`If I had lips they'd be sealed!`);
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
     * Ask the user to select from the avaiable specialisms
     */
    async selectSpecialismStep(stepContext) {
        // Get the correct options to present to the user
        const index = company.categoryOne.indexOf(stepContext.result);
        const options = company.specialism[index];

        // Add the option to return to select categoryOne
        if (options[(options.length - 1)] !== userResponses.back) {
            options.push(userResponses.back);
        }

        // Present specialism options and ask user to select
        const question = MessageFactory.suggestedActions(options, `And what area would you be working in?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's specialsim selection
     * Ask the user to select which location they're interested in
     */
    async selectLocationStep(stepContext) {
        // Send user back if they selected 'Go back'
        if (stepContext.result === userResponses.back) {
            const conversationData = stepContext.values.conversationData;
            const userProfile = stepContext.values.userProfile;

            return await stepContext.replaceDialog(JOB_SEARCH_DIALOG, { conversationData, userProfile });
        }
        // Save user's specialism selection
        stepContext.values.userProfile.specialism = stepContext.result;

        // Present location options and ask user to select
        const options = company.locations;

        // Add option to select all locations
        if (options[(options.length - 1)] !== userResponses.allLocations) {
            options.push(userResponses.allLocations);
        }

        const question = MessageFactory.suggestedActions(options, `In which location?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's location selection
     * Ask the user to share how much experience they have to narrow down the job search
     */
    async experienceStep(stepContext) {
        // Save user's location selection
        if (stepContext.result === userResponses.allLocations) {
            stepContext.values.userProfile.location = 'all';
        } else {
            stepContext.values.userProfile.location = stepContext.result;
        }

        // Present years experience for the user to select
        const options = userResponses.yearsExperience;

        // Add option to select all experience levels
        if (options[(options.length - 1)] !== userResponses.allExperience) {
            options.push(userResponses.allExperience);
        }

        const question = MessageFactory.suggestedActions(options, `And how many years experience do you have?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Save the user's experience selection
     * If there are available jobs:
     * - Save them to the userProfile
     * - Present them to the user
     */
    async presentAvailableJobsStep(stepContext) {
        // Save user's experience selection
        if (stepContext.result === userResponses.allExperience) {
            stepContext.values.userProfile.experience = 'all';
        } else {
            stepContext.values.userProfile.experience = parseInt(stepContext.result, 10);
        }

        // Set the jobSearchComplete to true
        stepContext.values.conversationData.jobSearchComplete = true;

        // Find available jobs
        const availableJobs = this.findRelevantJobs(jobs, stepContext.values.userProfile);

        // Send the user a message on the job search results
        let response;

        if (availableJobs.length > 0) {
            // Save the jobs to the user profile
            stepContext.values.userProfile.jobs = availableJobs;

            // Generate the message response
            const jobPlural = (availableJobs.length > 1) ? 'jobs' : 'job';
            response = `Perfect! We have ${ availableJobs.length } ${ jobPlural } for you.`;
        } else {
            stepContext.values.userProfile.jobs = [];
            if (stepContext.values.userProfile.location === 'all' && stepContext.values.userProfile.experience !== 'all') {
                response = `Sorry, we don't have any ${ stepContext.values.userProfile.specialism } jobs for you at the moment.`;
            } else if (stepContext.values.userProfile.location === 'all') {
                response = `Sorry, we don't have any ${ stepContext.values.userProfile.specialism } jobs at the moment.`;
            } else {
                response = `Sorry, we don't have any ${ stepContext.values.userProfile.specialism } jobs in ${ stepContext.values.userProfile.location } for you at the moment.`;
            }
        }

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(response);

        // If there were jobs, present them to the user
        if (availableJobs.length > 0) {
            let jobsToDisplay = [];

            // Create thumbnail cards to display the results
            availableJobs.forEach(el => jobsToDisplay.push(this.createThumbnailCard(el)));

            // availableJobs.forEach(el => {
            //     if (el.video) {
            //         jobsToDisplay.push(this.createThumbnailCardTwoButtons(el));
            //     } else {
            //         jobsToDisplay.push(this.createThumbnailCard(el));
            //     }
            // });

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
     * If jobs were presented, check:
     * - do any of them have extra info (video)
     * - If so, ask if the user wants to see it
     * - otherwise, continue to next step
     */
    async seeMoreInfoStep(stepContext) {
        if (stepContext.values.userProfile.jobs.length > 0) {
            let moreInfoJobs = [];
            // Check if there is more info - if so add to new list
            stepContext.values.userProfile.jobs.forEach(el => {
                if (el.video) {
                    moreInfoJobs.push(el);
                }
            });

            // If there is more info to display - save it and ask if would like to see it
            if (moreInfoJobs.length > 0) {
                // Save moreInfoJobs
                stepContext.values.moreInfoJobs = moreInfoJobs;

                let question;

                if (moreInfoJobs.length === 1) {
                    question = `If you're interested, I can give you an insider tip.`;
                } else {
                    question = `If you're interested, I can give you insider tips...`;
                }

                const options = [userResponses.moreInfoYes, userResponses.moreInfoNo];
                const message = MessageFactory.suggestedActions(options, question);

                await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
                await delay(3000);
                await stepContext.context.sendActivity(message);
                return Dialog.EndOfTurn;
            }
        }

        // Otherwise, pass to the next step
        return stepContext.next();
    }

    /**
     * Redirect user if they want to see more info
     *
     */
    async redirectForMoreInfoStep(stepContext) {
        if (stepContext.result === userResponses.moreInfoYes) {
            // Save jobs to new object
            const moreInfoJobs = stepContext.values.moreInfoJobs;
            const firstTime = true;

            return await stepContext.beginDialog(JOB_MORE_INFO_DIALOG, { moreInfoJobs, firstTime });
        }

        // Otherwise, pass to the next step
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
                const sentences = [
                    `Were you interested in the job?`,
                    `Does the job interest you?`];
                question = randomSentence(sentences);
            } else {
                options = [userResponses.foundManyJobs, userResponses.foundNoJob];
                const sentences = [
                    `Did you find a job you like?`];
                question = randomSentence(sentences);
            }

            let message = MessageFactory.suggestedActions(options, question);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            if (stepContext.result) {
                await delay(1000);
            } else {
                await delay(3000);
            }
            await stepContext.context.sendActivity(message);
            return Dialog.EndOfTurn;
        }

        // If no jobs were displayed, pass to the next step
        return stepContext.next();
    }

    /**
     * Check if the user found a job they like
     * If there are no available jobs, go to the next step
     */
    // async checkIfFoundJobStep(stepContext) {
    //     if (stepContext.values.userProfile.jobs.length > 0) {
    //         let options;
    //         let question;
    //         if (stepContext.values.userProfile.jobs.length === 1) {
    //             options = [userResponses.foundOneJob, userResponses.foundNoJob];
    //             const sentences = [
    //                 `Were you interested in the job?`,
    //                 `Is this what you're after?`,
    //                 `Does it interest you?`,
    //                 `Does it look good for you?`];
    //             question = randomSentence(sentences);
    //         } else {
    //             options = [userResponses.foundManyJobs, userResponses.foundNoJob];
    //             const sentences = [
    //                 `Did you find a job you're interested in?`,
    //                 `Did you see one to apply for (or maybe more than one 😉)?`,
    //                 `Did you find one that'd be a good fit?`];
    //             question = randomSentence(sentences);
    //         }

    //         let message = MessageFactory.suggestedActions(options, question);

    //         await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
    //         await delay(3000);
    //         await stepContext.context.sendActivity(message);
    //         return Dialog.EndOfTurn;
    //     }

    //     // If no jobs were displayed, pass to the next step
    //     return stepContext.next();
    // }

    /**
     * If there were no jobs, or the user didn't like the jobs found:
     * Ask if they want to join the pipeline
     */
    async askToAddToPipelineStep(stepContext) {
        // If user didn't like the jobs found send them a sorry message
        if (stepContext.result === userResponses.foundNoJob) {
            const responses = [
                'Sorry to hear that.',
                `That's a shame.`,
                `That's no good.`];

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(randomSentence(responses));
        }

        // If the user found a job, let them know the next steps
        if (stepContext.result === userResponses.foundOneJob || stepContext.result === userResponses.foundManyJobs) {
            const responses = [
                `That's great 😀`,
                `Fantastic`,
                `Awesome!`];

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(randomSentence(responses));

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(`Once you apply we ${ company.nextSteps }.`);

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
            // Update the conversationData
            conversationData.addToPipeline = true;

            // Update the user profile
            userProfile.pipeline.push({
                specialism: userProfile.specialism,
                location: userProfile.location
            });
        } else if (stepContext.result === userResponses.pipelineNo) {
            await stepContext.context.sendActivity(`No worries`);
        }

        // Reset the jobSearch to false in conversationData
        conversationData.jobSearch = false;

        // End the dialog and return the conversationData and userProfile
        return await stepContext.endDialog({ conversationData, userProfile });
    }

    // ======================================
    // Helper functions
    // ======================================

    findRelevantJobs(jobList, user) {
        let relevantJobs = [];
        const spec = user.specialism;
        const loc = user.location;
        const exp = user.experience;

        // Iterate over the items in the list and find those with correct values
        // for (var i = 0; i < jobList.length; i++) {
        //     // User entered all variables
        //     if (jobList[i].cat1 === cat1 && jobList[i].cat2 === cat2 && jobList[i].location === loc && jobList[i].minExperience === exp) {
        //         relevantJobs.push(jobList[i]);
        //     // User provided location, experience is 'all'
        //     } else if (jobList[i].cat1 === cat1 && jobList[i].cat2 === cat2 && jobList[i].location === loc) {
        //         relevantJobs.push(jobList[i]);
        //     // Location is 'all', but user provided experience
        //     } else if (jobList[i].cat1 === cat1 && jobList[i].cat2 === cat2 && jobList[i].minExperience === exp) {
        //         relevantJobs.push(jobList[i]);
        //     // Location and experience are 'all'
        //     } else if (jobList[i].cat1 === cat1 && jobList[i].cat2 === cat2) {
        //         relevantJobs.push(jobList[i]);
        //     }
        // }
        for (var i = 0; i < jobList.length; i++) {
            if (loc === 'all' && exp === 'all') {
                if (jobList[i].specialism === spec) {
                    relevantJobs.push(jobList[i]);
                }
            } else if (loc === 'all' && exp !== 'all') {
                if (jobList[i].specialism === spec && jobList[i].minExperience <= exp) {
                    relevantJobs.push(jobList[i]);
                }
            } else if (loc !== 'all' && exp === 'all') {
                if (jobList[i].specialism === spec && jobList[i].location === loc) {
                    relevantJobs.push(jobList[i]);
                }
            } else if (loc !== 'all' && exp !== 'all') {
                if (jobList[i].specialism === spec && jobList[i].location === loc && jobList[i].minExperience <= exp) {
                    relevantJobs.push(jobList[i]);
                }
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
                title: 'See job description',
                value: `${ jobObj.link }`
            }],
            {
                subtitle: `${ jobObj.location }`,
                text: `${ jobObj.intro }`
            }
        );
    }

    createThumbnailCardTwoButtons(jobObj) {
        return CardFactory.thumbnailCard(
            `${ jobObj.title }`,
            [{ url: '' }],
            [{
                type: 'openUrl',
                title: 'See job description',
                value: `${ jobObj.link }`
            }, {
                type: 'postBack',
                title: 'Learn more',
                // value: `Tell me more about ${ jobObj.title }`
                value: `testing`
            }],
            {
                subtitle: `${ jobObj.location }`,
                text: `${ jobObj.intro }`
            }
        );
    }

    createVideoYouTube() {
        return MessageFactory.contentUrl(
            'https://www.youtube.com/watch?v=Vm4tx1O9GAc',
            'video/mp4'
        );
    }
}

module.exports.JobSearchDialog = JobSearchDialog;
module.exports.JOB_SEARCH_DIALOG = JOB_SEARCH_DIALOG;
