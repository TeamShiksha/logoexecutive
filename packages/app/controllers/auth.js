const { STATUS_CODES } = require("node:http");

const {
  UserService,
  SubscriptionService,
  UserTokenService,
  SendEmailService,
  UserSessionService,
  PasswordResetService,
  MfaService,
} = require("../services");
const {
  signupPayloadSchema,
  signinPayloadSchema,
  forgotPasswordSchema,
  patchSchema,
} = require("../schemas/auth");
const sendEmail = require("../utils/sendEmail");
const {
  Messages,
  getIsProduction,
  SESSION_ID_REGEX,
} = require("../utils/constants");
const dayjs = require("dayjs");
/**
 * This controller validates the signup payload, checks if the email already exists,
 * creates a new subscription, registers a new user, and send a verification email.
 */
async function signupController(req, res, next) {
  try {
    const userService = new UserService();
    const userTokenService = new UserTokenService();
    const subscriptionService = new SubscriptionService();

    const { error, value } = signupPayloadSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        message: error.message,
        error: STATUS_CODES[422],
        statusCode: 422,
      });
    }

    const { email } = value;
    const user = await userService.getUserByEmail(email);

    // If the user is active block signup
    if (user?.is_deleted === false) {
      return res.status(400).json({
        message: Messages.EMAIL_EXISTS,
        error: STATUS_CODES[400],
        statusCode: 400,
      });
    }

    // Handle soft-deleted users
    if (user?.deleted_at) {
      const tenureDays = 30;
      const expiry = dayjs(user.deleted_at).add(tenureDays, "day");
      if (expiry.isAfter(dayjs())) {
        const daysLeft = expiry.diff(dayjs(), "day") + 1;
        return res.status(400).json({
          message: `Account exists. You may re-register after ${daysLeft} days.`,
          error: STATUS_CODES[400],
          statusCode: 400,
        });
      }
      await userService.deleteUserAccount(user._id);
    }

    // Create subscription only after validation passes
    const newSubscription = await subscriptionService.createSubscription();
    if (!newSubscription) {
      return res.status(500).json({
        message: Messages.SOMETHING_WENT_WRONG,
        statusCode: 500,
      });
    }

    Object.assign(value, { subscription_id: newSubscription._id });
    const newUser = await userService.createUser(value);
    if (!newUser) {
      return res.status(500).json({
        message: Messages.SOMETHING_WENT_WRONG,
        error: STATUS_CODES[500],
        statusCode: 500,
      });
    }

    const verificationToken = await userTokenService.createUserToken(
      newUser._id
    );
    if (!verificationToken) {
      return res.status(500).json({
        message: Messages.SOMETHING_WENT_WRONG,
        statusCode: 500,
      });
    }

    await sendEmail({
      id: 2,
      subject: "Openlogo: Email Verification",
      recipient: email,
      body: {
        url: verificationToken.tokenURL(),
      },
    });

    return res.status(201).json({
      message: Messages.USER_CREATED,
      statusCode: 201,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * This controller validates the sign-in payload, checks if the email exists,
 * verifies the user's email status, and compares the provided password with
 * the stored one.
 * On successful authentication, it always creates a new per-device session
 * and sets a sessionId cookie to maintain a session-based login.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} res
 */
async function signinController(req, res, next) {
  try {
    const userService = new UserService();
    const sendEmailService = new SendEmailService();
    const userSessionService = new UserSessionService();
    const mfaSessionService = new MfaService();

    let user = {};

    if (req.query.type === "guest") {
      user = await userService.getGuestUser();
    } else {
      const { body: payload } = req;
      const { error, value } = signinPayloadSchema.validate(payload);
      if (error)
        return res.status(422).json({
          message: error.message,
          statusCode: 422,
          error: STATUS_CODES[422],
        });

      const { email, password } = value;
      user = await userService.getUserByEmail(email);

      if (!user)
        return res.status(404).json({
          error: STATUS_CODES[404],
          message: Messages.INCORRECT_EMAIL_PASS,
          statusCode: 404,
        });

      if (user.is_deleted) {
        return res.status(400).json({
          error: STATUS_CODES[400],
          message: Messages.ACCOUNT_DOESNT_EXISTS,
          statusCode: 400,
        });
      }
      const matchPassword = await user.matchPassword(password);
      if (!matchPassword) {
        return res.status(404).json({
          error: STATUS_CODES[404],
          message: Messages.INCORRECT_EMAIL_PASS,
          statusCode: 404,
        });
      }

      if (!user.is_verified) {
        const result = await sendEmailService.sendVerificationEmail(user);
        if (result instanceof Error) {
          return res.status(result.statusCode || 500).json({
            source: "resendEmail",
            error: STATUS_CODES[result.statusCode] || STATUS_CODES[500],
            message: result.message,
            statusCode: result.statusCode,
          });
        } else {
          return res.status(201).json({
            source: "resendEmail",
            message: result.message,
            statusCode: 201,
          });
        }
      }
    }

    if (user.mfaEnabled) {
      const mfaSession = await mfaSessionService.createSession({
        userId: user._id,
      });
      const isProduction = getIsProduction();

      res.cookie("mfaSessionId", mfaSession.sessionId, {
        httpOnly: true,
        sameSite: "strict",
        expires: mfaSession.expiresAt,
        domain: isProduction ? ".openlogo.fyi" : "localhost",
      });

      return res.status(200).json({ statusCode: 200, mfaRequired: true });
    }

    const session = await userSessionService.createSession({
      userId: user._id,
      userAgent: req.headers["user-agent"] || "",
    });

    const currentDate = new Date();
    const oneDayValidityTimestamp = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const isProduction = getIsProduction();

    /** @type {import("express").CookieOptions}  */

    const sessionCookieOptions = {
      expires: oneDayValidityTimestamp,
      sameSite: "strict",
      httpOnly: true,
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    };

    res.cookie("sessionId", session.sessionId, sessionCookieOptions);

    return res.status(200).json({ statusCode: 200 });
  } catch (err) {
    next(err);
  }
}

/**
 * This controller logs out the user by deactivating the active session
 * associated with the sessionId stored in cookies.
 *
 * It clears the sessionId cookie and marks the session inactive in the database
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} res
 */
async function signoutController(req, res, next) {
  try {
    const userSessionService = new UserSessionService();
    const { sessionId } = req.cookies;

    if (
      !sessionId ||
      typeof sessionId !== "string" ||
      !SESSION_ID_REGEX.test(sessionId)
    ) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.SESSION_FAIL,
        statusCode: 400,
      });
    }

    await userSessionService.signout(sessionId);

    const isProduction = getIsProduction();

    /** @type {import("express").CookieOptions}  */
    const cookieOptions = {
      sameSite: "strict",
      httpOnly: true,
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    };

    res.clearCookie("sessionId", cookieOptions);

    return res.status(205).send();
  } catch (err) {
    next(err);
  }
}

/**
 * This controller processes a token provided in the request query.
 * It validates the token, checks its expiration, fetches the
 * associated user, and attempts to verify the user's account.
 */
async function verifyEmailController(req, res, next) {
  try {
    const userTokenService = new UserTokenService();
    const userService = new UserService();
    const sendEmailService = new SendEmailService();
    const { token } = req.params;

    if (!token) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: Messages.INVALID_TOKEN,
        statusCode: 422,
      });
    }

    const userToken = await userTokenService.fetchUserToken(token);

    if (!userToken) {
      const deletedToken = await userTokenService.fetchDeletedUserToken(token);

      if (deletedToken) {
        return res.status(200).json({
          statusCode: 200,
          message: Messages.EMAIL_ALREADY_VERIFIED,
          success: true,
          alreadyVerified: true,
        });
      }

      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.INVALID_TOKEN,
        statusCode: 400,
      });
    }

    const user = await userService.getUser(userToken.user_id);
    if (!user) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.INVALID_TOKEN,
        statusCode: 404,
      });
    }

    if (userToken.isExpired()) {
      const result = await sendEmailService.sendVerificationEmail(user);
      if (result instanceof Error) {
        return res.status(result.statusCode || 500).json({
          source: "resendEmail",
          error: STATUS_CODES[result.statusCode] || STATUS_CODES[500],
          message: result.message,
          statusCode: result.statusCode,
        });
      } else {
        return res.status(201).json({
          source: "resendEmail",
          message: result.message,
          statusCode: 201,
        });
      }
    }

    if (user.is_verified) {
      await userTokenService.deleteUserToken(userToken);

      return res.status(200).json({
        statusCode: 200,
        message: Messages.EMAIL_ALREADY_VERIFIED,
        success: true,
        alreadyVerified: true,
      });
    }

    const verifyResult = await userService.verifyUser(user._id);
    if (!verifyResult) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: Messages.VERIFICATION_FAIL,
        statusCode: 500,
      });
    }

    const result = await userTokenService.deleteUserToken(userToken);
    if (!result) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: Messages.SOMETHING_WENT_WRONG,
        statusCode: 500,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Email verified successfully",
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * This controller processes a token provided in the request query.
 * It validates the token, checks its expiration, fetches the associated user,
 * and attempts to verify the user's account.
 */
async function forgotPasswordController(req, res, next) {
  try {
    const userService = new UserService();
    const sendEmailService = new SendEmailService();
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error)
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422,
      });

    const { email } = value;
    const user = await userService.getUserByEmail(email);
    if (!user)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.EMAIL_DOESNT_EXISTS,
        statusCode: 404,
      });

    const result = await sendEmailService.sendForgotPasswordEmail(user);
    if (result instanceof Error && result.nextAllowedAt !== undefined) {
      return res.status(result.statusCode).json({
        source: "sendEmail",
        error: STATUS_CODES[result.statusCode],
        message: result.message,
        statusCode: result.statusCode,
        nextAllowedAt: result.nextAllowedAt,
      });
    } else if (result instanceof Error) {
      return res.status(result.statusCode || 500).json({
        source: "sendEmail",
        error: STATUS_CODES[result.statusCode] || STATUS_CODES[500],
        message: result.message,
        statusCode: result.statusCode,
      });
    }

    return res.status(200).json({
      source: "sendEmail",
      statusCode: 200,
      message: result.message,
      nextAllowedAt: result.nextAllowedAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * This controller validates the password reset token received from the email link.
 *
 * If the token is valid and not expired, it creates a short-lived
 * password reset session and sets a resetPasswordSessionId cookie.
 */
async function resetPasswordSessionController(req, res, next) {
  try {
    const userTokenService = new UserTokenService();
    const passwordResetSessionService = new PasswordResetService();
    const { token } = req.params;
    if (!token)
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: Messages.INVALID_TOKEN,
        statusCode: 422,
      });

    const userToken = await userTokenService.fetchUserToken(token);

    if (!userToken)
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
      });

    if (userToken.isExpired()) {
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: Messages.EXPIRED_TOKEN,
        statusCode: 403,
      });
    }

    const resetSession = await passwordResetSessionService.createSession({
      userId: userToken.user_id,
      resetToken: userToken.token,
    });
    const isProduction = getIsProduction();

    res.cookie("resetPasswordSessionId", resetSession.sessionId, {
      httpOnly: true,
      sameSite: "strict",
      expires: resetSession.expiresAt,
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    });

    return res.status(200).json({ statusCode: 200 });
  } catch (err) {
    next(err);
  }
}

/**
 * This controller completes the password reset process.
 *
 * It validates the password reset session using the sessionId stored in cookies,
 * verifies the provided reset token, updates the user's password,
 * deactivates the reset session, and deletes the used reset token.
 */
async function resetPasswordController(req, res, next) {
  try {
    const userService = new UserService();
    const userTokenService = new UserTokenService();
    const passwordResetSessionService = new PasswordResetService();

    const { resetPasswordSessionId } = req.cookies;
    if (
      !resetPasswordSessionId ||
      typeof resetPasswordSessionId !== "string" ||
      !SESSION_ID_REGEX.test(resetPasswordSessionId)
    ) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: Messages.VERIFICATION_FAIL,
        statusCode: 401,
      });
    }

    const { error, value } = patchSchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        error: STATUS_CODES[422],
        message: error.message,
        statusCode: 422,
      });
    }

    const resetSession =
      await passwordResetSessionService.findAndUpdateActiveSession(
        resetPasswordSessionId
      );

    if (!resetSession) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: Messages.VERIFICATION_FAIL,
        statusCode: 401,
      });
    }
    const { userId: user } = resetSession;
    if (resetSession.token !== value.token) {
      return res.status(403).json({
        error: STATUS_CODES[403],
        message: Messages.INVALID_TOKEN,
        statusCode: 403,
      });
    }
    const userToken = await userTokenService.fetchUserToken(value.token);
    const isSameAsOldPassword = await user.matchPassword(value.newPassword);
    if (isSameAsOldPassword) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.SAME_PASSWORD,
        statusCode: 400,
      });
    }
    const result = await userService.updateUserPassword(
      user,
      value.newPassword
    );
    if (!result) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.PASS_FAILED,
        statusCode: 400,
      });
    }
    await userTokenService.deleteUserToken(userToken);

    const isProduction = getIsProduction();

    res.clearCookie("resetPasswordSessionId", {
      httpOnly: true,
      sameSite: "strict",
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    });

    return res.status(200).json({ statusCode: 200 });
  } catch (error) {
    next(error);
  }
}

/**
 * Completes MFA sign-in by validating the `mfaSessionId` cookie,
 * verifying the provided TOTP token, clearing the MFA session,
 * ensuring/creating a user session, setting the auth session cookie,
 * and returning a success response. Responds with 401/400 on failure.
 */
async function siginWithMFAController(req, res, next) {
  try {
    const mfaService = new MfaService();
    const userSessionService = new UserSessionService();

    const { token } = req.body;
    const mfaSessionId = req.cookies.mfaSessionId;
    if (!mfaSessionId) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: Messages.VERIFICATION_FAIL,
        statusCode: 401,
      });
    }

    const mfaSession =
      await mfaService.findAndUpdateActiveSession(mfaSessionId);
    if (!mfaSession) {
      return res.status(401).json({
        error: STATUS_CODES[401],
        message: Messages.VERIFICATION_FAIL,
        statusCode: 401,
      });
    }

    const user = mfaSession.userId;

    const isVerified = await mfaService.mfaLogin(user, token);
    if (!isVerified) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.INCORRECT_PIN,
        statusCode: 400,
      });
    }

    const isProduction = getIsProduction();

    const session = await userSessionService.createSession({
      userId: user._id,
      userAgent: req.headers["user-agent"] || "",
    });
    const currentDate = new Date();
    const oneWeekValidityTimestamp = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const sessionCookieOptions = {
      expires: oneWeekValidityTimestamp,
      sameSite: "strict",
      httpOnly: true,
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    };

    res.clearCookie("mfaSessionId", {
      httpOnly: true,
      sameSite: "strict",
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    });
    res.cookie("sessionId", session.sessionId, sessionCookieOptions);

    return res.status(200).json({ statusCode: 200 });
  } catch (error) {
    next(error);
  }
}

/**
 * Initiates MFA setup for the authenticated user.
 *
 * Retrieves the user, generates and stores a new MFA secret,
 * returns the corresponding QR code for authenticator setup,
 * and responds with appropriate 404/500 errors on failure.
 */
async function enableMFAController(req, res, next) {
  try {
    const userService = new UserService();
    const mfaService = new MfaService();
    const { userId } = req.userData;
    const user = await userService.getUser(userId);

    if (!user) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    const { qrCode } = await mfaService.enableMfa(user);
    if (!qrCode) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: Messages.MFA_FAILED,
        statusCode: 500,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: { qrCode },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verifies MFA setup for the authenticated user.
 *
 * Validates the temporary MFA secret and its expiry,
 * verifies the provided TOTP token,
 * promotes the temporary secret to active MFA on success,
 * and returns appropriate 404/400/500 errors on failure.
 */
async function verifyMFAController(req, res, next) {
  try {
    const userService = new UserService();
    const mfaService = new MfaService();
    const { token } = req.body;
    const { userId } = req.userData;
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
      });
    }
    if (
      !user.mfaTempSecretExpiresAt ||
      user.mfaTempSecretExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.EXPIRED_TOKEN,
        statusCode: 400,
      });
    }
    const isVerified = await mfaService.verifyMfa(user, token);
    if (!isVerified) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message: Messages.INCORRECT_PIN,
        statusCode: 400,
      });
    }
    const isUpdated = await mfaService.updateMfaUser(user);
    if (!isUpdated) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: Messages.MFA_FAILED,
        statusCode: 500,
      });
    }
    return res.status(200).json({ statusCode: 200 });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancles MFA for the authenticated user.
 *
 * Retrieves the user, removes or deactivates MFA configuration,
 * and returns appropriate 404/500 errors if the operation fails.
 */
async function cancelMFAController(req, res, next) {
  try {
    const userService = new UserService();
    const mfaService = new MfaService();
    const { userId } = req.userData;
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    const isDisabled = await mfaService.disableMfa(user);
    if (!isDisabled) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: Messages.MFA_FAILED,
        statusCode: 500,
      });
    }

    return res.status(200).json({ statusCode: 200 });
  } catch (error) {
    next(error);
  }
}

/**
 * Disables MFA after password confirmation.
 *
 * Retrieves the authenticated user, verifies the provided password,
 * disables MFA configuration on success,
 * and returns appropriate 404/500 errors if validation or update fails.
 */
async function disableMFAController(req, res, next) {
  try {
    const userService = new UserService();
    const mfaService = new MfaService();
    const { password } = req.body;
    const { userId } = req.userData;
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
      });
    }

    const matchPassword = await user.matchPassword(password);
    if (!matchPassword) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.INCORRECT_EMAIL_PASS,
        statusCode: 404,
      });
    }

    const isDisabled = await mfaService.disableMfa(user);
    if (!isDisabled) {
      return res.status(500).json({
        error: STATUS_CODES[500],
        message: Messages.MFA_FAILED,
        statusCode: 500,
      });
    }

    return res.status(200).json({ statusCode: 200 });
  } catch (error) {
    next(error);
  }
}

/**
 *
 * Returns the MFA status for the authenticated user.
 */

async function mfaStatusController(req, res, next) {
  try {
    const { userId } = req.userData;
    const mfaService = new MfaService();
    const userService = new UserService();
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.USER_NOT_FOUND,
        statusCode: 404,
      });
    }
    const isMfaEnabled = await mfaService.getMfaStatus(user);
    return res.status(200).json({ statusCode: 200, isMfaEnabled });
  } catch (error) {
    next(error);
  }
}

function validateSessionController(req, res) {
  return res.status(200).json({ statusCode: 200, userData: req.userData });
}

/**
 * Lists all active sessions for the authenticated user.
 */
async function listSessionsController(req, res, next) {
  try {
    const userSessionService = new UserSessionService();
    const { userId } = req.userData;
    const currentSessionId = req.cookies.sessionId;

    const sessions = await userSessionService.getActiveSessions(userId);

    const formattedSessions = sessions.map((session) => {
      return {
        id: session.sessionId,
        deviceInfo: session.deviceInfo,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        isCurrent: session.sessionId === currentSessionId,
      };
    });

    return res
      .status(200)
      .json({ statusCode: 200, sessions: formattedSessions });
  } catch (error) {
    next(error);
  }
}

/**
 * Revokes a specific session from another device.
 */
async function revokeSessionController(req, res, next) {
  try {
    const userSessionService = new UserSessionService();
    const { userId } = req.userData;
    const { sessionId } = req.params;
    const currentSessionId = req.cookies.sessionId;

    if (sessionId === currentSessionId) {
      return res.status(400).json({
        error: STATUS_CODES[400],
        message:
          Messages.CANNOT_REVOKE_CURRENT_SESSION ||
          "Cannot revoke current session",
        statusCode: 400,
      });
    }

    const deactivated = await userSessionService.revokeSession(
      userId,
      sessionId
    );
    if (!deactivated) {
      return res.status(404).json({
        error: STATUS_CODES[404],
        message: Messages.SESSION_NOT_FOUND || "Session not found",
        statusCode: 404,
      });
    }

    return res.status(200).json({ statusCode: 200 });
  } catch (error) {
    next(error);
  }
}

/**
 * Revokes all sessions except the current one.
 */
async function signoutOthersController(req, res, next) {
  try {
    const userSessionService = new UserSessionService();
    const { userId } = req.userData;
    const currentSessionId = req.cookies.sessionId;

    const result = await userSessionService.revokeOtherSessions(
      userId,
      currentSessionId
    );

    return res.status(200).json({
      statusCode: 200,
      revokedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Revokes all sessions including the current one.
 */
async function signoutAllController(req, res, next) {
  try {
    const userSessionService = new UserSessionService();
    const { userId } = req.userData;

    await userSessionService.signoutAll(userId);

    const isProduction = getIsProduction();
    const cookieOptions = {
      sameSite: "strict",
      httpOnly: true,
      domain: isProduction ? ".openlogo.fyi" : "localhost",
    };

    res.clearCookie("sessionId", cookieOptions);
    return res.status(205).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signupController,
  signinController,
  signoutController,
  verifyEmailController,
  forgotPasswordController,
  resetPasswordSessionController,
  resetPasswordController,
  validateSessionController,
  siginWithMFAController,
  enableMFAController,
  verifyMFAController,
  cancelMFAController,
  disableMFAController,
  mfaStatusController,
  listSessionsController,
  revokeSessionController,
  signoutOthersController,
  signoutAllController,
};
