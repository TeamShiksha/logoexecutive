import {resetPasswordHandler} from './handlers/reset-password-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...emailVerificationHandler,
	...resetPasswordHandler,
];

export default handlers;
