import { Router, Request, Response } from 'express';
import { to } from 'await-to-js';
import { verifyPassword, hashPassword } from '../auth/utils'
import { login as JWTLogin } from '../auth/strategies/jwt.strategy';
import { UserRepository } from '../sequelize/repositories';

const router = Router();
const isValidEmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const cookieOptions = {
  secure: process.env.CLIENT_SERVER_URL?.includes("https"),
  maxAge: Date.now() + 60 * 60 * 1000 * 4,
  domain: process.env.CLIENT_SERVER_URL?.includes("https") ? process.env.CLIENT_SERVER_URL?.replace(/http:\/\/|https:\/\//g, "") : process.env.CLIENT_SERVER_URL?.replace(/http:\/\/|https:\/\//g, ""),
  httpOnly: true
};

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
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
  .cookie('jwt', token, cookieOptions)
  .json({ success: true, data: '/' });
});

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
    .cookie("jwt", token, cookieOptions)
    .json({ success: true, data: '/' });
});
module.exports = router;
