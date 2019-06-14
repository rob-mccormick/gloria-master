// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog, TextPrompt } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { delay, randomSentence } = require('../helperFunctions');

// Import other dialogs
const { InterviewDialog, INTERVIEW_DIALOG } = require('./questions/interviewDialog');
const { FlexibleWorkingDialog, FLEXIBLE_WORKING_DIALOG } = require('./questions/flexibleWorkingDialog');
const { LeaveQuestionDialog, LEAVE_QUESTION_DIALOG } = require('./questions/leaveQuestionDialog');

const QUESTION_DIALOG = 'questionDialog';
const QUESTION_PROMPT = 'questionPrompt';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    interview: `Interviews`,
    flexibleWorking: `Working options`,
    yesLeaveQuestion: `Yes please`,
    noLeaveQuestion: `No need`,
    noMoreQuestion: `No, all done`,
    yesMoreQuestion: `I do`
};

class QuestionDialog extends CancelAndHelpDialog {
    constructor() {
        super(QUESTION_DIALOG);

        this.addDialog(new TextPrompt(QUESTION_PROMPT, this.questionValidator))
            .addDialog(new InterviewDialog())
            .addDialog(new FlexibleWorkingDialog())
            .addDialog(new LeaveQuestionDialog())
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.helpTopicsStep.bind(this),
                this.redirectToDialogStep.bind(this),
                this.checkDialogResultStep.bind(this),
                this.anotherQuestionStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Saves the conversation and user data passed from the mainDialog
     * Ask the user what information they'd like to know more about
     */
    async helpTopicsStep(stepContext) {
        // Save the conversationData and userProfile passed from mainDialog
        const conversationData = stepContext.options.conversationData;
        stepContext.values.conversationData = conversationData;

        const userProfile = stepContext.options.userProfile;
        stepContext.values.userProfile = userProfile;

        // Check which topic they're interested in
        const options = [responses.interview, responses.flexibleWorking];
        const question = MessageFactory.suggestedActions(options, `What can I help you with?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Based on the user's response, redirect them to the appropriate dialog
     */
    async redirectToDialogStep(stepContext) {
        switch (stepContext.result) {
        case responses.interview:
            return await stepContext.beginDialog(INTERVIEW_DIALOG);
        case responses.flexibleWorking:
            return await stepContext.beginDialog(FLEXIBLE_WORKING_DIALOG);
        default:
            console.log('Something went wrong - no option selected');
        }
    }

    /**
     * If went to nameAndEmailDialog - save the results
     * Redirect the user if they want to use a different email
     * Ask the user to leave their question
     */
    async checkDialogResultStep(stepContext) {
        let options;
        let question;
        // If did not answer question, ask if want to leave a question
        if (stepContext.result === -1) {
            options = [responses.yesLeaveQuestion, responses.noLeaveQuestion];
            question = MessageFactory.suggestedActions(options, `Can I take your question and have someone get back to you?`);
        } else if (stepContext.result === 1) {
            options = [responses.noMoreQuestion, responses.yesMoreQuestion];
            question = MessageFactory.suggestedActions(options, `Do you have another question?`);
        }

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(2000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Process the responses from the previous step
     * - Redirect to leaveQuestion dialog if user wants to leave a question
     * - Restart dialog if user has another question
     * - Otherwise go to final step
     */
    async anotherQuestionStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;

        // Deal with each user response
        switch (stepContext.result) {
        case responses.yesLeaveQuestion:
            return await stepContext.beginDialog(LEAVE_QUESTION_DIALOG, { conversationData, userProfile });
        case responses.yesMoreQuestion:
            return await stepContext.beginDialog(QUESTION_DIALOG, { conversationData, userProfile });
        default:
            return stepContext.next();
        }
    }

    /**
     * Save the user data if returning from leaveQuestionDialog step
     * Return to the mainDialog
     */
    async endStep(stepContext) {
        let conversationData;
        let userProfile;

        if (stepContext.result) {
            conversationData = stepContext.result.conversationData;
            userProfile = stepContext.result.userProfile;
        } else {
            conversationData = stepContext.values.conversationData;
            userProfile = stepContext.values.userProfile;

            // Set finishedConversation to true
            conversationData.finishedConversation = true;
        }

        return await stepContext.endDialog({ conversationData, userProfile });
    }
}

module.exports.QuestionDialog = QuestionDialog;
module.exports.QUESTION_DIALOG = QUESTION_DIALOG;
