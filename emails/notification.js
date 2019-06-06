// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

// Get SendGrid
const sgMail = require('@sendgrid/mail');

const { company } = require('../companyDetails');

const sendPipelineEmail = (userProfile) => {
    sgMail.send({
        to: 'rob@idealrole.com',
        from: 'rob@idealrole.com',
        subject: `${ company.name } Pipeline - New user to be added`,
        text: `A user would like to join the ${ company.name } pipeline.
                \n\nName: ${ userProfile.name }
                \n\nEmail: ${ userProfile.email }
                \n\nJob Type: ${ userProfile.categoryTwo }
                \n\nLocation: ${ userProfile.location }
                \n\nAlso, their pipeline info is: ${ JSON.stringify(userProfile.pipeline) }
                \n\n\nThanks, Gloria`
    });
};

const sendQuestionEmail = (userProfile) => {
    sgMail.send({
        to: 'rob@idealrole.com',
        from: 'rob@idealrole.com',
        subject: `${ company.name } - New Question`,
        text: `A user has a question for ${ company.name }.
                \n\nName: ${ userProfile.name }
                \n\nEmail: ${ userProfile.email }
                \n\nQuestion: ${ JSON.stringify(userProfile.questions) }
                \n\nAlso, their pipeline info is: ${ JSON.stringify(userProfile.pipeline) }
                \n\n\nThanks, Gloria`
    });
};

module.exports = {
    sendPipelineEmail,
    sendQuestionEmail
};
