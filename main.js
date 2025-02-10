import { Firework } from "./firework.js";
let fireworks = [];
let activeRocketSettings = {
    name: "",
    radius: 35,
    color: "#ff0000",
    shape: "circle"
};
window.addEventListener("load", handleLoad);
function handleLoad() {
    const canvas = document.querySelector("#canvas");
    const resetButton = document.querySelector("#resetButton");
    const saveButton = document.querySelector("#save");
    const deleteButton = document.querySelector("#delete");
    const rocketNameInput = document.querySelector("#rocketName");
    const explosionSizeInput = document.querySelector("#explosionSize");
    const particleColorInput = document.querySelector("#particleColor");
    const explosionShapeInputs = document.querySelectorAll("input[name='form']");
    particleColorInput.value = activeRocketSettings.color;
    resetButton.addEventListener("click", resetSettings);
    saveButton.addEventListener("click", () => saveRocket(activeRocketSettings));
    deleteButton.addEventListener("click", deleteRocket);
    canvas.addEventListener("click", handleCanvasClick);
    rocketNameInput.addEventListener("input", () => activeRocketSettings.name = rocketNameInput.value);
    explosionSizeInput.addEventListener("input", () => activeRocketSettings.radius = parseInt(explosionSizeInput.value));
    particleColorInput.addEventListener("input", () => {
        activeRocketSettings.color = particleColorInput.value;
        console.log(`🎨 Farbe geändert: ${activeRocketSettings.color}`);
    });
    explosionShapeInputs.forEach(input => input.addEventListener("change", () => {
        if (input.checked) {
            activeRocketSettings.shape = input.value;
            console.log(`🔺 Form geändert: ${activeRocketSettings.shape}`);
        }
    }));
    loadSavedRockets();
    update();
}
function resetSettings() {
    const rocketNameInput = document.querySelector("#rocketName");
    const explosionSizeInput = document.querySelector("#explosionSize");
    const particleColorInput = document.querySelector("#particleColor");
    const explosionShapeInputs = document.querySelectorAll("input[name='form']");
    activeRocketSettings = {
        name: "",
        radius: 35,
        color: "#ff0000",
        shape: "circle"
    };
    rocketNameInput.value = "";
    explosionSizeInput.value = "35";
    particleColorInput.value = "#ff0000";
    explosionShapeInputs[0].checked = true;
    console.log("🟢 Einstellungen zurückgesetzt.");
}
async function saveRocket(rocket) {
    if (!rocket.name.trim()) {
        console.warn("⚠️ Kein Name eingegeben. Rakete wird nicht gespeichert.");
        return;
    }
    try {
        const url = "https://7c8644f9-f81d-49cd-980b-1883574694b6.fr.bw-cloud-instance.org/mro41572/mingidb.php";
        let query = new URLSearchParams();
        query.set("command", "insert");
        query.set("collection", "rockets");
        query.set("data", JSON.stringify(rocket));
        await fetch(url + "?" + query.toString(), { method: "GET" });
        console.log(`💾 Rakete gespeichert: ${JSON.stringify(rocket)}`);
        loadSavedRockets();
    }
    catch (error) {
        console.error("❌ Fehler beim Speichern:", error);
    }
}
async function loadSavedRockets() {
    try {
        const url = "https://7c8644f9-f81d-49cd-980b-1883574694b6.fr.bw-cloud-instance.org/mro41572/mingidb.php";
        let query = new URLSearchParams();
        query.set("command", "find");
        query.set("collection", "rockets");
        query.set("data", "{}");
        let response = await fetch(url + "?" + query.toString());
        let responseText = await response.text();
        let data = JSON.parse(responseText);
        if (data.status !== "success" || !data.data) {
            console.warn("⚠️ Keine gespeicherten Raketen gefunden.");
            return;
        }
        const savingsDiv = document.querySelector("#savings");
        savingsDiv.innerHTML = "";
        Object.entries(data.data).forEach(([id, rocket]) => {
            addRocketButton(rocket);
        });
    }
    catch (error) {
        console.error("❌ Fehler beim Laden der gespeicherten Raketen:", error);
    }
}
function addRocketButton(rocket) {
    const savingsDiv = document.querySelector("#savings");
    const savedButton = document.createElement("button");
    savedButton.textContent = rocket.name;
    savedButton.classList.add("saved-rocket-button");
    savedButton.addEventListener("click", () => {
        loadRocketSettings(rocket);
    });
    savingsDiv.appendChild(savedButton);
}
function loadRocketSettings(rocket) {
    activeRocketSettings = { ...rocket };
    console.log(`🎆 Raketenprofil "${rocket.name}" erfolgreich geladen.`);
    console.log(`🚀 Geladene Werte:`, activeRocketSettings);
    document.querySelector("#rocketName").value = rocket.name;
    document.querySelector("#explosionSize").value = rocket.radius.toString();
    document.querySelector("#particleColor").value = rocket.color;
    document.querySelectorAll("input[name='form']").forEach(input => {
        input.checked = input.value === rocket.shape;
    });
}
function handleCanvasClick(event) {
    const canvas = document.querySelector("#canvas");
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    console.log(`🔥 Explosion bei (${x}, ${y}) mit Farbe ${activeRocketSettings.color}`);
    fireworks.push(new Firework(x, y, activeRocketSettings.radius, activeRocketSettings.shape, activeRocketSettings.color));
}
function update() {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks.forEach(firework => firework.update(ctx));
    requestAnimationFrame(update);
}
async function deleteRocket() {
    try {
        const url = "https://7c8644f9-f81d-49cd-980b-1883574694b6.fr.bw-cloud-instance.org/mro41572/mingidb.php";
        // 🔍 Datenbank nach gespeicherten Raketen durchsuchen
        let query = new URLSearchParams();
        query.set("command", "find");
        query.set("collection", "rockets");
        query.set("data", "{}");
        let response = await fetch(url + "?" + query.toString());
        let responseText = await response.text();
        let data = JSON.parse(responseText);
        if (data.status !== "success" || !data.data) {
            console.warn("⚠️ Keine gespeicherten Raketen gefunden.");
            return;
        }
        // 🔍 Den letzten gespeicherten Raketen-Button identifizieren
        const savingsDiv = document.querySelector("#savings");
        const lastButton = savingsDiv.lastChild;
        if (!lastButton) {
            console.warn("⚠️ Kein gespeicherter Raketen-Button gefunden.");
            return;
        }
        let rocketId = null;
        Object.entries(data.data).forEach(([id, rocket]) => {
            if (rocket.name === lastButton.textContent)
                rocketId = id;
        });
        if (!rocketId) {
            console.warn("⚠️ Keine passende Rakete in der Datenbank gefunden.");
            return;
        }
        // 🗑️ Rakete aus der Datenbank löschen
        let deleteQuery = new URLSearchParams();
        deleteQuery.set("command", "delete");
        deleteQuery.set("collection", "rockets");
        deleteQuery.set("id", rocketId);
        await fetch(url + "?" + deleteQuery.toString(), { method: "GET" });
        console.log(`✅ Rakete "${lastButton.textContent}" erfolgreich gelöscht.`);
        // 🗑️ Rakete aus der UI entfernen
        savingsDiv.removeChild(lastButton);
        // 🔄 Gespeicherte Raketen neu laden
        loadSavedRockets();
    }
    catch (error) {
        console.error("❌ Fehler beim Löschen der Rakete:", error);
    }
}
//# sourceMappingURL=main.js.map