// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');

// For both my bot and the start up bot
const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

// Import other component dialogs
const { BrowsingDialog, BROWSING_DIALOG } = require('./browsingDialog');
const { JobSearchDialog, JOB_SEARCH_DIALOG } = require('./jobSearchDialog');
const { PipelineDialog, PIPELINE_DIALOG } = require('./pipelineDialog');
const { QuestionDialog, QUESTION_DIALOG } = require('./questionDialog');

const { UserProfile } = require('../userProfile');
const { delay, userIntent, randomSentence } = require('../helperFunctions');

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const userResponses = {
    yesQuestion: 'Actually, there is',
    noQuestion: 'No, all good thanks',
    jobSearch: `I'd like to see the jobs`,
    askQuestion: 'I have a question'
};

class MainDialog extends ComponentDialog {
    constructor(conversationState, userState, logger) {
        super('MainDialog');

        // Create the state property accessors for the conversation data and user profile.
        this.conversationData = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        this.conversationState = conversationState;
        this.userState = userState;

        if (!logger) {
            logger = console;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }

        this.logger = logger;

        // Define the main dialog and its related components.
        this.addDialog(new BrowsingDialog())
            .addDialog(new JobSearchDialog())
            .addDialog(new PipelineDialog())
            .addDialog(new QuestionDialog())
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.firstInteractionStep.bind(this),
                this.redirectToJobSearchStep.bind(this),
                this.redirectToPipelineStep.bind(this),
                this.checkIfHasQuestionStep.bind(this),
                this.redirectToQuestionStep.bind(this),
                this.endDialogStep.bind(this),
                this.restartConversationStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * The first step sets up the conversationData if there is none
     * Then either sends the user to the browsing dialog or sets jobSearch to true
     * @param {*} stepContext
     */
    async firstInteractionStep(stepContext) {
        // If restarting the dialog, capture the conversationData
        if (stepContext.result) {
            const updatedConversation = stepContext.result.conversationData;
            const updatedUser = stepContext.result.userProfile;

            // Set the new data
            await this.conversationData.set(stepContext.context, updatedConversation);
            await this.userProfile.set(stepContext.context, updatedUser);
        }

        // Create the conversationData object
        const conversationData = await this.conversationData.get(stepContext.context, {
            seenJobDisclaimer: false,
            jobSearch: false,
            jobSearchComplete: false,
            unfilteredJob: false,
            addToPipeline: false,
            hasQuestion: false,
            questionHelpful: false,
            userConfirmedEmail: false,
            finishedConversation: false
        });

        // Capture the user's response
        const text = stepContext.context.activity.text;

        if (text === userIntent.searchJobs) {
            // Set the conversationDate to true for jobSearch
            conversationData.jobSearch = true;
        } else if (text === userIntent.browsing) {
            return await stepContext.beginDialog(BROWSING_DIALOG, conversationData);
        }

        return await stepContext.next();
    }

    /**
     * Save the result from the browsing dialog (if completed)
     * Access or create the userProfile
     * Then either send the user to the job search dialog or continue
     * @param {*} stepContext
     */
    async redirectToJobSearchStep(stepContext) {
        // If went to browsing route, capture the conversationData from the previous step
        if (stepContext.result) {
            const updatedConversation = stepContext.result;

            // Set the new data as the conversationData
            await this.conversationData.set(stepContext.context, updatedConversation);
        }

        // Access conversation and user data
        const conversationData = await this.conversationData.get(stepContext.context);
        const userProfile = await this.userProfile.get(stepContext.context, new UserProfile());
        // this.logger.log(`userProfile from the jobSearch step: ${ JSON.stringify(userProfile) }`);
        // this.logger.log(`conversationData from the jobSearch step: ${ JSON.stringify(conversationData) }`);

        // Redirect user to job search if jobSearch is true
        if (conversationData.jobSearch) {
            return await stepContext.beginDialog(JOB_SEARCH_DIALOG, { conversationData, userProfile });
        }

        // Otherwise continue to the next step
        return await stepContext.next();
    }

    /**
     * Save the results from the job search dialog (if completed)
     * Access the userProfile
     * Then either send the user to the pipline dialog or continue
     * @param {*} stepContext
     */
    async redirectToPipelineStep(stepContext) {
        // If completed job search, capture the conversation and user data
        if (stepContext.result) {
            const updatedConversation = stepContext.result.conversationData;
            const updatedUser = stepContext.result.userProfile;

            // Set the new data
            await this.conversationData.set(stepContext.context, updatedConversation);
            await this.userProfile.set(stepContext.context, updatedUser);
        }

        // Access the user and conversation data
        const conversationData = await this.conversationData.get(stepContext.context);
        const userProfile = await this.userProfile.get(stepContext.context);

        // this.logger.log(`userProfile from the pipeline step: ${ JSON.stringify(userProfile) }`);

        // Redirect user to pipeline if addToPipeline is true
        if (conversationData.addToPipeline) {
            return await stepContext.beginDialog(PIPELINE_DIALOG, { conversationData, userProfile });
        }

        // Otherwise continue to the next step
        return await stepContext.next();
    }

    /**
     * Save the result from the pipeline step (if completed)
     * Access the userProfile
     * If they completed the job search - ask if they have a question
     * @param {*} stepContext
     */
    async checkIfHasQuestionStep(stepContext) {
        // If was added to the pipleine, capture the conversation and user data
        if (stepContext.result) {
            const updatedConversation = stepContext.result.conversationData;
            const updatedUser = stepContext.result.userProfile;
            // this.logger.log(`userProfile after pipeline step: ${ JSON.stringify(updatedUser) }`);

            // Set the new data
            await this.conversationData.set(stepContext.context, updatedConversation);
            await this.userProfile.set(stepContext.context, updatedUser);
        }

        // Access the conversation data
        const conversationData = await this.conversationData.get(stepContext.context);

        // this.logger.log(`conversationData from the checkQuestion step: ${ JSON.stringify(conversationData) }`);

        // If they completed the job search check if they have a question
        if (!conversationData.hasQuestion && conversationData.jobSearchComplete) {
            let options = [userResponses.yesQuestion, userResponses.noQuestion];
            let question = MessageFactory.suggestedActions(options, `Is there something else I can help you with?\n\nLike preparing your application? Or what happens after you apply?`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(question);
            return Dialog.EndOfTurn;
        }

        // Otherwise proceed to the next step
        return await stepContext.next();
    }

    /**
     * Update if user has a question
     * Then either send the user to the question dialog or continue
     * @param {*} stepContext
     */
    async redirectToQuestionStep(stepContext) {
        const conversationData = await this.conversationData.get(stepContext.context);

        // If user said they have a question, update hasQuestion
        if (stepContext.result === userResponses.yesQuestion) {
            conversationData.hasQuestion = true;
        } else if (stepContext.result === userResponses.noQuestion) {
            // Set finishedConversation to true
            conversationData.finishedConversation = true;
        }

        // Access the user profile
        const userProfile = await this.userProfile.get(stepContext.context);

        // this.logger.log(`conversationData from redirectToQuestionStep: ${ JSON.stringify(conversationData) }`);
        // this.logger.log(`userProfile from redirectToQuestionStep: ${ JSON.stringify(userProfile) }`);

        // Redirect user to ask a question if hasQuestion is true and hasn't finished the conversation
        if (conversationData.hasQuestion) {
            return await stepContext.beginDialog(QUESTION_DIALOG, { conversationData, userProfile });
        }

        return await stepContext.next();
    }

    async endDialogStep(stepContext) {
        // If was asked a question, capture the user data
        if (stepContext.result) {
            const updatedConversation = stepContext.result.conversationData;
            const updatedUser = stepContext.result.userProfile;

            // Set the new data
            await this.conversationData.set(stepContext.context, updatedConversation);
            await this.userProfile.set(stepContext.context, updatedUser);
        }

        let conversationData = await this.conversationData.get(stepContext.context);

        // console.log(`userProfile from the endDialog step: ${ JSON.stringify(updatedUser) }`);
        // this.logger.log(`conversationData from the endDialog step: ${ JSON.stringify(conversationData) }`);

        // If conversation finished, say good-bye
        if (conversationData.finishedConversation) {
            const responses = [
                `Thanks for dropping by - it's been good chatting with you 🙂`,
                `Thanks for dropping by - it was great talking with you!`
            ];

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(randomSentence(responses));

            // Give the user a chance to restart the conversation
            let options = [userResponses.jobSearch, userResponses.askQuestion];
            let question = MessageFactory.suggestedActions(options, `If there's something else you need, let me know.`);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity(question);
            return Dialog.EndOfTurn;
        }

        // Otherwise, RESET the conversation:

        // Reset all of the conversationData
        conversationData = {
            seenJobDisclaimer: false,
            jobSearch: false,
            jobSearchComplete: false,
            unfilteredJob: false,
            addToPipeline: false,
            hasQuestion: false,
            userConfirmedEmail: false,
            finishedConversation: false
        };

        // Set the new data
        await this.conversationData.set(stepContext.context, conversationData);

        // Load company data
        const company = JSON.parse(fs.readFileSync('company/companyInfo.json'));

        // Ask the welcome message and end dialog
        const choices = [userIntent.searchJobs, userIntent.browsing];
        const question = MessageFactory.suggestedActions(choices, `Can I help you find a job at ${ company.name }?`);

        await stepContext.context.sendActivity(question);
        return await stepContext.endDialog();
    }

    async restartConversationStep(stepContext) {
        // Get the conversationData to update
        const conversationData = await this.conversationData.get(stepContext.context);

        // Update finishedConversation
        conversationData.finishedConversation = false;

        // Update other conversationData properties based on user's choice
        if (stepContext.result === userResponses.jobSearch) {
            conversationData.jobSearch = true;
            conversationData.jobSearchComplete = false;
            conversationData.hasQuestion = false;
            conversationData.unfilteredJob = false;
        } else if (stepContext.result === userResponses.askQuestion) {
            conversationData.jobSearch = false;
            conversationData.hasQuestion = true;
        }

        // Get the user data to send back to the start of the dialog
        const userProfile = await this.userProfile.get(stepContext.context);
        // this.logger.log(`userProfile just before restarting mainDialog: ${ JSON.stringify(userProfile) }`);
        // this.logger.log(`conversationData just before restarting mainDialog: ${ JSON.stringify(conversationData) }`);

        // Restart the mainDialog with the updated conversationData
        return await stepContext.beginDialog(MAIN_WATERFALL_DIALOG, { conversationData, userProfile });
    }
}

module.exports.MainDialog = MainDialog;
