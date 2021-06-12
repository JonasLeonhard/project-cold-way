const passport = require('passport');
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UserRepository, User } from '../sequelize/repositories';

/**
 * Setup passport serializeUser & deserializeUser for all Strategies.
 */
const setup = () => {
    // ERROR? was _id
    passport.serializeUser((user: User, done: Function) => done(null, user.id));

    passport.deserializeUser(async (id: number, done: Function) => {
      try {
        const user = await UserRepository.getUserById(id);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    });
};

const signToken = (user: User) => {
    if(!process.env.JWT_SECRET) {
        throw new Error('process.env.JWT_SECRET is not set! Please set it in .env and restart the application.')
    }
    return jwt.sign({ data: user }, process.env.JWT_SECRET, {
        expiresIn: 604800
    });
};

const verifyPassword = async (candidate: string, actual: string) => {
    return await bcrypt.compare(candidate, actual)
};

const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export {
    setup,
    signToken,
    verifyPassword,
    hashPassword
}