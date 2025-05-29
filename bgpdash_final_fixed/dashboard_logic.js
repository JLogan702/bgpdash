
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const sprint = path.includes("sprint");
  const backlog = path.includes("backlog");
  const deps = path.includes("dependencies");
  const summary = path.includes("index");

  fetch("jira_data.csv")
    .then(res => res.text())
    .then(data => {
      const rows = data.trim().split("\n");
      const headers = rows[0].split(",");
      const json = rows.slice(1).map(row => {
        const values = row.split(",");
        return headers.reduce((acc, h, i) => ({...acc, [h]: values[i]}), {});
      });

      console.log("✅ Loaded CSV:", json.length, "rows");
      if (summary) document.getElementById("summary-status").textContent = `${json.length} story tickets loaded.`;
      if (sprint) document.getElementById("sprint-readiness-content").textContent = `${json.length} rows loaded for Sprint Readiness.`;
      if (backlog) document.getElementById("backlog-health-content").textContent = `${json.length} rows loaded for Backlog Health.`;
      if (deps) document.getElementById("dependencies-content").textContent = `${json.length} rows loaded for Dependencies.`;
    })
    .catch(err => {
      console.error("❌ CSV load error:", err);
      document.getElementById("summary-status").textContent = "⚠️ Failed to load jira_data.csv";
    });
});
