function getStoplightGif(percent) {
    if (percent >= 80) return "img/blinking_green.gif";
    if (percent >= 50) return "img/blinking_yellow.gif";
    return "img/blinking_red.gif";
}
fetch('jira_data.csv').then(r => r.text()).then(console.log);