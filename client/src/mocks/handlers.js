import {resetPasswordHandler} from './handlers/reset-password-handler';
import {signinHandler} from './handlers/signin-handler';
import {signupHandler} from './handlers/signup-handler';
import {emailVerificationHandler} from './handlers/emailVerification-handler';
import {updateProfileHandler} from './handlers/updateProfile-handler';
import {contactUsHandler} from './handlers/contactUs-handler';
import {signOutHandler} from './handlers/signout-handler';
import {userDataHandler} from './handlers/userData-handler';
import {forgotPasswordHandler} from './handlers/forgot-password-handler';
import userDeleteHandler from './handlers/user-delete';
import {generateKeyHandler} from './handlers/generate_key-handler';
import {destroyKeyHandler} from './handlers/destroyKey-handler';
import imageUploadHandler from './handlers/imageUpload-handler';
import {uploadedImagesHandler} from './handlers/uploadedImages-handler';
import {displayImagesHandler} from './handlers/demo-displayImage-handler';

const handlers = [
	...signinHandler,
	...signupHandler,
	...signOutHandler,
	...emailVerificationHandler,
	...updateProfileHandler,
	...resetPasswordHandler,
	...contactUsHandler,
	...userDataHandler,
	...forgotPasswordHandler,
	...userDeleteHandler,
	...generateKeyHandler,
	...destroyKeyHandler,
	...imageUploadHandler,
	...uploadedImagesHandler,
	...displayImagesHandler,
];

export default handlers;
