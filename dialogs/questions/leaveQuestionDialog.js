// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog, TextPrompt } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { CancelAndHelpDialog } = require('../cancelAndHelpDialog');
const { delay, randomSentence } = require('../../helperFunctions');
const { sendQuestionEmail } = require('../../emails/notification');

// Import other dialogs
const { GdprDialog, GDPR_DIALOG } = require('../gdprDialog');
const { NameAndEmailDialog, NAME_AND_EMAIL_DIALOG } = require('../nameAndEmailDialog');

const LEAVE_QUESTION_DIALOG = 'leaveQuestionDialog';
const QUESTION_PROMPT = 'questionPrompt';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    emailCorrect: `That's the one`,
    emailWrong: `Actually I'd rather use a different email`
};

class LeaveQuestionDialog extends CancelAndHelpDialog {
    constructor() {
        super(LEAVE_QUESTION_DIALOG);

        this.addDialog(new TextPrompt(QUESTION_PROMPT, this.questionValidator))
            .addDialog(new GdprDialog())
            .addDialog(new NameAndEmailDialog())
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.checkGdprStatusStep.bind(this),
                this.checkNameAndEmailStep.bind(this),
                this.askQuestionStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Saves the conversation and user data passed from the mainDialog
     * Redirect the user to the GDPR dialog if they have not consented previously
     */
    async checkGdprStatusStep(stepContext) {
        // Save the conversationData and userProfile passed from mainDialog
        const conversationData = stepContext.options.conversationData;
        stepContext.values.conversationData = conversationData;

        const userProfile = stepContext.options.userProfile;
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
        if (stepContext.result === 1) {
            // userProfile.gdprAccepted = true;
            stepContext.values.userProfile.gdprAccepted = true;
        } else if (stepContext.result === -1) {
            userProfile.gdprAccepted = false;

            // As did not accept, end dialog
            return await stepContext.endDialog(userProfile);
        }

        await stepContext.context.sendActivity('Great, I can have someone get back to you.');

        // If we don't have the user's name and email, send to new dialog
        if (!userProfile.name || !userProfile.email) {
            return await stepContext.beginDialog(NAME_AND_EMAIL_DIALOG);
        }

        // If we have their details, check if we've confirmed them this conversation
        if (stepContext.values.conversationData.userConfirmedEmail) {
            return stepContext.next();
        }

        // Otherwise, check if they're details are correct
        const options = [userResponses.emailCorrect, userResponses.emailWrong];
        const question = MessageFactory.suggestedActions(options, `Just to make sure, we can reach you at ${ userProfile.email }?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * If went to nameAndEmailDialog - save the results
     * Redirect the user if they want to use a different email
     * Ask the user to leave their question
     */
    async askQuestionStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;

        // Handle case where user's email is wrong
        if (stepContext.result === userResponses.emailWrong) {
            // Set email to empty string
            userProfile.email = '';

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1500);
            await stepContext.context.sendActivity('Alright, let me grab your details again.');

            // Replace with this dialog
            return await stepContext.beginDialog(LEAVE_QUESTION_DIALOG, { conversationData, userProfile });
        } else if (stepContext.result && stepContext.result !== userResponses.emailWrong && stepContext.result !== userResponses.emailCorrect) {
            // Save the results from the nameAndEmailDialog
            userProfile.name = stepContext.result.name;
            userProfile.email = stepContext.result.email;
        }

        const promptOptions = {
            prompt: 'What would you like to know?',
            retryPrompt: `I didn't quite get that - I was expecting a question between 10 and 256 characters.  \n\nCan you try again?`
        };

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(800);
        return await stepContext.prompt(QUESTION_PROMPT, promptOptions);
    }

    /**
     * If went to nameAndEmailDialog - save the results
     * Redirect the user if they want to use a different email
     * Provide the user with a confirmation message
     * Return the userProfile to the mainDialog
     */
    async endStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;

        // Capture the user's question
        userProfile.questions.push(stepContext.result);

        // Set userConfirmedEmail & finishedConversation to true
        conversationData.userConfirmedEmail = true;
        conversationData.finishedConversation = true;

        // Send a notification email to get the question answered
        sendQuestionEmail(userProfile);

        // If correct, confirm with user someone will get back to them
        const responses = [
            `Done! Someone will get back to you shortly.`,
            `All done - I'll make sure someone gets back to you asap!`,
            `We're good to go. I'll get someone to get back to you v soon.`
        ];

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
        await stepContext.context.sendActivity(randomSentence(responses));

        return await stepContext.endDialog({ conversationData, userProfile });
    }

    // ======================================
    // Validators
    // ======================================

    async questionValidator(promptContext) {
        // Check if the name is greater than 2 characters, but less than 20
        return promptContext.recognized.succeeded && promptContext.recognized.value.length > 10 && promptContext.recognized.value.length < 256;
    }
}

module.exports = { LeaveQuestionDialog, LEAVE_QUESTION_DIALOG };
