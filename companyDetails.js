// Company specific details to be used by the Bot

const company = {
    name: 'Monzo',
    locations: ['London', 'Cardiff', 'Las Vegas'],
    privacyNotice: 'https://monzo.com/legal/privacy-policy/',
    categoryOne: [
        'Building the product',
        'Growing the business',
        'Running the company'
    ],
    categoryTwo: [
        ['Design', 'Engineering', 'Product', 'Analytics'],
        ['Sales', 'Marketing', 'Customer Success', 'Banking'],
        ['Compliance', 'People', 'Finance', 'Legal', 'Admin']
    ],
    nextSteps: `aim to get back to you in 2 working days`,
    emailContacts: ['rob@idealrole.com'],
    jobs: [
        {
            id: 106,
            title: 'Customer Service Representative',
            location: 'Cardiff',
            cat1: 'Growing the business',
            cat2: 'Customer Success',
            intro: `We're looking for detail-oriented, empathetic problem solvers to join our Customer Operations (COps) team in our Cardiff office.`,
            link: 'https://boards.greenhouse.io/monzo/jobs/1561897'
        }, {
            id: 107,
            title: 'Team Leader',
            location: 'Cardiff',
            cat1: 'Growing the business',
            cat2: 'Customer Success',
            intro: `We’re looking for smart, people focused Team Leaders (internally known as Squad Captains) to lead our Customer Operations (COps) squads to continue delighting our customers.`,
            link: 'https://boards.greenhouse.io/monzo/jobs/942141'
        }, {
            id: 108,
            title: 'Customer Support Senior Manager',
            location: 'Cardiff',
            cat1: 'Growing the business',
            cat2: 'Customer Success',
            intro: `Internally known as Squad Captain Manager. We’re looking for an experienced senior customer support manager to be an empathetic leader for our Squad Captains and Customer Operations (COps) team.`,
            link: 'https://boards.greenhouse.io/monzo/jobs/1545695'
        }, {
            id: 1,
            title: 'Design Director',
            location: 'London',
            cat1: 'Building the product',
            cat2: 'Design',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 2,
            title: 'Backend Engineer',
            location: 'London',
            cat1: 'Building the product',
            cat2: 'Engineering',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 3,
            title: 'Design of Product',
            location: 'London',
            cat1: 'Building the product',
            cat2: 'Product',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 4,
            title: 'Data Analyst, Operations',
            location: 'London',
            cat1: 'Building the product',
            cat2: 'Analytics',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 5,
            title: 'Head of SEO',
            location: 'London',
            cat1: 'Growing the business',
            cat2: 'Marketing',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 6,
            title: 'Customer Service Representative',
            location: 'Las Vegas',
            cat1: 'Growing the business',
            cat2: 'Customer Success',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 7,
            title: 'Lending Analyst',
            location: 'London',
            cat1: 'Growing the business',
            cat2: 'Banking',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 8,
            title: 'Head of Financial Crime',
            location: 'London',
            cat1: 'Running the company',
            cat2: 'Compliance',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 9,
            title: 'Diversity and Inclusion Lead',
            location: 'London',
            cat1: 'Running the company',
            cat2: 'People',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 10,
            title: 'Tax Analyst',
            location: 'London',
            cat1: 'Running the company',
            cat2: 'Finance',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        },
        {
            id: 11,
            title: 'Executive Assistant',
            location: 'London',
            cat1: 'Running the company',
            cat2: 'Admin',
            intro: 'This will be an intro to what the job aims to achieve. It will help the user decide whether they want to see more.',
            link: '#href'
        }
    ]
};

const helpTopics = {
    interviews: {
        expect: `We want to get to know you.  Your previous positions and challenges. And what you're looking for in a career.
            \n\nWe're also trying to assess how well you'll do in the job. So we may ask some competency questions. Along with some on how you approach problems and work in a team.`,
        prepare: `Check out ${ company.name } beforehand, and get to know us and our industry. And how your strengths and experience would help you in the job your interviewing for.
            \n\nAlso we'll have copies of your CV or portfolio, so no need to bring them.`,
        wear: `What you have to say is important to us - not what you're wearing.
            \n\nSo wear whatever makes you comfortable and confident!`
    },
    workingOptions: {
        flexible: `We work hard to make our offices a hive of activity and collaboration. So while we prefer you work there when you can, we also want you to be your best.
            \n\nTo help you we try to be as flexible as we can - in hours and location.
            \n\nIf you need something permanent, best to ask when the recruiter contacts you. Otherwise you're team lead will be able to help when you need it.`,
        remote: `Some of our roles are fully remote. I can help you find them 😉
            \n\nFor other roles, we prefer you to be in the office when you can. But we're also flexible and you can work from home or remotely when you need to.`,
        partTime: `While our jobs are normally full-time, we understand everyone needs something a little different.
            \n\nWhere we can we'll do our best to accomodate part-time hours. Best to let the recruitment team know when they contact you.`,
        annualLeave: `You can find the annual leave you'll get on the job description.  It can vary a bit depending on the location.
            \n\nOn top of that, after 4 years you'll get an extra 6 weeks paid time off. A little thanks for your hard work!`,
        parentalLeave: `We're proud to offer generous maternity and paternity leave.`,
        visa: `Yep, ${ company.name } is a registered sponsor. But due to Home Office restrictions we can't sponsor all roles.
            \n\nFeel free to apply for any jobs. We'll let you know if we're unable to sponsor any specific roles.`,
        relocation: `For international hires we do!
            \n\nIt varies a bit by role and requirements, but usually we'll give you cash to help you with the cost.`
    }
};

module.exports = { company, helpTopics };
