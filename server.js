/**
 * Server starting point.
 **/

//Requires
let express = require('express');
let bodyParser = require('body-parser');
let exphbs = require('express-secure-handlebars');
let path = require('path');
let session = require('express-session');
let http = require('http');
let helmet = require('helmet');
let csp = require('helmet-csp');
let passport = require('passport');
let home = require('./routes/home');
let user = require('./routes/user');
let issues = require('./routes/issues');
let db = require('./lib/dbresource');
let auth = require('./lib/authresource');
let wss = require('./lib/wssresource');
let lo = require('log-to-file');


let app = express();
let server = http.createServer(app);

//Configurations----------------------------------------------------------------------------------------------------

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let config = require('./configs/config');

app.set('port', config.port);
db.connect();
auth.connect();
wss.connect(server);

//View engine.
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Middlewares-------------------------------------------------------------------------------------------------------

//Environment specifics
if (process.env.NODE_ENV === 'production') {
    //Trust the reverse proxy
    app.enable('trust proxy');
} else {
    //Expose localhost
    let ngrok = require('ngrok');
    console.log('setting up ngrok');
    ngrok.connect(config.port, (err, url) => {
        if (err) {
            return err;
        }
        console.log('ngrok at ' + url);
        config.hookurl = url;
    });
    //Find static resources.
    app.use(express.static(path.join(__dirname, 'public')));
}

//JSON support
app.use(bodyParser.json());

//HTML form data support
app.use(bodyParser.urlencoded({extended: true}));

//Security
app.use(helmet());

//Security-CSP
app.use(csp({
    directives: {
        defaultSrc: ["'self'", config.socket, config.secureSocket, 'github.com', '*.githubusercontent.com', 'api.github.com'],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
    },
    loose: false,
    reportOnly: false,
    setAllHeaders: true,
    disableAndroid: true,
    browserSniff: false
}));

//Check database connection.
app.use((req, res, next) => {
    if (!db.isConnected) {
        next(new Error('No database connection!')); //go to 500
    } else {
        next();
    }
});

//Cookie session.
app.use(session({
    name:   "mums",
    store: db.sessionStore(),
    secret: config.cookiesecret,
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // will live for 1 day
    }
}));

// Flash messages.
app.use((req, res, next) => {
    if (req.session.flash) {
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    }
    next();
});

// Initialize Passport and restore authentication state,
// if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

// Transfer user information.
app.use((req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
    }
    next();
});

//Log out User if node process closes
app.use((req, res, next) => {
    process.on("SIGINT", () => {
        req.logout();

        setTimeout(() => {
            process.exit(0);
        }, 200);
    });

    next();
});

//Routes------------------------------------------------------------------------------------------------------------
app.use('/', home);
app.use('/user', user);
app.use('/user/:username/issues', issues);

//Custom Error Pages-------------------------------------------------------------------------------------------------

//404
app.use((req, res) => {
    res.status(404).render('error', {message: 'really couldn\'t find this page!'});
});

//500
app.use((err, req, res, next) => {
    log('500:');
    log(err);
    res.status(500).render('error', {message: 'my fault. sorry. maybe try again later?'});
});

//Start the server----------------------------------------------------------------------------------------------------
server.listen(config.port, () => {});