import {resetPasswordHandler} from './handlers/reset-password-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';
import {contactUsHandler} from './handlers/contactUs-handler';
import {signOutHandler} from './handlers/signout-handler';
import {userDataHandler} from './handlers/userData-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...signOutHandler,
	...emailVerificationHandler,
	...resetPasswordHandler,
	...contactUsHandler,
	...userDataHandler,
];

export default handlers;
