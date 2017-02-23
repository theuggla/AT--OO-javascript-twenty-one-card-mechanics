/**
 * Server starting point.
 **/

//Requires
let express = require('express');
let bodyParser = require('body-parser');
let exphbs = require('express-secure-handlebars');
let path = require('path');
let session = require('express-session');
let helmet = require('helmet');
let csp = require('helmet-csp');
let passport = require('passport');
let flash = require('express-flash');
let request = require('request-promise-native');
let home = require('./routes/home');
let user = require('./routes/user');
let config = require('./config/configs');
let db = require('./lib/dbresource');
let auth = require('./lib/authresource');

let app = express();
let port = process.env.port || 8000;

//Configurations----------------------------------------------------------------------------------------------------

app.set('port', port);
db.connect();
auth.connect();

//View engine.
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Middlewares-------------------------------------------------------------------------------------------------------

//JSON support
app.use(bodyParser.json());

//HTML form data support
app.use(bodyParser.urlencoded({extended: true}));

//Find static resources.
app.use(express.static(path.join(__dirname, 'public')));

//Security
app.use(helmet());

//Security-CSP
app.use(csp({
    directives: {
        defaultSrc: ["'self'", 'github.com', 'githubusercontent.com', 'api.github.com', 'avatars.githubusercontent.com'],
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
        next('No database connection!'); //go to 500
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

//Routes------------------------------------------------------------------------------------------------------------
app.use('/', home);
app.use('/user', user);

//Custom Error Pages-------------------------------------------------------------------------------------------------

//404
app.use((req, res) => {
    res.status(404).render('error', {message: 'really couldn\'t find this page!'});
});

//500
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', {message: 'my fault. sorry. maybe try again later?'});
});

//start the server
app.listen(port, () => {
    console.log('server up and running, press Ctrl+C to finish');
});