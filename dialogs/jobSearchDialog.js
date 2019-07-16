// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, CardFactory, AttachmentLayoutTypes, ActivityTypes } = require('botbuilder');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { company, jobs } = require('../companyDetails');
const { delay, randomSentence } = require('../helperFunctions');

// Import other dialogs
const { JobMoreInfoDialog, JOB_MORE_INFO_DIALOG } = require('./jobMoreInfoDialog');
const { CompanyBenefitsDialog, COMPANY_BENEFITS_DIALOG } = require('./companyBenefitsDialog');

const JOB_SEARCH_DIALOG = 'jobSearchDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    back: 'Go back',
    allLocations: `I'm open to all`,
    yearsExperience: ['0', '1', '2', '3', '4', '5', '6', '7+'],
    allExperience: 'Show me all',
    moreInfoYes: `That'd be great`,
    moreInfoNo: 'No thanks',
    foundOneJob: 'Yeah, it looks good',
    foundManyJobs: 'I did',
    foundNoJob: 'Unfortunately not',
    clearFiltersYes: `If you wouldn't mind`,
    clearFiltersNo: `No, it's fine`,
    seeBenefitsYes: `What are your benefits?`,
    seeVideo: `Let's see the video`,
    seeBenefitsNo: 'Not right now',
    pipelineYes: `That'd be great`,
    pipelineNo: `It's ok, I'll just check back`
};

class JobSearchDialog extends CancelAndHelpDialog {
    constructor() {
        super(JOB_SEARCH_DIALOG);

        this.addDialog(new JobMoreInfoDialog())
            .addDialog(new CompanyBenefitsDialog())
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
                this.redirectToBenefitsStep.bind(this),
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

        // If clearing filters, go to next step
        if (stepContext.values.conversationData.unfilteredJob) {
            return stepContext.next();
        }

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
        // If clearing filters, go to next step
        if (stepContext.values.conversationData.unfilteredJob) {
            return stepContext.next();
        }

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
        // If clearing filters, go to next step
        if (stepContext.values.conversationData.unfilteredJob) {
            return stepContext.next();
        }

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

        const question = MessageFactory.suggestedActions(options, `Which location is best for you?`);

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
        // If clearing filters, go to next step
        if (stepContext.values.conversationData.unfilteredJob) {
            return stepContext.next();
        }

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
        let availableJobs;

        if (stepContext.values.conversationData.unfilteredJob) {
            availableJobs = this.findRelevantJobs(jobs, stepContext.values.conversationData.unfilteredJob);
        } else {
            availableJobs = this.findRelevantJobs(jobs, stepContext.values.userProfile);
        }

        // Send the user a message on the job search results
        let response;

        if (availableJobs.length > 0) {
            // Save the jobs to the user profile
            stepContext.values.userProfile.jobs = availableJobs;

            // Generate the message response
            const jobPlural = (availableJobs.length > 1) ? 'jobs' : 'job';
            response = `Perfect! We have ${ availableJobs.length } ${ jobPlural } for you.`;
        } else if (availableJobs.length === 0 && stepContext.values.conversationData.unfilteredJob) {
            response = `Sorry, nothing 🤨`;
        } else {
            stepContext.values.userProfile.jobs = [];
            if (stepContext.values.userProfile.location === 'all' && stepContext.values.userProfile.experience !== 'all') {
                response = `Unfortunately, we don't have any ${ stepContext.values.userProfile.specialism } jobs at the moment.`;
            } else if (stepContext.values.userProfile.location === 'all') {
                response = `Unfortunately, we don't have any ${ stepContext.values.userProfile.specialism } jobs for you at the moment.`;
            } else {
                response = `Unfortunately, we don't have any ${ stepContext.values.userProfile.specialism } jobs in ${ stepContext.values.userProfile.location } at the moment.`;
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
     * If no jobs found and location and/or experience given
     * - ask the user if they want to clear these filters and do another search
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
                    question = `So would you like to hear about the role from the hiring manager?`;
                } else {
                    question = `So would you like to hear about the roles directly from the hiring managers?`;
                }

                const options = [userResponses.moreInfoYes, userResponses.moreInfoNo];
                const message = MessageFactory.suggestedActions(options, question);

                await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
                await delay(3000);
                await stepContext.context.sendActivity(`I know job descriptions can be a little dry...`);

                await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
                await delay(1500);
                await stepContext.context.sendActivity(message);
                return Dialog.EndOfTurn;
            }
        }

        // If no jobs found and filters used, check if want to clear and research
        const location = stepContext.values.userProfile.location;
        const experience = stepContext.values.userProfile.experience;
        const jobsLength = stepContext.values.userProfile.jobs.length;

        if (stepContext.values.conversationData.unfilteredJob) {
            return stepContext.next();
        } else if (jobsLength === 0 && (location !== 'all' || experience !== 'all')) {
            let question;
            const options = [userResponses.clearFiltersYes, userResponses.clearFiltersNo];

            // Change the question depending on the persons selections
            if (location !== 'all' && experience !== 'all') {
                question = `Would you like me to check for ${ stepContext.values.userProfile.specialism } jobs in all locations and for all levels of experience?`;
            } else if (experience !== 'all') {
                question = `Would you like me to check for all levels of experience?`;
            } else {
                question = `Would you like me to check for ${ stepContext.values.userProfile.specialism } jobs in all locations?`;
            }

            const message = MessageFactory.suggestedActions(options, question);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(message);
            return Dialog.EndOfTurn;
        }

        // Otherwise, pass to the next step
        return stepContext.next();
    }

    /**
     * Redirect user if they want to see more info
     *
     */
    async redirectForMoreInfoStep(stepContext) {
        // Check if the user wants to see more info
        if (stepContext.result === userResponses.moreInfoYes) {
            // Save jobs to new object
            const moreInfoJobs = stepContext.values.moreInfoJobs;
            const firstTime = true;

            return await stepContext.beginDialog(JOB_MORE_INFO_DIALOG, { moreInfoJobs, firstTime });
        } else if (stepContext.result === userResponses.moreInfoNo) {
            // Send message to acknowledge didn't want to see more info
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(`No worries - you can always check back if you get curious 😉`);

        // Now check for no jobs if they want to clear the filters
        } else if (stepContext.result === userResponses.clearFiltersYes) {
            // Get userProfile and conversationData
            const conversationData = stepContext.values.conversationData;
            const userProfile = stepContext.values.userProfile;

            // Set up conversationData
            conversationData.unfilteredJob = {
                location: 'all',
                experience: 'all',
                specialism: userProfile.specialism
            };

            // Send the user a message so they know the job search will start over
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(`Alright - I'm taking another look...`);
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(2500);

            // Restart the dialog
            return await stepContext.replaceDialog(JOB_SEARCH_DIALOG, { conversationData, userProfile });
        } else if (stepContext.result === userResponses.clearFiltersNo) {
            // Save that user didn't want to do another search
            stepContext.values.noResearch = true;

            // Send a message confirming end
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(`No worries`);
        }

        // If not redirected, pass to the next step
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
     * If there were no jobs, or the user didn't like the jobs found:
     * Ask if they want to join the pipeline
     */
    async askToAddToPipelineStep(stepContext) {
        // If user didn't like the jobs found send them a sorry message
        if (stepContext.result === userResponses.foundNoJob) {
            const responses = [
                'Sorry to hear that.',
                `That's a shame.`];

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(randomSentence(responses));
        }

        // If the user found a job, ask if they'd like to see the benefits
        if (stepContext.result === userResponses.foundOneJob || stepContext.result === userResponses.foundManyJobs) {
            // Save that user found a job
            stepContext.values.foundJob = true;

            const response = randomSentence([
                `Fantastic 😀`,
                `Awesome!`]);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(response);

            const options = [userResponses.seeBenefitsYes, userResponses.seeVideo, userResponses.seeBenefitsNo];
            const message = MessageFactory.suggestedActions(options, `Can I share our benefits with you? ️️🏖️\n\nOr a video about our mission and what it's like to work at ${ company.name }?`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(message);
            return Dialog.EndOfTurn;
        }

        // Otherwise ask user if they want to join the pipeline
        const options = [userResponses.pipelineYes, userResponses.pipelineNo];
        let question;

        // Vary the question depending on whether the user had filters
        if (stepContext.values.noResearch) {
            question = `We have new jobs opening all the time.\n\nWould you like me to let you know when new ones come up?`;
        } else {
            question = `But we have new jobs opening all the time.\n\nWould you like me to let you know when new ones come up?`;
        }

        const message = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(message);
        return Dialog.EndOfTurn;
    }

    /**
     * Check user's response:
     * - Redirect to benefits dialog
     * - Add to pipeline
     */

    async redirectToBenefitsStep(stepContext) {
        let benefits;
        let video;
        const firstTime = true;

        // Check if the user wants to see the benefits
        if (stepContext.result === userResponses.seeBenefitsYes) {
            // Set the values for the next step
            benefits = true;
            video = false;

            // Redirect to benefits dialog
            return await stepContext.beginDialog(COMPANY_BENEFITS_DIALOG, { benefits, video, firstTime });
        } else if (stepContext.result === userResponses.seeVideo) {
            // Set the values for the next step
            benefits = false;
            video = true;

            // Redirect to benefits dialog
            return await stepContext.beginDialog(COMPANY_BENEFITS_DIALOG, { benefits, video, firstTime });
        } else if (stepContext.result === userResponses.seeBenefitsNo) {
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(`No problem.`);
        }

        // Check if the user wanted to be added to the pipeline
        if (stepContext.result === userResponses.pipelineYes) {
            // Update the conversationData
            stepContext.values.conversationData.addToPipeline = true;

            // Update the user profile
            stepContext.values.userProfile.pipeline.push({
                specialism: stepContext.values.userProfile.specialism,
                location: stepContext.values.userProfile.location
            });
        } else if (stepContext.result === userResponses.pipelineNo) {
            await stepContext.context.sendActivity(`No problem.`);
        }

        return await stepContext.next();
    }

    /**
     * Update userProfile to be added to the pipeline (if relevant)
     * In the conversationState, return the jobSearch to false
     * Return the conversationData and userProfile to the mainDialog
     */
    async endStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;

        // If the user found a job they like, tell them the next steps
        if (stepContext.values.foundJob) {
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(2500);
            await stepContext.context.sendActivity(`As for the next steps - we'll ${ company.nextSteps }`);
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
}

module.exports.JobSearchDialog = JobSearchDialog;
module.exports.JOB_SEARCH_DIALOG = JOB_SEARCH_DIALOG;
