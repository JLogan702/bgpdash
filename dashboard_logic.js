
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const value = item[key] || 'Unspecified';
        (result[value] = result[value] || []).push(item);
        return result;
    }, {});
}

function isFutureSprint(sprintValue) {
    return sprintValue && !sprintValue.includes("state=ACTIVE");
}

function renderSprintReadiness(data) {
    const byTeam = groupBy(data.filter(d => d['Issue Type'] === 'Story'), 'Components');
    let html = '';

    for (const team in byTeam) {
        const stories = byTeam[team];
        const inFutureSprint = stories.filter(d => isFutureSprint(d['Sprint']));

        const readyStatuses = team === "Engineering - Product"
            ? ["Ready for Development"]
            : ["Ready for Development", "To Do"];

        const readyCount = inFutureSprint.filter(d => readyStatuses.includes(d['Status'])).length;
        const totalCount = inFutureSprint.length;
        const percentReady = totalCount ? Math.round((readyCount / totalCount) * 100) : 0;

        let stoplight = 'red';
        if (percentReady >= 80) stoplight = 'green';
        else if (percentReady >= 50) stoplight = 'yellow';

        html += `
            <div style="margin-bottom: 20px;">
                <h3>${team}</h3>
                <img src="img/blinking_stoplight_${stoplight}.gif" alt="${stoplight}" width="40">
                <p><strong>${percentReady}% ready</strong> (${readyCount} of ${totalCount} story tickets in future sprints are in '${readyStatuses.join("' or '")}' status.)</p>
            </div>
        `;
    }

    document.getElementById('content').innerHTML = html;
}

function renderBacklogHealth(data) {
    const byTeam = groupBy(data.filter(d => d['Issue Type'] === 'Story'), 'Components');
    let html = '';

    for (const team in byTeam) {
        const stories = byTeam[team];
        const backlog = stories.filter(d => !d['Sprint'] || !d['Sprint'].includes("state=ACTIVE"));
        const healthy = backlog.filter(d => ['New', 'Grooming'].includes(d['Status']));
        const estimated = backlog.filter(d => d['Custom field (Story Points)'] || d['Custom field (Story point estimate)']);

        const totalCount = backlog.length;
        const healthyCount = healthy.length;
        const estimatedCount = estimated.length;
        const percentHealthy = totalCount ? Math.round((healthyCount / totalCount) * 100) : 0;

        let stoplight = 'red';
        if (percentHealthy >= 80) stoplight = 'green';
        else if (percentHealthy >= 50) stoplight = 'yellow';

        html += `
            <div style="margin-bottom: 20px;">
                <h3>${team}</h3>
                <img src="img/blinking_stoplight_${stoplight}.gif" alt="${stoplight}" width="40">
                <p><strong>${percentHealthy}% backlog health</strong> (${healthyCount} of ${totalCount} story tickets in backlog are in 'New' or 'Grooming' status.)</p>
                <p>${totalCount - estimatedCount} tickets are missing estimates.</p>
            </div>
        `;
    }

    document.getElementById('content').innerHTML = html;
}

function renderProgramSummary(data) {
    const futureStories = data.filter(d =>
        d['Issue Type'] === 'Story' && isFutureSprint(d['Sprint'])
    );

    let readyCount = 0;
    futureStories.forEach(d => {
        const team = d['Components'];
        const isReady = (team === 'Engineering - Product' && d['Status'] === 'Ready for Development') ||
                        (team !== 'Engineering - Product' && ['Ready for Development', 'To Do'].includes(d['Status']));
        if (isReady) readyCount++;
    });

    const total = futureStories.length;
    const percent = total ? Math.round((readyCount / total) * 100) : 0;

    let stoplight = 'red';
    if (percent >= 80) stoplight = 'green';
    else if (percent >= 50) stoplight = 'yellow';

    document.getElementById('content').innerHTML = `
        <img src="img/blinking_stoplight_${stoplight}.gif" alt="${stoplight}" width="60">
        <h2>Overall Sprint Readiness: ${percent}%</h2>
        <p>${readyCount} of ${total} story tickets across all teams in upcoming sprints are in a 'ready' status.</p>
    `;
}
