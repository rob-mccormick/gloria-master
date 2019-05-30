// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

class UserProfile {
    constructor() {
        // User's details
        this.name = 'Rob';
        this.email = '';

        // User's behaviour default values
        this.gdprAccepted = false;
        this.seenJobDisclaimer = false;
        this.addToPipeline = false;

        // User's job search
        this.location = '';
        this.categoryOne = '';
        this.categoryTwo = '';
        this.jobs = [];
    }
}

module.exports.UserProfile = UserProfile;
