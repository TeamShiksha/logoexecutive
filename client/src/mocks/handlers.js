import {resetPasswordHandler} from './handlers/reset-password-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';

const handlers = [...signinHandler, ...signupHandler, ...resetPasswordHandler];

export default handlers;
