// Footer related
export const footerColumns = [
	[
		{name: 'Welcome', link: '/home'},
		{
			name: 'Demo',
			link: '/home#demo',
		},
	],
	[
		{name: 'About', link: '/about'},
		{
			name: 'Contact',
			link: '/about#contactus',
		},
	],
];

// Header related
export const loggedInNavbarItems = [
	{
		name: 'Dashboard',
		link: '/dashboard',
	},
	{
		name: 'Docs',
		link: '/docs',
	},
	{
		name: 'Pricing',
		link: '/pricing',
	},
	{
		name: 'About',
		link: '/about',
	},
];

export const loggedOutNavbarItems = [
	{
		name: 'Home',
		link: '/home',
	},
	{
		name: 'Demo',
		link: '/home#demo',
	},
	{
		name: 'Pricing',
		link: '/pricing',
	},
	{
		name: 'About',
		link: '/about',
	},
];

// Profile related
export const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

// Pricing related
export const pricingCardsContent = [
	{
		title: 'Hobby',
		tagline: 'Empower your projects with essential tools, at no cost.',
		price: 'Free',
		features: [
			'Fortune 500 company logo',
			'5000 API calls per month',
			'2 API keys',
			'Basic analytics',
			'48-72 hour of response time',
		],
	},
	{
		title: 'Pro',
		tagline: 'Elevate your business with our comprehensive service.',
		price: '₹1600',
		period: true,
		features: [
			'Fortune 500 company logo + private images',
			'15000 API calls per month',
			'5 API keys',
			'Advance analytics',
			'12-36 hours of response time',
		],
		label: 'Recommended',
	},
	{
		title: 'Teams',
		tagline: 'Experience limitless advantages and detailed reporting.',
		price: 'Custom Pricing',
		features: [
			'Fortune 500 company logo + unlimited private logos',
			'Unlimited API calls per month',
			'50 API keys',
			'Advance analytics',
			'Priority support',
		],
	},
];

export const faqsData = [
	{
		title: 'How to create API Keys ?',
		steps: [
			"Visit the dashboard page, go to the 'Your API Key' section, add a description, and click 'Generate Key.' Your newly generated key will be automatically included in the table displayed on the same page.",
		],
	},
	{
		title: 'How to upgrade plan ?',
		steps: ['Stay tuned coming soon'],
	},
	{
		title: 'How to see logs ?',
		steps: ['Stay tuned coming soon'],
	},
];

// Admin dashboard related
export const imageTableHeadings = [
	'IMAGE NAME',
	'CREATE DATE',
	'UPDATE DATE',
	'REUPLOAD',
];

export const adminTableHeadings = ['EMAIL', 'REASON', 'ACTION', 'CREATE DATE'];

export const dummyAdminTableDetails = [
	{
		email: 'admin@gmail.com',
		reason: 'Testing 1',
		createDate: 'Jan 12, 2024',
	},
	{
		email: 'testadmin@gmail.com',
		reason: 'Testing 2',
		createDate: 'Jan 25, 2024',
	},
];

export const INITIAL_SIGNUP_FORM_DATA = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	confirmPassword: '',
};

export const INITIAL_SIGNIN_FORM_DATA = {
	email: '',
	password: '',
};

export const INITIAL_CONTACTUS_FORM_DATA = {
	name: '',
	email: '',
	message: '',
};

export const SubscriptionTypes = {
	HOBBY: 'HOBBY',
	PRO: 'PRO',
	TEAMS: 'TEAMS',
};

export const isLettersAndSpacesOnly = /^[a-zA-Z\s]*$/;

export const INITIAL_UPDATE_PROFILE_FORM_DATA = {
	firstName: '',
	lastName: '',
	email: '',
};

export const INITIAL_UPDATE_PASSWORD_FORM_DATA = {
	currPassword: '',
	newPassword: '',
	confirmPassword: '',
};

export const isValidPassword =
	/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
