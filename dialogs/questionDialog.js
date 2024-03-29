// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { delay, randomSentence } = require('../helperFunctions');

// Import other dialogs
const { LeaveQuestionDialog, LEAVE_QUESTION_DIALOG } = require('./leaveQuestionDialog');

const { postQnData } = require('../company/authorization');

const QUESTION_DIALOG = 'questionDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

let helpTopics;

const responses = {
    // sections: helpTopics.sections,
    back: 'Go back',
    answered: 'Yes thanks',
    notAnswered: 'No',
    yesLeaveQuestion: `Yes please`,
    noLeaveQuestion: `No need`,
    yesNewQuestion: `Yes, but on something else`,
    yesMoreQuestion: `Yes, on this topic`,
    noMoreQuestion: `No thanks`
};

// Options for confirming that the user's question was answered
const questionAnswered = [
    `Was that helpful?`,
    `Did I answer your question?`,
    `Did I cover everything?`
];

class QuestionDialog extends CancelAndHelpDialog {
    constructor() {
        super(QUESTION_DIALOG);

        this.addDialog(new LeaveQuestionDialog())
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.helpTopicsStep.bind(this),
                this.presentQuestionsStep.bind(this),
                this.presentAnswerStep.bind(this),
                this.checkIfAnsweredQuestionStep.bind(this),
                this.anotherQuestionStep.bind(this),
                this.redirectStep.bind(this),
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

        // Load the question data
        helpTopics = JSON.parse(fs.readFileSync('company/questions.json'));

        // Check which topic they're interested in
        const options = helpTopics.sections;
        const question = MessageFactory.suggestedActions(options, `What area can I help you with?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Based on the user's response, present the correct options
     */
    async presentQuestionsStep(stepContext) {
        // Set variables that will depend on the user's response
        let intro;
        let helpObj;
        let question;
        let options;

        if (stepContext.result.includes('options')) {
            intro = `We try to be flexible and help you find the right balance ⚖️\n\nWhat area would you like to know more about?\n\n`;
            helpObj = helpTopics.workingOptions;
        } else if (stepContext.result.includes('after' && 'apply')) {
            intro = `Sure, what would you like to know?\n\n`;
            helpObj = helpTopics.afterApply;
        } else if (stepContext.result.includes('prepar') || stepContext.result.includes('Prepar')) {
            intro = `I'm very excited to hear your thinking of applying 😊\n\nWould you like tips on:\n\n`;
            helpObj = helpTopics.prepareApplication;
        }

        // Build the question with the numbered questions
        question = this.buildQuestion(intro, helpObj);
        options = this.buildResponseOptions(helpObj);

        // Add the option to go back to select a different category
        if (options[(options.length - 1)] !== responses.back) {
            options.push(responses.back);
        }

        // Save the correct object to the conversationData
        stepContext.values.conversationData.helpTopic = helpObj;

        const response = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(response);
        return Dialog.EndOfTurn;
    }

    /**
     * Present the answer to the question the user selected
     */
    async presentAnswerStep(stepContext) {
        // First, send user back if they selected 'Go back'
        if (stepContext.result === responses.back) {
            const conversationData = stepContext.values.conversationData;
            const userProfile = stepContext.values.userProfile;

            return await stepContext.replaceDialog(QUESTION_DIALOG, { conversationData, userProfile });
        }

        // Otherwise, save the index of the user's response
        const index = parseInt(stepContext.result, 10) - 1;

        // Get the correct answer
        const answer = stepContext.values.conversationData.helpTopic[index].answer;

        // Save the question asked to the userProfile
        stepContext.values.userProfile.questionContext.push(stepContext.values.conversationData.helpTopic[index].question);

        // Presenet the answer to the user
        for (var i = 0; i <= answer.length; i++) {
            let response = answer[i];

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });

            await delay(1000);
            await stepContext.context.sendActivity(response);
        }

        // Ask if it answered their question
        const options = [responses.answered, responses.notAnswered];
        const question = randomSentence(questionAnswered);
        const response = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(2000);
        await stepContext.context.sendActivity(response);
        return Dialog.EndOfTurn;
    }

    /**
     * If went to nameAndEmailDialog - save the results
     * Redirect the user if they want to use a different email
     * Ask the user to leave their question
     */
    async checkIfAnsweredQuestionStep(stepContext) {
        let options;
        let question;
        // If answered their question, ask they have another
        if (stepContext.result === responses.answered) {
            options = [responses.yesNewQuestion, responses.yesMoreQuestion, responses.noMoreQuestion];
            question = randomSentence([
                `Would you like to ask another question?`,
                `Can I help you with another question?`
            ]);

            const response = MessageFactory.suggestedActions(options, question);

            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });

            // Send data to API
            stepContext.values.conversationData.questionHelpful = true;
            let questionData = { question_helpful: true };
            postQnData(stepContext.values.userProfile.questionContext, stepContext.context._activity.conversation.id, questionData);

            await delay(1000);
            await stepContext.context.sendActivity(response);
            return Dialog.EndOfTurn;
        }

        // Send data to API
        stepContext.values.conversationData.questionHelpful = false;
        let questionData = { question_helpful: false };
        postQnData(stepContext.values.userProfile.questionContext, stepContext.context._activity.conversation.id, questionData);

        // If didn't answer their question, pass to next step
        return stepContext.next();
    }

    /**
     * Process the responses from the previous step
     * - Restart dialog if user has a question on a new topic
     * - Continue if is finished
     * - Otherwise ask if wants to leave a question
     */
    async anotherQuestionStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;
        let question;

        // Deal with each user response
        switch (stepContext.result) {
        case responses.yesNewQuestion:
            return await stepContext.replaceDialog(QUESTION_DIALOG, { conversationData, userProfile });
        case responses.noMoreQuestion:
            return stepContext.next();
        case responses.yesMoreQuestion:
            question = `Hmm, I'm afraid I've shared all I know...\n\nCan I take your question and have someone get back to you?`;
            break;
        default:
            question = `Sorry about that 🤨\n\nCan I take your question and have someone get back to you?`;
        }

        const options = [responses.yesLeaveQuestion, responses.noLeaveQuestion];

        const response = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(2000);
        await stepContext.context.sendActivity(response);
        return Dialog.EndOfTurn;
    }

    /**
     * Process the responses from the previous step
     * - Redirect to leaveQuestion dialog if user wants to leave a question
     * - Otherwise go to final step
     */
    async redirectStep(stepContext) {
        const conversationData = stepContext.values.conversationData;
        const userProfile = stepContext.values.userProfile;

        if (stepContext.result === responses.yesLeaveQuestion) {
            // Send data to API
            let questionData = {
                question_helpful: stepContext.values.conversationData.questionHelpful,
                wants_reply: true
            };
            postQnData(stepContext.values.userProfile.questionContext, stepContext.context._activity.conversation.id, questionData);

            return await stepContext.beginDialog(LEAVE_QUESTION_DIALOG, { conversationData, userProfile });
        } else if (stepContext.result === responses.noLeaveQuestion) {
            // Send data to API
            let questionData = {
                question_helpful: stepContext.values.conversationData.questionHelpful,
                wants_reply: false
            };
            postQnData(stepContext.values.userProfile.questionContext, stepContext.context._activity.conversation.id, questionData);
        }

        return stepContext.next();
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
        }

        // Set finishedConversation to true and hasQuestion to false
        conversationData.finishedConversation = true;
        conversationData.hasQuestion = false;

        return await stepContext.endDialog({ conversationData, userProfile });
    }

    // ======================================
    // Helper functions
    // ======================================

    buildQuestion(intro, qList) {
        let response = intro;

        for (var i = 1; i <= qList.length; i++) {
            response += `${ i } - ${ qList[i - 1].question }\n\n`;
        }

        return response;
    }

    buildResponseOptions(qList) {
        let options = [];

        for (var i = 1; i <= qList.length; i++) {
            options.push(String(i));
        }

        return options;
    }
}

module.exports.QuestionDialog = QuestionDialog;
module.exports.QUESTION_DIALOG = QUESTION_DIALOG;
