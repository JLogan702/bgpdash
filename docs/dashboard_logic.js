
document.addEventListener('DOMContentLoaded', function () {
  Papa.parse("jira_data.csv", {
    download: true,
    header: true,
    complete: function(results) {
      console.log("CSV Loaded:", results.data);
      // Example logic to populate readiness or backlog sections
      document.getElementById("readinessContent")?.insertAdjacentHTML("beforeend", "<p>Parsed " + results.data.length + " story tickets for readiness.</p>");
      document.getElementById("backlogContent")?.insertAdjacentHTML("beforeend", "<p>Parsed " + results.data.length + " story tickets for backlog health.</p>");
      document.getElementById("dependencyContent")?.insertAdjacentHTML("beforeend", "<p>Dependencies will be calculated here.</p>");
    }
  });
});
