import * as express from 'express';
import * as path from 'path';
import * as createError from 'http-errors';

const app = express();

const indexRouter = require('./routes/index');
const wsRouter = require('./routes/websocket');

// Configuration
app.set('port', process.env.PORT || 6000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/ws', wsRouter);

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

app.listen(app.get('port'), () => {
    console.log(`Server started on port: ${app.get('port')})`);
});
