import { Express } from 'express';
import * as utils from './utils';
import * as strategies from './strategies/strategies';


const pipe = (...inputFunctions: Array<Function>) => (returnValue: Express) => inputFunctions.reduce((currentValue: Express, currentFunction: Function) => currentFunction(currentValue), returnValue);


const initializeAuthentication = (app: Express) => {
    utils.setup();

    pipe(
        strategies.JWTStrategy
    )(app);
};

export { 
    utils, 
    initializeAuthentication, 
    strategies 
};