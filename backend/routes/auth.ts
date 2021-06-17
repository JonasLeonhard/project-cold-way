import { Router, Request, Response, CookieOptions } from 'express';
import { to } from 'await-to-js';
import { verifyPassword, hashPassword, verifyToken } from '../auth/utils'
import { login as JWTLogin } from '../auth/strategies/jwt.strategy';
import { UserRepository } from '../sequelize/repositories';

const router = Router();
const isValidEmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const cookieOptions = (req: Request): CookieOptions => {return {
  secure: process.env.CLIENT_SERVER_URL?.includes("https"),
  maxAge: Date.now() + 60 * 60 * 1000 * 4,
  domain: req.hostname,
  sameSite: 'lax'
}};
/**
 * Route checks if User with { email, password } exists in Database. If so a JWT 
 * is created and set for the client.
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log('email', email);
  const [err, user] = await to(UserRepository.getUserByEmail(email));

  const authenticationError = () => {
    return res.status(500).json({ success: false, data: 'Login Authentication error.'});
  };

  if (!user || err) {
    console.error('User with email does not exist.');
    return authenticationError();
  }

  if (!await verifyPassword(password, user.password)) {
    console.error('Passwords do not match.');
    return authenticationError();
  }

  const [loginErr, token] = await to(JWTLogin(req, user));

  if (loginErr) {
    console.error('JWTLogin error.')
    return authenticationError();
  }

  return res
  .status(200)
  .cookie('jwt', token, cookieOptions(req))
  .json({ success: true, data: '/' });
});

/**
 * Register Route creates a new User in the database. If the user is created,
 * a JWT is set as a cooke for the client.
 */
router.post('/register', async (req: Request, res: Response) => {
  console.log('/register called!!!', req.body);
  const {
    email,
    password,
    displayName,
    businessName,
    firstName,
    lastName
  } = req.body;

  if (!isValidEmailRegex.test(email)) {
    return res.status(500).json({ success: false, data: 'Enter a valid email address.' });
  } else if (password.length < 5 || password.length > 20) {
    return res.status(500).json({ success: false, data: 'Password must be between 5 and 20 characters.' });
  }
  const [err, user] = await to(UserRepository.createUser({
    email,
    password: await hashPassword(password),
    displayName,
    providerId: '0',
    provider: 'local',
    businessName,
    firstName,
    lastName
  }));

  if (err) {
    return res.status(500).json({ success: false, data: 'Email is already taken' });
  }

  const [loginErr, token] = await to(JWTLogin(req, user));

  if (loginErr) {
    console.error(loginErr);
    return res.status(500).json({ success: false, data: 'Authentication error!' });
  }

  return res
    .status(200)
    .cookie("jwt", token, cookieOptions(req))
    .json({ success: true, data: '/' });
});

/**
 * Validates a JWT cookie. Has two modes: 
 * forwarded_user_cookie: this is the cookie forwared by the next.js clientside app, to be validated
 * cookie: this is the cooke set by the client to be validated
 */
router.post('/token', async (req: Request, res: Response) => {
  const jwt = req.headers.forwarded_user_cookie ? req.headers.forwarded_user_cookie : req.headers.cookie;
  // remove the 'jwt=' from the cookie to get the token.
  const [verifyError, verified] = await to(verifyToken(jwt ? jwt?.toString().substring(4) : ''));
  const tokenError = () => {
    return res.status(200).json({ data: { user: null, status: 'SIGNED_OUT' }})
  };

  if (verifyError) {
    return tokenError();
  }
  if (verified) {
    const [err, user] = await to(UserRepository.getUserByEmail((verified as { data: { email: string } }).data.email));

    if (!user || err) {
      console.error('User with email does not exist.');
      return tokenError();
    }
  
    // check hashed password in jwt with hashed password in database
    if ((verified as { data: { password: string }}).data.password !== user.password) {
      console.error('Passwords do not match.');
      return tokenError();
    }

    return res.status(200).json({ data: { user, status: 'SIGNED_IN' }});

  } else {
    return tokenError();
  }
});
module.exports = router;
