const AppList = document.getElementById("app-list-scroll");
const PreviewTitle = document.getElementById("preview-title");
const PreviewFrame = document.getElementById("preview-frame");
const openAppsFolder = document.getElementById("open-apps-folder");

openAppsFolder.addEventListener("click", () => {
    window.plexy.openAppsFolder();
});

async function init() {
    const apps = await window.plexy.getApps();
    if (!apps.length) {
        AppList.innerHTML = "<div class='app-item'>No Apps Found...</div>";
        return;
    }

    apps.forEach(app => {
        const item = document.createElement("div");
        item.className = "app-item";
        item.textContent = app.name;

        item.addEventListener("click", () => {
            selectApp(app, item);
        });

        AppList.appendChild(item);
    });
}

function selectApp(app, item) {
    document.querySelectorAll(".app-item").forEach(el => el.classList.remove("active"));

    item.classList.add("active");
    PreviewTitle = app.name;
    PreviewFrame = `file://${app.previewPath}`;
}

init();

window.plexy.onAppsUpdated(() => {
    init()
});