// Company specific details to be used by the Bot

const company = {
    name: 'PiedPiper',
    locations: ['Silicon Valley', 'Oakland'],
    privacyNotice: 'https://www.idealrole.com/privacy',
    categoryOne: [
        'Building the product',
        'Growing the business',
        'Running the company'
    ],
    specialism: [
        ['Design', 'Engineering', 'Product', 'Analytics'],
        ['Sales', 'Marketing', 'Customer Success'],
        ['Compliance', 'People', 'Finance', 'Legal', 'Admin']
    ],
    nextSteps: `It's easy and you'll only need a copy of your CV.\n\nJust scroll up and click "apply" on the job you like 👆`,
    companyVideo: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/employer-video.mp4',
    benefits: {
        siteLink: 'https://www.idealrole.com/demo',
        message: 'Along with awesome colleagues, engaging work, and the opportunity to help us build the new internet, we offer a number of beneifts.\n\nCheck them out 👇',
        cards: [
            {
                benefit: 'PiedPiperCoin rewards\n\n',
                imageUrl: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/pp-money.png?versionId=null'
            }, {
                benefit: 'Generous leave policy\n\n',
                imageUrl: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/pp-island.png?versionId=null'
            }, {
                benefit: 'Learning & development budget',
                imageUrl: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/pp-book.png?versionId=null'
            }, {
                benefit: 'Yoga classes and retreats\n\n',
                imageUrl: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/pp-yoga.png?versionId=null'
            }, {
                benefit: 'Healthy food and snacks\n\n',
                imageUrl: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/pp-salad.png?versionId=null'
            }, {
                benefit: 'Comprehensive health plans',
                imageUrl: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/pp-health.png?versionId=null'
            }
        ]
    },
    glassdoor: 'https://www.glassdoor.co.uk/Overview/Working-at-Typeform-EI_IE991912.11,19.htm',
    emailContacts: ['rob@idealrole.com']
};

const jobs = [
    {
        id: 101,
        title: 'Design Director',
        location: 'Silicon Valley',
        specialism: ['Design'],
        minExperience: 7,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 102,
        title: 'Web Developer',
        location: 'Silicon Valley',
        specialism: ['Engineering', 'Marketing'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 103,
        title: 'iOS Developer',
        location: 'Silicon Valley',
        specialism: ['Engineering'],
        minExperience: 2,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 104,
        title: 'Android Developer',
        location: 'Silicon Valley',
        specialism: ['Engineering'],
        minExperience: 2,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 105,
        title: 'Full-stack Engineer',
        location: 'Silicon Valley',
        specialism: ['Engineering'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 106,
        title: 'DevOps Engineer',
        location: 'Silicon Valley',
        specialism: ['Engineering'],
        minExperience: 4,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 107,
        title: 'Product Designer',
        location: 'Silicon Valley',
        specialism: ['Product', 'Design'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 108,
        title: 'Product Manager',
        location: 'Silicon Valley',
        specialism: ['Product'],
        minExperience: 5,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 109,
        title: 'Data Scientist',
        location: 'Silicon Valley',
        specialism: ['Analytics'],
        minExperience: 2,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 110,
        title: 'Data Analyst',
        location: 'Silicon Valley',
        specialism: ['Analytics'],
        minExperience: 1,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 111,
        title: 'Account Manager',
        location: 'Silicon Valley',
        specialism: ['Sales'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 112,
        title: 'Partner Sales Manager',
        location: 'Silicon Valley',
        specialism: ['Sales'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 113,
        title: 'Product Marketing Manager',
        location: 'Silicon Valley',
        specialism: ['Marketing', 'Product'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 114,
        title: 'Social Media Manager',
        location: 'Silicon Valley',
        specialism: ['Marketing'],
        minExperience: 2,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 115,
        title: 'Team Leader',
        location: 'Oakland',
        specialism: ['Customer Success'],
        minExperience: 4,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 116,
        title: 'Customer Success Manager',
        location: 'Oakland',
        specialism: ['Customer Success'],
        minExperience: 0,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 117,
        title: 'Customer Success Manager',
        location: 'Oakland',
        specialism: ['Customer Success'],
        minExperience: 0,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 118,
        title: 'Customer Success Manager',
        location: 'Oakland',
        specialism: ['Customer Success'],
        minExperience: 0,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 119,
        title: 'Recruiter',
        location: 'Silicon Valley',
        specialism: ['People'],
        minExperience: 2,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 120,
        title: 'Business Partner',
        location: 'Silicon Valley',
        specialism: ['People'],
        minExperience: 5,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 121,
        title: 'Accountant',
        location: 'Silicon Valley',
        specialism: ['Finance'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 122,
        title: 'Head of Legal',
        location: 'Silicon Valley',
        specialism: ['Legal'],
        minExperience: 7,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }, {
        id: 123,
        title: 'Operations Manager',
        location: 'Silicon Valley',
        specialism: ['Operations'],
        minExperience: 3,
        intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
        jdLink: 'https://www.idealrole.com/demo/job-application',
        applyLink: 'https://www.idealrole.com/demo/job-application',
        video: 'https://gloria-master-test.s3.eu-west-2.amazonaws.com/piedpiper/video-job-description.mp4'
    }
];

const helpTopics = {
    prepareApplication: [
        {
            question: `Preparing your CV`,
            answer: [
                `We want to hear about what you've achieved, your strengths and skills.\n\nWe also want to know how you can apply them to the job you're applying for.`,
                `☝️ And a tip - when talking about your past jobs focus on what you achieved. Not your duties.`,
                `You can make your CV as long or short as you like - just keep it relevant.  And it helps to have a summary on the first page.`
            ]
        }, {
            question: `Cover letters`,
            answer: [
                `We thought about this one and realised that cover letters are a pain to write and not that helpful...\n\nSo you don't need one to apply 😀`
            ]
        }, {
            question: `If you need a CS degree`,
            answer: [
                `You don't need a computer science degree to be an engineer at ${ company.name }.\n\nWe're more interested in what you can do now.`
            ]
        }, {
            question: `Reapplying for the same job`,
            answer: [
                `If you weren't successful you can always reapply for a job.`,
                `But so you know, we'll look to see how you've addressed the reason you didn't get the job before.\n\nIt's normal for this to take time - maybe 6 to 12 months.`
            ]
        }
    ],
    afterApply: [
        {
            question: `What happens after I apply?`,
            answer: [
                `If you look like a good fit for the job, we'll get in touch to arrange a call.`,
                `After this, you'll be asked to complete a task for some roles.  There are no right or wrong answers to these - we just want to see how you solve real world problems.`,
                `Then you'll come in for an interview at our office.  We'll give you all the specific details based on the job you applied for.`
            ]
        }, {
            question: `Do you keep applications for future jobs?`,
            answer: [
                `The good news - we keep all applications for future roles.`,
                `The bad news - our system isn't always great at matching people to the right roles.`,
                `To be safe, you can let me know what job your after and I'll let you know every time we have a new one.`
            ]
        }, {
            question: `How to prepare for interviews?`,
            answer: [
                `In interviews we want to get to know you.  Your previous positions and challenges.  And what you're looking for in a career.`,
                `So it's a good idea to have some examples of different challenges you've faced.  And be able to explain what action you took.  And how it all turned out.`,
                `It's also good to check out [company] beforehand and get to know us and our industry.  And we'll have copies of your CV or portfolio - so no need to bring them.`
            ]
        }, {
            question: `What to wear to an interview?`,
            answer: [
                `What you have to say is important to us - not what you're wearing.\n\nSo wear whatever makes you comfortable and confident!`
            ]
        }
    ],
    workingOptions: [
        {
            question: `Flexible working options`,
            answer: [
                `We work hard to make our offices a hive of activity and collaboration.  So while we prefer you work there when you can, we're flexible in hours and location.`,
                `If you need something permanent - like working different hours, part-time or remotely - best to mention this to the recruitment team when they contact you.  We'll do our best to accommodate you.`
            ]
        }, {
            question: `Leave benefits`,
            answer: [
                `You can find the annual leave you'll get in the job description.\n\nAnd on top of that, after 4 years you'll get an extra 6 weeks paid time off. A little thanks for your hard work!`,
                `We're also proud to offer generous maternity and paternity leave.`
            ]
        }, {
            question: `International workers`,
            answer: [
                `${ company.name } is a registered sponsor - so we're happy to offer visa support where we can.  But due to Home Office restrictions, we can't sponsor all roles.`,
                `We also offer our international hires help relocating.  It varies a bit by role and requirements, but usually we'll give you some cash to help cover your costs.`
            ]
        }, {
            question: `Students`,
            answer: [
                `Each year we run our Summer Internship Programme 🌞\n\nYou'll be able to find details here on our career site from March each year.`,
                `At the moment we don't offer work placements or a graduate program.  But some of our roles can be a great fit if you're new to the workforce.`
            ]
        }
    ]
};

module.exports = { company, jobs, helpTopics };
