require('dotenv').config()
import * as express from 'express';
import sequelizeInit from './sequelize';
import * as createError from 'http-errors';
import { initializeAuthentication  } from './auth';
const passport = require('passport');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

// ? Express Configuration
app.set('port', process.env.PORT || 4000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true
}));
initializeAuthentication(app);

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: any, res: any, next: any) => {
    // only providing error in development
    const errRes: { status: any, error?: any } = {
        status: err.status || 500
    };
    if (req.app.get('env') === 'development') {
        errRes.error = err;
    }

    res.status(err.status || 500);
    res.send(errRes);
});

//? Sequelize init
sequelizeInit().then(db => {
    db.sequelize.sync();
    app.listen(app.get('port'), () => {
        console.log(`🐲 Server started on port: (${app.get('port')})`);
    });
});