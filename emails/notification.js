// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

// Get SendGrid
const sgMail = require('@sendgrid/mail');

const { company } = require('../companyDetails');

const sendPipelineEmail = (userProfile) => {
    sgMail.send({
        to: `${ company.emailContacts }`,
        from: 'rob@idealrole.com',
        subject: `${ company.name } Pipeline - New user to be added`,
        html: `<div style="font-size: 14px;">
                <p>A user would like to join the ${ company.name } pipeline.</p>
                <ul>
                    <li style="padding-bottom: 8px;">Name: ${ userProfile.name }</li>
                    <li style="padding-bottom: 8px;">Email: ${ userProfile.email }</li>
                    <li style="padding-bottom: 8px;">Job type: ${ userProfile.categoryTwo }</li>
                    <li style="padding-bottom: 8px;">Location: ${ userProfile.location }</li>
                </ul>
                <p>Other information that may be relevant for this user:</p>
                <ul>
                    <li style="padding-bottom: 8px;">Total pipeline: ${ JSON.stringify(userProfile.pipeline) }</li>
                    <li style="padding-bottom: 8px;">Questions asked: ${ JSON.stringify(userProfile.questions) }</li>
                </ul>
                <p>- Gloria</p>
                <br />
                <div style="font-size: 12px;">
                    <p>⚡ by Ideal Role</p>
                    <p style="font-size: 12px;">125 - 127 Mare St, London E8 3SJ</p>
                </div>
                </div>`
    });
};

const sendQuestionEmail = (userProfile) => {
    sgMail.send({
        to: `${ company.emailContacts }`,
        from: 'rob@idealrole.com',
        subject: `${ company.name } - New Question`,
        html: `<div style="font-size: 14px;">
                <p>A user has a question for ${ company.name }.</p>
                <ul>
                    <li style="padding-bottom: 8px;">Name: ${ userProfile.name }</li>
                    <li style="padding-bottom: 8px;">Email: ${ userProfile.email }</li>
                    <li style="padding-bottom: 8px;">Question: ${ JSON.stringify(userProfile.questions[0]) }</li>
                </ul>
                <p>Other information that may be relevant for the response:</p>
                <ul>
                    <li style="padding-bottom: 8px;">All questions they've asked: ${ JSON.stringify(userProfile.questions) }</li>
                    <li style="padding-bottom: 8px;">And their pipeline info: ${ JSON.stringify(userProfile.pipeline) }</li>
                </ul>
                <p>- Gloria</p>
                <br />
                <div style="font-size: 12px;">
                    <p>⚡ by Ideal Role</p>
                    <p style="font-size: 12px;">125 - 127 Mare St, London E8 3SJ</p>
                </div>
                </div>`
    });
};

module.exports = {
    sendPipelineEmail,
    sendQuestionEmail
};
