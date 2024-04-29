import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';
import {contactUsHandler} from './handlers/contactUs-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...emailVerificationHandler,
	...contactUsHandler,
];

export default handlers;
