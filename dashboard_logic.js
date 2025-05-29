
document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Dashboard logic loaded.");

  fetch("jira_data.csv")
    .then((res) => {
      if (!res.ok) throw new Error("CSV fetch failed");
      return res.text();
    })
    .then((data) => {
      const rows = data.trim().split("\n").slice(1); // skip header
      const teams = ["Engineering - Product", "Engineering - Platform", "Engineering - AI Ops", "Design", "Data Science"];
      const statuses = {
        ready: ["To Do", "Ready for Development"],
        backlog: ["New", "Grooming"]
      };

      const teamData = {};
      teams.forEach(team => {
        teamData[team] = {
          readyCount: 0,
          totalCount: 0,
          backlogReady: 0,
          backlogTotal: 0,
          dependencies: 0
        };
      });

      rows.forEach((line) => {
        const cols = line.split(",");
        const team = cols[24];
        const status = cols[4];
        const sprint = cols[155];
        const inward = cols[50];
        const outward = cols[51];

        if (!teams.includes(team) || status === "Done") return;

        // Sprint Readiness
        if (sprint && !sprint.toLowerCase().includes("active")) {
          teamData[team].totalCount++;
          if (team === "Engineering - Product") {
            if (status === "Ready for Development") teamData[team].readyCount++;
          } else if (statuses.ready.includes(status)) {
            teamData[team].readyCount++;
          }
        }

        // Backlog Health
        if (!sprint || !sprint.toLowerCase().includes("active")) {
          teamData[team].backlogTotal++;
          if (statuses.backlog.includes(status)) {
            teamData[team].backlogReady++;
          }
        }

        // Dependencies
        if (inward || outward) teamData[team].dependencies++;
      });

      // Inject data into each section
      const location = window.location.pathname;
      if (location.includes("sprint_readiness")) {
        document.getElementById("sprint-readiness-content").innerHTML =
          renderTeamSection(teamData, "readiness");
      } else if (location.includes("backlog_health")) {
        document.getElementById("backlog-health-content").innerHTML =
          renderTeamSection(teamData, "backlog");
      } else if (location.includes("dependencies")) {
        document.getElementById("dependencies-content").innerHTML =
          renderTeamSection(teamData, "dependencies");
      } else {
        document.getElementById("status-summary").innerHTML =
          renderProgramSummary(teamData);
      }
    })
    .catch((err) => {
      console.error("🚨 Error loading dashboard data:", err);
    });
});

function stoplight(pct) {
  if (pct >= 80) return "blinking_green.gif";
  if (pct >= 50) return "blinking_yellow.gif";
  return "blinking_red.gif";
}

function renderTeamSection(data, type) {
  return Object.entries(data).map(([team, stats]) => {
    let pct = 0, msg = "", numerator = 0, denom = 0;
    if (type === "readiness") {
      numerator = stats.readyCount;
      denom = stats.totalCount;
      pct = denom ? Math.round((numerator / denom) * 100) : 0;
      msg = `Readiness is based on story tickets in future sprints that are in To Do or Ready for Dev (only Ready for Dev for Eng-Product)`;
    } else if (type === "backlog") {
      numerator = stats.backlogReady;
      denom = stats.backlogTotal;
      pct = denom ? Math.round((numerator / denom) * 100) : 0;
      msg = `Backlog health reflects groomed or new stories for future sprints or backlog grooming`;
    } else {
      msg = `This team has ${stats.dependencies} known blocking or blocked issues.`;
    }

    return `
      <div class="team-section">
        <h2>${team}</h2>
        ${type !== "dependencies" ? `<img class="stoplight" src="img/${stoplight(pct)}" alt="stoplight">` : ""}
        <p>${numerator} of ${denom} story tickets ${type === "readiness" ? "ready" : "groomed"} (${pct}%)</p>
        <p>${msg}</p>
      </div>
    `;
  }).join("");
}

function renderProgramSummary(data) {
  const totalReady = Object.values(data).reduce((acc, t) => acc + t.readyCount, 0);
  const total = Object.values(data).reduce((acc, t) => acc + t.totalCount, 0);
  const pct = total ? Math.round((totalReady / total) * 100) : 0;
  const light = stoplight(pct);
  return `
    <div class="team-section">
      <strong>Overall Project Status: </strong>
      <img class="stoplight" src="img/${light}" alt="Stoplight">
      <p>${pct}% of sprint-ready stories across 5 teams are in a ready state</p>
      <p>Summary of sprint readiness and backlog health is calculated based on real Jira data from your CSV.</p>
    </div>
  `;
}
