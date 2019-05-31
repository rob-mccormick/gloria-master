// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { BookingDialog } = require('./bookingDialog');
const { BrowsingDialog, BROWSING_DIALOG } = require('./browsingDialog');
const { JobSearchDialog, JOB_SEARCH_DIALOG } = require('./jobSearchDialog');
const { LuisHelper } = require('./luisHelper');

const { UserProfile } = require('../userProfile');
const { userIntent } = require('../helperFunctions');

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const BOOKING_DIALOG = 'bookingDialog';

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
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.createConversationAndUserDataStep.bind(this),
                this.firstInteractionStep.bind(this),
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

    async createConversationAndUserDataStep(stepContext) {
        // If there is no userProfile, create one
        const userProfile = await this.userProfile.get(stepContext.context, new UserProfile());

        // If there is no conversationDate, create it
        const conversationData = await this.conversationData.get(stepContext.context, {
            seenJobDisclaimer: false,
            jobSearch: false,
            hasQuestion: false,
            finishedConversation: false
        });

        return await stepContext.next();
    }

    async firstInteractionStep(stepContext) {
        // Check that data is being saved correctly
        const userProfile = await this.userProfile.get(stepContext.context);
        this.logger.log(`UserProfile from step2 mainDialog ${ JSON.stringify(userProfile) }`);
        const conversationData = await this.conversationData.get(stepContext.context);
        this.logger.log(`conversationData from step2 mainDialog ${ JSON.stringify(conversationData) }`);

        const text = stepContext.context.activity.text;

        if (text === userIntent.searchJobs) {
            await stepContext.context.sendActivity('This will help you find a job');
            return await stepContext.beginDialog(JOB_SEARCH_DIALOG, userProfile);
        } else if (text === userIntent.browsing) {
            return await stepContext.beginDialog(BROWSING_DIALOG);
        }

        return await stepContext.next();
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
