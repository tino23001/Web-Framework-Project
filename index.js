function visitors() {   // Return count of visitors since 01.04.2025
    let start = new Date('2025-04-01');
    let end = new Date(new Date().toJSON().slice(0, 10));
    let timeDifference = end - start;
    let visitorCount = timeDifference / (1000 * 3600 * 24) * 60 * 12; // Counting average one visitor per minute during opening hours 10am-10pm
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    if (hours >= 10 && hours <= 21) {
        hours = hours - 10;
        visitorCount = visitorCount + (hours * 60) + minutes
    } else if (hours >= 22) {
        hours = hours - 10;
        visitorCount = visitorCount + (hours * 60);
    }
    console.log(visitorCount);
}
visitors();