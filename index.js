const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.get('/', (request, response) => {
    // response.render('index');
    response.render('index',
        {
            title: 'Our Park',
            visitors: visitors()
        }
    )
});

app.use(express.static('public'));


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
        visitorCount = visitorCount + (hours * 60) + Math.round(minutes / 2);
    } else if (hours >= 22) {
        hours = hours - 10;
        visitorCount = visitorCount + (hours * 60);
    }
    return visitorCount;
}

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));