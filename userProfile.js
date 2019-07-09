// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

class UserProfile {
    constructor(name, email, location, categoryOne, categoryTwo, experience) {
        // User's details
        this.name = name;
        this.email = email;

        // If the user has accepted GDPR disclaimer
        this.gdprAccepted = false;

        // User's job search
        this.location = location;
        this.categoryOne = categoryOne;
        this.categoryTwo = categoryTwo;
        this.experience = experience;
        this.jobs = [];

        // User's pipeline
        this.pipeline = [];

        // User's questions
        this.questions = [];
    }
}

module.exports.UserProfile = UserProfile;
