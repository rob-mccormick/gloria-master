// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes, CardFactory, AttachmentLayoutTypes } = require('botbuilder');

const { company } = require('../company/companyDetails');
const { delay } = require('../helperFunctions');

const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const { postJobData } = require('../company/authorization');

const COMPANY_BENEFITS_DIALOG = 'companyBenefitsDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    otherOptionYes: `Go on`,
    otherOptionNo: 'No thanks'
};

class CompanyBenefitsDialog extends CancelAndHelpDialog {
    constructor() {
        super(COMPANY_BENEFITS_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            // this.askWhatToSeeStep.bind(this),
            this.pathRedirectStep.bind(this),
            this.otherOptionStep.bind(this),
            this.endStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Show the user what insider info is available
     * Ask if they want to see it
     */
    async pathRedirectStep(stepContext) {
        // Save info passed in
        const benefits = stepContext.options.benefits;
        stepContext.values.benefits = benefits;

        const video = stepContext.options.video;
        stepContext.values.video = video;

        const firstTime = stepContext.options.firstTime;
        stepContext.values.firstTime = firstTime;

        const userProfile = stepContext.options.userProfile;
        stepContext.values.userProfile = userProfile;

        // Determine what to show
        if (benefits) {
            // Get the benefits to display
            let benefits = company.benefits.cards;
            let benefitsToDisplay = [];

            benefits.forEach(el => benefitsToDisplay.push(this.createHeroCard(el)));

            // Give broader benefits first - then more specific
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(company.benefits.message);

            // Let the user know the info is on their site
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(2000);
            await stepContext.context.sendActivity({
                attachments: benefitsToDisplay,
                attachmentLayout: AttachmentLayoutTypes.Carousel
            });
        } else if (video) {
            // Show the video
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(500);
            await stepContext.context.sendActivity(`Perfect, here's it is`);

            // Use this version if the video is uploaded as a file (mp4)
            await stepContext.context.sendActivity(this.createVideo(company.companyVideo));
        }

        // Go to next step
        return stepContext.next();
    }

    /**
     * Check if the user wants to see the other option
     */
    async otherOptionStep(stepContext) {
        let question;

        // If second time through, skip step
        // Otherwise, based on what has seen, ask if they'd like to see the other option
        if (!stepContext.values.firstTime) {
            return stepContext.next();
        } else if (stepContext.values.video) {
            question = `Would you also like to see our benefits?`;
        } else if (stepContext.values.benefits && company.companyVideo) {
            question = `Would you also like to see the video?`;
        } else {
            return stepContext.next();
        }

        const options = [responses.otherOptionYes, responses.otherOptionNo];
        const message = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(message);
        return Dialog.EndOfTurn;
    }

    /**
     * If they want to see the other option, restart
     * Otherwise provide link to glasshouse reviews - then end
     */
    async endStep(stepContext) {
        if (stepContext.result === responses.otherOptionYes) {
            // Set variables based on what has seen
            let benefits;
            let video;
            const firstTime = false;
            let userProfile = stepContext.values.userProfile;

            if (stepContext.values.benefits) {
                benefits = false;
                video = true;
            } else if (stepContext.values.video) {
                benefits = true;
                video = false;
            }

            // Restart dialog
            return await stepContext.replaceDialog(COMPANY_BENEFITS_DIALOG, { benefits, video, firstTime, userProfile });
        }

        // As isn't seeing another option, base message on what did see
        let message;

        if (stepContext.values.video && stepContext.values.firstTime) {
            message = `Well, thanks for watching.`;
        } else if (stepContext.values.benefits && stepContext.values.firstTime && company.companyVideo) {
            message = `Well, thanks for checking out our benefits.`;
        } else {
            message = `I hope you liked what you saw 🙂`;
        }

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });

        // Send data to API
        let jobData = {};
        if (!stepContext.values.firstTime) {
            jobData = {
                saw_benefits: true,
                saw_company_video: true
            };
        } else if (stepContext.values.firstTime && stepContext.values.video) {
            jobData = {
                saw_benefits: false,
                saw_company_video: true
            };
        } else if (stepContext.values.benefits && !company.companyVideo) {
            jobData = { saw_benefits: true
            };
        } else {
            jobData = {
                saw_benefits: true,
                saw_company_video: false
            };
        }
        postJobData(stepContext.values.userProfile, stepContext.context._activity.conversation.id, jobData);

        await delay(1000);
        await stepContext.context.sendActivity(message);

        // // If the company has a glassdoor link, show it
        // if (company.glassdoor) {
        //     await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        //     await delay(1000);
        //     await stepContext.context.sendActivity(`One other thing you may be interested in is our glassdoor reviews.`);

        //     await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        //     await delay(1000);
        //     await stepContext.context.sendActivity(`You can find them here:\n\n${ company.glassdoor }`);
        // }

        return stepContext.endDialog();
    }

    // ======================================
    // Helper functions
    // ======================================

    createVideo(videoUrl) {
        return MessageFactory.contentUrl(
            videoUrl,
            'video/mp4'
        );
    }

    createAnimationCard(videoUrl) {
        return CardFactory.animationCard(
            `Working at ${ company.name }`,
            [videoUrl]
        );
    }

    // createHeroCard(benefit, imageUrl) {
    //     return CardFactory.heroCard(
    //         benefit,
    //         [imageUrl]
    //         // CardFactory.actions([
    //         //     {
    //         //         type: 'openUrl',
    //         //         title: 'Get started',
    //         //         value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
    //         //     }
    //         // ])
    //     );
    // }
    // createHeroCard() {
    //     return CardFactory.heroCard(
    //         'PiedPiperCoin rewards',
    //         'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/Money+Emoji+%5BFree+Download+Money+Face+Emoji%5D.png',
    //         [
    //             {
    //                 type: 'openUrl',
    //                 title: 'Get started',
    //                 value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
    //             }
    //         ]
    //     );
    // }

    createHeroCard(obj) {
        return CardFactory.heroCard(
            obj.benefit,
            CardFactory.images([obj.imageUrl])
        );
    }

    // createHeroCard() {
    //     return CardFactory.heroCard(
    //         'PiedPiperCoin rewards',
    //         CardFactory.images(['https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/Money+Emoji+%5BFree+Download+Money+Face+Emoji%5D.png'])
    //     );
    // }
}

module.exports = { CompanyBenefitsDialog, COMPANY_BENEFITS_DIALOG };
