import {generateKeyHandler} from './handlers/generate_key-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...emailVerificationHandler,
	...generateKeyHandler,
];

export default handlers;
