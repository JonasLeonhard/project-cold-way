const passport = require('passport');
import * as passportJWT from 'passport-jwt';
import { UserRepository, User } from '../../sequelize/repositories'
import { Request } from 'express';
import { signToken } from '../utils';
import { to } from 'await-to-js'

const strategy = () => {
    /**
     * Describes how to retrieve the JWT from the request
     */
    const strategyOptions = {
        jwtFromRequest: (req: Request) => req.cookies.jwt,
        secretOrKey: process.env.JWT_SECRET,    
        passReqToCallback: true
    };

    /**
     * Uses the token from the request to retrieve the user from the Database
     */
    const verifyCallback = async (req: Request, jwtPayload: any, cb: Function) => {
        // ERROR? ; was _id
        const [err, user] = await to(UserRepository.getUserById(jwtPayload.data.id));

        if (err) {
            return cb(err);
        }
        req.user = user as Express.User;
        return cb(null, user);
    };

    passport.use(new passportJWT.Strategy(strategyOptions, verifyCallback))
};

const login = (req: Request, user?: User) => {
    return new Promise((resolve: Function, reject: Function) => {
        if (user) {
            req.login(user, { session: false }, (err: Error) => {
                if (err) {
                    return reject(err);
                }

                return resolve(signToken(user));
            })
        } else {
            return reject(new Error('User is undefined!'));
        }
    })
};

export {
    strategy,
    login
};