import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';
import {updateProfileHandler} from './handlers/updateProfile-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...emailVerificationHandler,
	...updateProfileHandler,
];

export default handlers;
