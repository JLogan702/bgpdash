

console.log("📊 Dashboard JS loaded.");
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const isSprint = path.includes("sprint_readiness");
  const isBacklog = path.includes("backlog_health");
  const isDeps = path.includes("dependencies");

fetch("docs/jira_data.csv")
    .then((res) => res.text())
    .then((data) => {
      const rows = data.trim().split("\n");
      const headers = rows[0].split(",");
      const body = rows.slice(1).map(row => {
        const values = row.split(",");
        return headers.reduce((obj, h, i) => ({...obj, [h]: values[i]}), {});
      });

      const teams = [
        "Engineering - Product",
        "Engineering - Platform",
        "Engineering - AI Ops",
        "Design",
        "Data Science"
      ];

      function renderStoplight(percent) {
        if (percent >= 80) return "img/blinking_stoplight_green.gif";
        if (percent >= 50) return "img/blinking_stoplight_yellow.gif";
        return "img/blinking_stoplight_red.gif";
      }

      if (isSprint) {
        const div = document.getElementById("sprint-readiness-content");
        div.innerHTML = "";
        teams.forEach(team => {
          const teamRows = body.filter(row => row.Components === team && row.Sprint && row.Status !== "Done");
          const total = teamRows.length;
          const ready = teamRows.filter(r =>
            (team === "Engineering - Product" && r.Status === "Ready for Development") ||
            (team !== "Engineering - Product" && ["To Do", "Ready for Development"].includes(r.Status))
          ).length;
          const percent = total ? Math.round((ready / total) * 100) : 0;
          const block = document.createElement("div");
          block.className = "team-section";
          block.innerHTML = `<h3>${team}</h3>
            <img src="${renderStoplight(percent)}" class="stoplight">
            <p>${ready} of ${total} story tickets ready (${percent}%)</p>
            <p>Readiness is based on story tickets in future sprints that are in To Do or Ready for Dev (only Ready for Dev for Eng-Product)</p>`;
          div.appendChild(block);
        });
      }

      if (isBacklog) {
        const div = document.getElementById("backlog-health-content");
        div.innerHTML = "";
        teams.forEach(team => {
          const teamRows = body.filter(row => row.Components === team && (!row.Sprint || !row.Sprint.includes("Sprint")) && row.Status !== "Done");
          const total = teamRows.length;
          const groomed = teamRows.filter(r => ["New", "Grooming"].includes(r.Status)).length;
          const percent = total ? Math.round((groomed / total) * 100) : 0;
          const block = document.createElement("div");
          block.className = "team-section";
          block.innerHTML = `<h3>${team}</h3>
            <img src="${renderStoplight(percent)}" class="stoplight">
            <p>${groomed} of ${total} backlog story tickets are in Grooming/New (${percent}%)</p>
            <p>Healthy backlog includes well-groomed future sprint tickets. Derived from Jira statuses: Grooming, New.</p>`;
          div.appendChild(block);
        });
      }

      if (isDeps) {
        const div = document.getElementById("dependencies-content");
        div.innerHTML = "";
        teams.forEach(team => {
          const teamRows = body.filter(row => row.Components === team);
          const inDeps = teamRows.map(r => r["Inward issue link (Blocks)"]).filter(Boolean);
          const outDeps = teamRows.map(r => r["Outward issue link (Blocks)"]).filter(Boolean);
          const block = document.createElement("div");
          block.className = "team-section";
          block.innerHTML = `<h3>${team}</h3>
            <p>Blocking ${outDeps.length} other tickets</p>
            <p>Blocked by ${inDeps.length} other tickets</p>`;
          div.appendChild(block);
        });
      }
    });
});
