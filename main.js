/*
 * Main.js
 * Joss Bird
 */

const config        = require('./config.json');
const express       = require('express');
const webInterface  = express();
const cookieParser  = require('cookie-parser');
const crypto        = require('crypto')

// Configure Web Interface
webInterface.set('view engine', 'pug');
webInterface.set('views', './pages')
webInterface.listen(config.webPort, console.log(`[*] Started web interface on port ${config.webPort}`));

webInterface.use(cookieParser());

let sessionData = {};

/*
 * Custom Session Management
 * TODO:
 * - Use files or database
 * - Delete old sessions
 */
webInterface.use((req, res, next)=>{
    if(req.cookies.sessionID == undefined || sessionData[req.cookies.sessionID] == undefined)
    {
        let sessionID = crypto.randomBytes(8).toString('hex');
        req.cookies.sessionID = sessionID;
        res.cookie('sessionID', sessionID, {httpOnly: true});
        sessionData[sessionID] = {
            sessionID: sessionID,
            loggedIn: false
        };
    }

    let _end = res.end;
    res.end = function end(chunk, encoding) {
        sessionData[req.cookies.sessionID] = req.session;
        _end.call(res, chunk, encoding);
    }
    
    req.session = sessionData[req.cookies.sessionID];
    next();
});

webInterface.get('/', function (req, res) {
    res.render('welcome');
});

webInterface.get('/login', function (req, res) {
    res.render('login');
    req.session.loggedIn = true;
});