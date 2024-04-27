import { generateKeyHandler } from './handlers/generate_key-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';

const handlers = [...signinHandler, ...signupHandler, ...generateKeyHandler];

export default handlers;
