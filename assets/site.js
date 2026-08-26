const catalog = document.querySelector("[data-app-catalog]");

if (catalog) {
  fetch("apps/catalog.json")
    .then((response) => {
      if (!response.ok) throw new Error("Catalog unavailable");
      return response.json();
    })
    .then(({ apps }) => {
      catalog.replaceChildren(
        ...apps.map((app) => {
          const article = document.createElement("article");
          article.className = "app-card";
          const status = document.createElement("span");
          status.className = "status-chip";
          status.textContent = app.status;
          const title = document.createElement("h3");
          title.textContent = app.name;
          const summary = document.createElement("p");
          summary.textContent = app.summary;
          article.append(status, title, summary);
          if (app.path) {
            const link = document.createElement("a");
            link.href = `apps/${app.path}`;
            link.textContent = "Open application";
            link.className = "text-link";
            article.append(link);
          }
          return article;
        })
      );
    })
    .catch(() => {
      catalog.textContent = "The public application catalog is temporarily unavailable.";
    });
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});



