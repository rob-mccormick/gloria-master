// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');
const sgMail = require('@sendgrid/mail');

const sendPipelineEmail = (userProfile) => {
    const company = JSON.parse(fs.readFileSync('company/companyInfo.json'));
    let experience;

    if (userProfile.experience && userProfile.experience !== 'all') {
        experience = userProfile.experience;
    } else {
        experience = 'Not provided';
    }

    sgMail.send({
        to: `${ company.emailContacts }`,
        from: 'gloria@idealrole.com',
        subject: `${ company.name } Pipeline - New user to be added`,
        html: `<div style="font-size: 14px;">
                <p>Hey team,<p/>
                <p>Someone wants to join the ${ company.name } pipeline.</p>
                <p>Their details are:</p>
                <ul>
                    <li style="padding-bottom: 8px;">Name: ${ userProfile.name }</li>
                    <li style="padding-bottom: 8px;">Email: ${ userProfile.email }</li>
                    <li style="padding-bottom: 8px;">They're looking for a job in: ${ userProfile.specialism }</li>
                    <li style="padding-bottom: 8px;">Type of role: ${ experience }</li>
                </ul>
                <br>
                <p>- Gloria</p>
                <br><br>
                <div style="font-size: 12px;">
                    <p>⚡ by Ideal Role</p>
                    <p style="font-size: 12px;">125 - 127 Mare St, London E8 3SJ</p>
                </div>
                </div>`
    });
};

const sendQuestionEmail = (userProfile) => {
    const company = JSON.parse(fs.readFileSync('company/companyInfo.json'));

    sgMail.send({
        to: `${ company.emailContacts }`,
        from: 'gloria@idealrole.com',
        subject: `${ company.name } Career Site - New Question`,
        html: `<div style="font-size: 14px;">
                <p>Hey team,</p>
                <p>You've received a new question from your career site chatbot.</p>
                <p>The details are:</p>
                <ul>
                    <li style="padding-bottom: 8px;">Person's name: ${ userProfile.name }</li>
                    <li style="padding-bottom: 8px;">Their email: ${ userProfile.email }</li>
                    <li style="padding-bottom: 8px;">And their question: ${ JSON.stringify(userProfile.questions[(userProfile.questions.length - 1)]) }</li>
                </ul>
                <br>
                <p>To give some context, the last question they searched for was:</p>
                <ul>
                    <li>${ JSON.stringify(userProfile.questionContext[(userProfile.questionContext.length - 1)]) }</li>
                </ul>
                <br>
                <p>- Gloria</p>
                <br><br>
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
