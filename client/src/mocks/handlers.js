import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';

const handlers = [...signinHandler, ...signupHandler];

export default handlers;
