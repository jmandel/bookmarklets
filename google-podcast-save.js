javascript:(function() {
    function findNearestParentWithAttribute(node, attr) {
        while (node) {
            if (node.getAttribute(attr) !== null) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }
    function updateOrAddEpisode(episodes, newEpisode) {
        const index = episodes.findIndex(ep => ep.episodeUrl === newEpisode.episodeUrl);
        if (index >= 0) {
            episodes[index] = newEpisode;
        } else {
            episodes.push(newEpisode);
        }
    }
    function downloadJSON(data, filename) {
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    let storedEpisodes = JSON.parse(localStorage.getItem("episodes")) || [];
    const feedTitle = document.querySelector("div[data-title]") ? document.querySelector("div[data-title]").getAttribute("data-title") : "Unknown";

    const spans = document.querySelectorAll("div[aria-role=\"button\"] span");
    spans.forEach(span => {
        const text = span.innerText.toLowerCase();
        let status, minLeft;
        if (text.includes("completed")) {
            status = "completed";
            minLeft = 0;
        } else if (text.includes("min left")) {
            status = "partial";
            const match = text.match(/\d+/);
            minLeft = match ? parseInt(match[0], 10) : null;
        } else {
            status = "unplayed";
        }
        const parentWithJsData = findNearestParentWithAttribute(span, "jsdata");
        if (parentWithJsData) {
            const jsDataValue = parentWithJsData.getAttribute("jsdata");
            const urlParts = jsDataValue.split(";");
            if (urlParts.length === 3) {
                const url = urlParts[1];

                let feedUrl = "", episodeGuid = "";
                const siblingDiv = parentWithJsData.nextElementSibling;
                if (siblingDiv && siblingDiv.firstElementChild) {
                    feedUrl = siblingDiv.firstElementChild.getAttribute("data-feed");
                    episodeGuid = siblingDiv.firstElementChild.getAttribute("data-guid");
                }

                let episode = {
                    feedTitle: feedTitle,
                    feedUrl: feedUrl,
                    episodeUrl: url,
                    episodeGuid: episodeGuid,
                    episodeStatus: status,
                };
                if (status !== "unplayed") {
                    episode.minLeft = minLeft;
                }
                console.log(episode);
                updateOrAddEpisode(storedEpisodes, episode);
            }
        }
    });
    localStorage.setItem("episodes", JSON.stringify(storedEpisodes));
    window.casts = storedEpisodes;
    if (confirm("Do you want to download the episodes data as JSON file?")) {
        downloadJSON(JSON.stringify(storedEpisodes, null, 4), "episodes.json");
    }
})()
