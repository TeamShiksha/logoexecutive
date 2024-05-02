import {resetPasswordHandler} from './handlers/reset-password-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';
import {updateProfileHandler} from './handlers/updateProfile-handler';
import {contactUsHandler} from './handlers/contactUs-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...emailVerificationHandler,
	...updateProfileHandler,
	...resetPasswordHandler,
	...contactUsHandler,
];

export default handlers;
