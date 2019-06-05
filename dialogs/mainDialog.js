// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

// For both my bot and the start up bot
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

// From the start up bot
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { BookingDialog } = require('./bookingDialog');
const { LuisHelper } = require('./luisHelper');
const { userIntent } = require('../helperFunctions');

const BOOKING_DIALOG = 'bookingDialog';

// MY DATA
// Import other component dialogs
const { BrowsingDialog, BROWSING_DIALOG } = require('./browsingDialog');
const { JobSearchDialog, JOB_SEARCH_DIALOG } = require('./jobSearchDialog');
const { PipelineDialog, PIPELINE_DIALOG } = require('./pipelineDialog');
const { QuestionDialog, QUESTION_DIALOG } = require('./questionDialog');

const { UserProfile } = require('../userProfile');

const { delay } = require('../helperFunctions');

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

const userResponses = {
    yesQuestion: 'Actually, I do',
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
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(new BookingDialog(BOOKING_DIALOG))
            .addDialog(new BrowsingDialog())
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
                this.restartConversationStep.bind(this),
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
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
            addToPipeline: false,
            hasQuestion: false,
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
        console.log(`userProfile from the jobSearch step: ${ JSON.stringify(userProfile) }`);
        console.log(`conversationData from the jobSearch step: ${ JSON.stringify(conversationData) }`);

        // Redirect user to job search if jobSearch is true
        if (conversationData.jobSearch) {
            return await stepContext.beginDialog(JOB_SEARCH_DIALOG, { conversationData, userProfile });
        }

        // Otherwise continue to the next step
        await stepContext.context.sendActivity('placeholder - not going on job search');
        return await stepContext.next();
    }

    /**
     * Save the result from the browsing dialog (if completed)
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

        console.log(`userProfile from the pipeline step: ${ JSON.stringify(userProfile) }`);

        // Redirect user to pipeline if addToPipeline is true
        if (conversationData.addToPipeline) {
            return await stepContext.beginDialog(PIPELINE_DIALOG, { conversationData, userProfile });
        }

        // Otherwise continue to the next step
        await stepContext.context.sendActivity('placeholder - not going to pipeline');
        return await stepContext.next();
    }

    /**
     * Save the result from the pipeline step (if completed)
     * Access the userProfile
     * Then either send the user to the job search dialog or continue
     * @param {*} stepContext
     */
    async checkIfHasQuestionStep(stepContext) {
        // If was added to the pipleine, capture the conversation and user data
        if (stepContext.result) {
            const updatedConversation = stepContext.result.conversationData;
            const updatedUser = stepContext.result.userProfile;
            console.log(`userProfile after pipeline step: ${ JSON.stringify(updatedUser) }`);

            // Set the new data
            await this.conversationData.set(stepContext.context, updatedConversation);
            await this.userProfile.set(stepContext.context, updatedUser);
        }

        // Access the conversation data
        const conversationData = await this.conversationData.get(stepContext.context);

        console.log(`conversationData from the checkQuestion step: ${ JSON.stringify(conversationData) }`);

        // Check if the user previously said they have a question
        if (conversationData.hasQuestion || conversationData.finishedConversation) {
            return await stepContext.next();
        }

        // Otherwise check if they have a question
        let options = [userResponses.noQuestion, userResponses.yesQuestion];
        let question = MessageFactory.suggestedActions(options, `Did you have any other questions?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
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

            // Set the new data
            // await this.conversationData.set(stepContext.context, updatedConversationData);
        }

        // Access the user profile
        const userProfile = await this.userProfile.get(stepContext.context);
        // const conversationData = await this.conversationData.get(stepContext.context);
        console.log(`conversationData from redirectToQuestionStep: ${ JSON.stringify(conversationData) }`);
        console.log(`userProfile from redirectToQuestionStep: ${ JSON.stringify(userProfile) }`);
        // Redirect user to ask a question if hasQuestion is true and hasn't finished the conversation
        if (conversationData.hasQuestion) {
            return await stepContext.beginDialog(QUESTION_DIALOG, { conversationData, userProfile });
        }

        // Otherwise continue to the next step
        await stepContext.context.sendActivity('placeholder - no question');
        return await stepContext.next();
    }

    async endDialogStep(stepContext) {
        // If was provided a question, capture the user data
        if (stepContext.result) {
            const updatedConversation = stepContext.result.conversationData;
            const updatedUser = stepContext.result.userProfile;

            // Set the new data
            await this.conversationData.set(stepContext.context, updatedConversation);
            await this.userProfile.set(stepContext.context, updatedUser);
        }

        // Reset the hasQuestion to false
        const conversationData = await this.conversationData.get(stepContext.context);
        conversationData.hasQuestion = false;

        // console.log(`userProfile from the endDialog step: ${ JSON.stringify(updatedUser) }`);
        console.log(`conversationData from the endDialog step: ${ JSON.stringify(conversationData) }`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(`It's been good chatting with you 🙂`);

        // Give the user a chance to restart the conversation
        let options = [userResponses.jobSearch, userResponses.askQuestion];
        let question = MessageFactory.suggestedActions(options, `Let me know if you need anything else.`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    async restartConversationStep(stepContext) {
        // Get the conversationData to update
        const conversationData = await this.conversationData.get(stepContext.context);

        // Update finishedConversation
        conversationData.finishedConversation = false;

        // Update other conversationData properties based on user's choice
        if (stepContext.result === userResponses.jobSearch) {
            conversationData.jobSearch = true;
            conversationData.hasQuestion = false;
        } else if (stepContext.result === userResponses.askQuestion) {
            conversationData.jobSearch = false;
            conversationData.hasQuestion = true;
        }

        // Get the user data to send back to the start of the dialog
        const userProfile = await this.userProfile.get(stepContext.context);
        console.log(`userProfile just before restarting mainDialog: ${ JSON.stringify(userProfile) }`);
        console.log(`conversationData just before restarting mainDialog: ${ JSON.stringify(conversationData) }`);

        // Restart the mainDialog with the updated conversationData
        return await stepContext.beginDialog(MAIN_WATERFALL_DIALOG, { conversationData, userProfile });
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects a booking request, like "book me a flight from Paris to Berlin on march 22"
     * Note that the sample LUIS model will only recognize Paris, Berlin, New York and London as airport cities.
     */
    async introStep(stepContext) {
        if (!process.env.LuisAppId || !process.env.LuisAPIKey || !process.env.LuisAPIHostName) {
            await stepContext.context.sendActivity('NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.');
            return await stepContext.next();
        }
        let user = await this.userProfile.get(stepContext.context);
        console.log(`userState: ${ JSON.stringify(user) }`);

        return await stepContext.prompt('TextPrompt', { prompt: 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"' });
    }

    /**
     * Second step in the waterall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(stepContext) {
        let bookingDetails = {};

        if (process.env.LuisAppId && process.env.LuisAPIKey && process.env.LuisAPIHostName) {
            // Call LUIS and gather any potential booking details.
            // This will attempt to extract the origin, destination and travel date from the user's message
            // and will then pass those values into the booking dialog
            bookingDetails = await LuisHelper.executeLuisQuery(this.logger, stepContext.context);

            this.logger.log('LUIS extracted these booking details:', bookingDetails);
        }

        // In this sample we only have a single intent we are concerned with. However, typically a scenario
        // will have multiple different intents each corresponding to starting a different child dialog.

        // Run the BookingDialog giving it whatever details we have from the LUIS call, it will fill out the remainder.
        return await stepContext.beginDialog('bookingDialog', bookingDetails);
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // Now we have all the booking details.

            // This is where calls to the booking AOU service or database would go.

            // If the call to the booking service was successful tell the user.
            const timeProperty = new TimexProperty(result.travelDate);
            const travelDateMsg = timeProperty.toNaturalLanguage(new Date(Date.now()));
            const msg = `I have you booked to ${ result.destination } from ${ result.origin } on ${ travelDateMsg }.`;
            await stepContext.context.sendActivity(msg);
        } else {
            await stepContext.context.sendActivity('Thank you.');
        }
        return await stepContext.endDialog();
    }
}

module.exports.MainDialog = MainDialog;
