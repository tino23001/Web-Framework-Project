const express = require('express');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({extented: false}));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.get('/', (request, response) => {
    response.render('index',
        {
            title: 'Our Park',
            visitors: visitors()
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
    sendMail(request.body.email, request.body.subject, request.body.text)
    response.redirect(303, '/thank-you')
    
});

app.get('/thank-you', (request, response) => {
    response.render('thank-you',
        {
            title: 'Our Park'
        }
    )
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
        from: email, // sender address
        to: process.env.MAILUSERNAME, // receiver address
        subject: subject, // Subject line
        text: text, // plain text body
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

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));