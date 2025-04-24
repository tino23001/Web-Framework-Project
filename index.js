const express = require('express');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({extented: false}));
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({
  secret: 'You will never guess it',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new LocalStrategy((username, password, done) => {
        if (username === process.env.ADMINUSERNAME && password === process.env.ADMINPASSWORD) {
            console.log('Logged in');
            return done(null, { id: 1, username: username });
        } else {
            return done(null, false, { message: 'Invalid credentials' });
        }
    })
);

checkAuth = (request, response, next) => {
    if (request.isAuthenticated()) { 
        return next()
    }
    response.redirect('/admin/login')
}

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.get('/', async (request, response) => {
    let weatherData = await weather();
    response.render('index',
        {
            title: 'Our Park',
            visitors: visitors(),
            currentTemperature: weatherData.current.temperature_2m,
            todayHigh: weatherData.daily.temperature_2m_max[0],
            todayLow: weatherData.daily.temperature_2m_min[0]
        }
    )
});

app.get('/feedback', (request, response) => {
    response.render('feedback',
        {
            title: 'Our Park'
        }
    )
});

app.post('/send-feedback', (request, response) => {
    sendMail(request.body.email, request.body.subject, request.body.text),
    response.redirect(303, '/thank-you')
});

app.get('/thank-you', (request, response) => {
    response.render('thank-you',
        {
            title: 'Our Park'
        }
    )
});

app.get('/admin/login', (request, response) => {
    response.render('login')
});

app.post('/login/password', passport.authenticate('local', {
    successRedirect: '/admin/new-post',
    failureRedirect: '/admin/login'
}));

app.get('/admin/new-post', checkAuth, (request, response) => {
    response.render('new-post')
});

app.post('/admin/save-post', checkAuth, (request, response) => {
    // Save to MongoDB database
});

app.post('/admin/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

app.use(express.static('public'));

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "mail.prynde.fi",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.MAILUSERNAME,
        pass: process.env.MAILPASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function sendMail(email, subject, text) {
    const info = await transporter.sendMail({
        from: email, // Sender address
        to: process.env.MAILUSERNAME, // Receiver address
        subject: subject, // Subject line
        text: text, // Plain text body
      });
}

function visitors() {   // Return count of visitors since 01.04.2025
    let start = new Date('2025-04-01');
    let end = new Date(new Date().toJSON().slice(0, 10));
    let timeDifference = end - start;
    let visitorCount = timeDifference / (1000 * 3600 * 24) * 30 * 12; // Counting average one visitor per 2 minutes during opening hours 10am-10pm
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (hours >= 10 && hours <= 21) {
        hours = hours - 10;
        visitorCount = visitorCount + (hours * 30) + Math.round(minutes / 2);
    } else if (hours >= 22) {
        hours = hours - 10;
        visitorCount = visitorCount + (hours * 30);
    }
    return visitorCount;
}

async function weather() {
    let weatherData = await fetch('https://api.open-meteo.com/v1/forecast?latitude=60.9167&longitude=24.6333&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current=temperature_2m&timezone=auto')
    .then(res => res.json())
    return weatherData;
}

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));