import { Firework } from "./firework.js";

let fireworks: Firework[] = [];
let activeRocketSettings: any = {
    name: "",
    radius: 35,
    color: "#ff0000",
    shape: "circle"
};

window.addEventListener("load", handleLoad);

function handleLoad(): void {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    const resetButton = document.querySelector<HTMLButtonElement>("#resetButton")!;
    const saveButton = document.querySelector<HTMLButtonElement>("#save")!;
    const deleteButton = document.querySelector<HTMLButtonElement>("#delete")!;
    const rocketNameInput = document.querySelector<HTMLInputElement>("#rocketName")!;
    const explosionSizeInput = document.querySelector<HTMLInputElement>("#explosionSize")!;
    const particleColorInput = document.querySelector<HTMLInputElement>("#particleColor")!;
    const explosionShapeInputs = document.querySelectorAll<HTMLInputElement>("input[name='form']");

    particleColorInput.value = activeRocketSettings.color;

    resetButton.addEventListener("click", resetSettings);
    saveButton.addEventListener("click", () => saveRocket(activeRocketSettings));
    deleteButton.addEventListener("click", deleteRocket);
    canvas.addEventListener("click", handleCanvasClick);

    rocketNameInput.addEventListener("input", () => activeRocketSettings.name = rocketNameInput.value);
    explosionSizeInput.addEventListener("input", () => activeRocketSettings.radius = parseInt(explosionSizeInput.value));
    particleColorInput.addEventListener("input", () => {
        activeRocketSettings.color = particleColorInput.value;
        console.log(`Farbe geändert: ${activeRocketSettings.color}`);
    });

    explosionShapeInputs.forEach(input => input.addEventListener("change", () => {
        if (input.checked) {
            activeRocketSettings.shape = input.value;
            console.log(`Form geändert: ${activeRocketSettings.shape}`);
        }
    }));

    loadSavedRockets();
    update();
}

function resetSettings(): void {
    const rocketNameInput = document.querySelector<HTMLInputElement>("#rocketName")!;
    const explosionSizeInput = document.querySelector<HTMLInputElement>("#explosionSize")!;
    const particleColorInput = document.querySelector<HTMLInputElement>("#particleColor")!;
    const explosionShapeInputs = document.querySelectorAll<HTMLInputElement>("input[name='form']");

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

    console.log("Einstellungen zurückgesetzt.");
}

async function saveRocket(rocket: any): Promise<void> {
    if (!rocket.name.trim()) {
        console.warn("Kein Name eingegeben. Rakete wird nicht gespeichert.");
        return;
    }

    try {
        const url = "https://7c8644f9-f81d-49cd-980b-1883574694b6.fr.bw-cloud-instance.org/mro41572/mingidb.php";

        let query: URLSearchParams = new URLSearchParams();
        query.set("command", "insert");
        query.set("collection", "rockets");
        query.set("data", JSON.stringify(rocket));

        await fetch(url + "?" + query.toString(), { method: "GET" });

        console.log(`Rakete gespeichert: ${JSON.stringify(rocket)}`);
        loadSavedRockets();
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
    }
}

async function loadSavedRockets(): Promise<void> {
    try {
        const url = "https://7c8644f9-f81d-49cd-980b-1883574694b6.fr.bw-cloud-instance.org/mro41572/mingidb.php";

        let query: URLSearchParams = new URLSearchParams();
        query.set("command", "find");
        query.set("collection", "rockets");
        query.set("data", "{}");

        let response: Response = await fetch(url + "?" + query.toString());
        let responseText: string = await response.text();
        let data = JSON.parse(responseText);

        if (data.status !== "success" || !data.data) {
            console.warn("Keine gespeicherten Raketen gefunden.");
            return;
        }

        const savingsDiv = document.querySelector<HTMLDivElement>("#savings")!;
        savingsDiv.innerHTML = "";

        Object.entries(data.data).forEach(([id, rocket]: [string, any]) => {
            addRocketButton(rocket);
        });

    } catch (error) {
        console.error("Fehler beim Laden der gespeicherten Raketen:", error);
    }
}

function addRocketButton(rocket: any): void {
    const savingsDiv = document.querySelector<HTMLDivElement>("#savings")!;
    
    const savedButton = document.createElement("button");
    savedButton.textContent = rocket.name;
    savedButton.classList.add("saved-rocket-button");

    savedButton.addEventListener("click", () => {
        loadRocketSettings(rocket);
    });

    savingsDiv.appendChild(savedButton);
}

function loadRocketSettings(rocket: any): void {
    activeRocketSettings = { ...rocket };

    console.log(`Raketenprofil "${rocket.name}" erfolgreich geladen.`);
    console.log(`Geladene Werte:`, activeRocketSettings);

    document.querySelector<HTMLInputElement>("#rocketName")!.value = rocket.name;
    document.querySelector<HTMLInputElement>("#explosionSize")!.value = rocket.radius.toString();
    document.querySelector<HTMLInputElement>("#particleColor")!.value = rocket.color;

    document.querySelectorAll<HTMLInputElement>("input[name='form']").forEach(input => {
        input.checked = input.value === rocket.shape;
    });
}

function handleCanvasClick(event: MouseEvent): void {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    console.log(`Explosion bei (${x}, ${y}) mit Farbe ${activeRocketSettings.color}`);
    fireworks.push(new Firework(x, y, activeRocketSettings.radius, activeRocketSettings.shape, activeRocketSettings.color));
}

function update(): void {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fireworks.forEach(firework => firework.update(ctx));
    requestAnimationFrame(update);
}

async function deleteRocket(): Promise<void> {
    try {
        const url = "https://7c8644f9-f81d-49cd-980b-1883574694b6.fr.bw-cloud-instance.org/mro41572/mingidb.php";

        let query: URLSearchParams = new URLSearchParams();
        query.set("command", "find");
        query.set("collection", "rockets");
        query.set("data", "{}");

        let response: Response = await fetch(url + "?" + query.toString());
        let responseText: string = await response.text();
        let data = JSON.parse(responseText);

        if (data.status !== "success" || !data.data) {
            console.warn("Keine gespeicherten Raketen gefunden.");
            return;
        }

        const savingsDiv = document.querySelector<HTMLDivElement>("#savings")!;
        const lastButton = savingsDiv.lastChild as HTMLButtonElement;
        if (!lastButton) {
            console.warn("Kein gespeicherter Raketen-Button gefunden.");
            return;
        }

        let rocketId: string | null = null;
        Object.entries(data.data).forEach(([id, rocket]: [string, any]) => {
            if (rocket.name === lastButton.textContent) rocketId = id;
        });

        if (!rocketId) {
            console.warn("Keine passende Rakete in der Datenbank gefunden.");
            return;
        }

        let deleteQuery: URLSearchParams = new URLSearchParams();
        deleteQuery.set("command", "delete");
        deleteQuery.set("collection", "rockets");
        deleteQuery.set("id", rocketId);

        await fetch(url + "?" + deleteQuery.toString(), { method: "GET" });

        console.log(`Rakete "${lastButton.textContent}" erfolgreich gelöscht.`);

        savingsDiv.removeChild(lastButton);

        loadSavedRockets();
    } catch (error) {
        console.error("Fehler beim Löschen der Rakete:", error);
    }
}
