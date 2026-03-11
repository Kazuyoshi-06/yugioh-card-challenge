const API_BASE = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
const SESSION_CACHE_KEY = "ygo-card-challenge-cache-v1";
const API_TIMEOUT_MS = 10000;
const API_MAX_RETRIES = 2;
const API_RETRY_DELAY_MS = 600;
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const categories = [
    {
        id: "deck",
        manualTitle: "Favorite Deck",
        randomTitle: "Favorite Boss Monster",
        color: "from-purple-500 to-indigo-500",
        filterKey: "boss"
    },
    {
        id: "vanilla",
        manualTitle: "Normal Monster",
        randomTitle: "Normal Monster",
        color: "from-amber-100 to-yellow-400",
        filterKey: "vanilla"
    },
    {
        id: "effect",
        manualTitle: "Effect Monster",
        randomTitle: "Effect Monster",
        color: "from-orange-400 to-red-500",
        filterKey: "effect"
    },
    {
        id: "ritual",
        manualTitle: "Ritual Monster",
        randomTitle: "Ritual Monster",
        color: "from-blue-400 to-cyan-400",
        filterKey: "ritual"
    },
    {
        id: "fusion",
        manualTitle: "Fusion Monster",
        randomTitle: "Fusion Monster",
        color: "from-purple-600 to-fuchsia-600",
        filterKey: "fusion"
    },
    {
        id: "synchro",
        manualTitle: "Synchro Monster",
        randomTitle: "Synchro Monster",
        color: "from-slate-100 to-gray-400",
        filterKey: "synchro"
    },
    {
        id: "xyz",
        manualTitle: "Xyz Monster",
        randomTitle: "Xyz Monster",
        color: "from-gray-700 to-black",
        filterKey: "xyz"
    },
    {
        id: "pendulum",
        manualTitle: "Pendulum Monster",
        randomTitle: "Pendulum Monster",
        color: "from-emerald-400 to-teal-500",
        filterKey: "pendulum"
    },
    {
        id: "link",
        manualTitle: "Link Monster",
        randomTitle: "Link Monster",
        color: "from-blue-600 to-blue-800",
        filterKey: "link"
    }
];

const typeGroups = {
    boss: [
        "Normal Monster",
        "Normal Tuner Monster",
        "Effect Monster",
        "Flip Effect Monster",
        "Gemini Monster",
        "Spirit Monster",
        "Toon Monster",
        "Tuner Monster",
        "Union Effect Monster",
        "Ritual Monster",
        "Ritual Effect Monster",
        "Fusion Monster",
        "Pendulum Effect Fusion Monster",
        "Synchro Monster",
        "Synchro Tuner Monster",
        "Synchro Pendulum Effect Monster",
        "XYZ Monster",
        "XYZ Pendulum Effect Monster",
        "Pendulum Effect Monster",
        "Pendulum Normal Monster",
        "Pendulum Effect Ritual Monster",
        "Pendulum Flip Effect Monster",
        "Pendulum Tuner Effect Monster",
        "Link Monster"
    ],
    vanilla: [
        "Normal Monster",
        "Normal Tuner Monster",
        "Pendulum Normal Monster"
    ],
    effect: [
        "Effect Monster",
        "Flip Effect Monster",
        "Gemini Monster",
        "Spirit Monster",
        "Toon Monster",
        "Tuner Monster",
        "Union Effect Monster"
    ],
    ritual: [
        "Ritual Monster",
        "Ritual Effect Monster",
        "Pendulum Effect Ritual Monster"
    ],
    fusion: [
        "Fusion Monster",
        "Pendulum Effect Fusion Monster"
    ],
    synchro: [
        "Synchro Monster",
        "Synchro Tuner Monster",
        "Synchro Pendulum Effect Monster"
    ],
    xyz: [
        "XYZ Monster",
        "XYZ Pendulum Effect Monster"
    ],
    pendulum: [
        "Pendulum Effect Monster",
        "Pendulum Normal Monster",
        "Pendulum Effect Ritual Monster",
        "Pendulum Flip Effect Monster",
        "Pendulum Tuner Effect Monster",
        "Pendulum Effect Fusion Monster",
        "Synchro Pendulum Effect Monster",
        "XYZ Pendulum Effect Monster"
    ],
    link: [
        "Link Monster"
    ]
};

let currentMode = "manual";
let categoryPools = {};
let isLoadingPools = false;
let isRandomizing = false;
let isExportingImage = false;
let hasShownImageLoadWarning = false;

const gridContainer = document.getElementById("card-grid");
const statusBanner = document.getElementById("status-banner");

function buildGrid() {
    categories.forEach(cat => {
        const cardHTML = `
            <div class="flex flex-col items-center group relative">
                <div class="section-badge relative z-10 -mb-4 border border-slate-700/70 px-6 py-2 rounded-full">
                    <h2
                        id="label-${cat.id}"
                        class="gradient-text gradient-text-light font-title font-bold text-sm md:text-base bg-gradient-to-r ${cat.color} tracking-wider uppercase text-center"
                    >
                        ${cat.manualTitle}
                    </h2>
                </div>

                <label
                    id="slot-${cat.id}"
                    for="upload-${cat.id}"
                    role="button"
                    tabindex="0"
                    aria-label="Upload image for ${cat.manualTitle}"
                    class="card-shell w-full relative aspect-card rounded-2xl border-2 border-slate-700/50 glow-border cursor-pointer flex flex-col items-center justify-center overflow-hidden z-0"
                >
                    <input
                        type="file"
                        id="upload-${cat.id}"
                        accept="image/*"
                        class="visually-hidden-file"
                        data-category-id="${cat.id}"
                    >

                    <div id="placeholder-${cat.id}" class="flex flex-col items-center justify-center text-slate-500 group-hover:text-blue-300 transition-colors p-6 text-center">
                        <div class="placeholder-icon-ring rounded-full p-2 mb-3">
                            <i data-lucide="plus-circle" class="w-12 h-12 opacity-50 group-hover:opacity-100 transition-opacity"></i>
                        </div>
                        <span class="text-sm font-medium">Click to add an image</span>
                    </div>

                    <img
                        id="img-${cat.id}"
                        src=""
                        alt="${cat.manualTitle}"
                        class="card-image absolute inset-0 w-full h-full object-cover hidden rounded-xl p-1"
                        crossorigin="anonymous"
                    />

                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="bg-slate-900/90 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-slate-700 flex items-center gap-2">
                            <i data-lucide="image" class="w-4 h-4"></i> Edit
                        </span>
                    </div>
                </label>
            </div>
        `;
        gridContainer.insertAdjacentHTML("beforeend", cardHTML);
    });

    refreshIcons();
}

function refreshIcons() {
    lucide.createIcons();
}

function initEventListeners() {
    const downloadBtn = document.getElementById("download-btn");
    const randomizeBtn = document.getElementById("randomize-btn");
    const resetBtn = document.getElementById("reset-btn");

    if (downloadBtn) {
        downloadBtn.addEventListener("click", downloadImage);
    }

    if (randomizeBtn) {
        randomizeBtn.addEventListener("click", randomizeCards);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", resetAll);
    }

    categories.forEach(cat => {
        const input = document.getElementById(`upload-${cat.id}`);
        const slot = document.getElementById(`slot-${cat.id}`);
        const img = document.getElementById(`img-${cat.id}`);

        if (!input) return;
        input.addEventListener("change", event => previewImage(event, cat.id));

        if (slot) {
            slot.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    input.click();
                }
            });
        }

        if (img) {
            img.addEventListener("error", () => {
                let fallbackUrls = [];

                try {
                    fallbackUrls = JSON.parse(img.dataset.fallbackUrls || "[]");
                } catch {
                    fallbackUrls = [];
                }

                if (fallbackUrls.length > 0) {
                    const [nextUrl, ...remaining] = fallbackUrls;
                    img.dataset.fallbackUrls = JSON.stringify(remaining);
                    img.src = nextUrl;
                    return;
                }

                if (!hasShownImageLoadWarning) {
                    showStatus("Some remote card images could not be loaded. Try Duel Roulette again.", "warning");
                    hasShownImageLoadWarning = true;
                }
            });
        }
    });
}

function setActionButtonsDisabled(disabled) {
    const downloadBtn = document.getElementById("download-btn");
    const randomizeBtn = document.getElementById("randomize-btn");
    const resetBtn = document.getElementById("reset-btn");
    const buttons = [downloadBtn, randomizeBtn, resetBtn].filter(Boolean);

    buttons.forEach(button => {
        button.disabled = disabled;
        button.setAttribute("aria-busy", String(disabled));
    });
}

function validateUploadFile(file) {
    if (!file) {
        return { valid: false, message: "No file selected." };
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            message: "Unsupported format. Please use JPG, PNG, or WEBP."
        };
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return {
            valid: false,
            message: "Image is too large. Maximum size is 5 MB."
        };
    }

    return { valid: true };
}

function normalizeExternalImageUrl(url) {
    if (typeof url !== "string") return null;

    const trimmed = url.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("http://")) {
        return `https://${trimmed.slice(7)}`;
    }

    if (trimmed.startsWith("//")) {
        return `https:${trimmed}`;
    }

    return trimmed;
}

function getCardImageCandidates(card) {
    if (!card || !Array.isArray(card.card_images)) return [];

    const candidates = [];

    card.card_images.forEach(imageSet => {
        ["image_url", "image_url_small", "image_url_cropped"].forEach(key => {
            const normalized = normalizeExternalImageUrl(imageSet?.[key]);
            if (normalized && !candidates.includes(normalized)) {
                candidates.push(normalized);
            }
        });
    });

    return candidates;
}

function setImageSourceWithFallback(imgElement, urls) {
    if (!imgElement || !Array.isArray(urls) || !urls.length) return false;

    imgElement.dataset.fallbackUrls = JSON.stringify(urls.slice(1));
    imgElement.src = urls[0];
    return true;
}

function showStatus(message, kind = "info") {
    statusBanner.className = "mb-8 rounded-2xl border bg-slate-900/70 px-4 py-3 text-center text-sm";
    statusBanner.classList.remove("hidden", "status-success", "status-warning", "status-error", "status-info");
    statusBanner.classList.add(`status-${kind}`);
    statusBanner.textContent = message;
}

function hideStatus() {
    statusBanner.classList.add("hidden");
    statusBanner.textContent = "";
}

function setMode(mode) {
    currentMode = mode;

    categories.forEach(cat => {
        const label = document.getElementById(`label-${cat.id}`);
        if (!label) return;

        label.textContent = mode === "random" ? cat.randomTitle : cat.manualTitle;
    });
}

function previewImage(event, categoryId) {
    const input = event.target;

    if (!input.files || !input.files[0]) return;

    const selectedFile = input.files[0];
    const validation = validateUploadFile(selectedFile);

    if (!validation.valid) {
        input.value = "";
        showStatus(validation.message, "warning");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const imgElement = document.getElementById(`img-${categoryId}`);
        const placeholderElement = document.getElementById(`placeholder-${categoryId}`);

        imgElement.dataset.fallbackUrls = "[]";
        imgElement.src = e.target.result;
        imgElement.classList.remove("hidden");
        placeholderElement.classList.add("hidden");
    };

    if (categoryId === "deck") {
        setMode("manual");
    }

    reader.onerror = function () {
        input.value = "";
        showStatus("Could not read this image. Please try another file.", "error");
    };

    reader.readAsDataURL(selectedFile);
}

function getSessionCache() {
    try {
        const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveSessionCache() {
    try {
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(categoryPools));
    } catch {
        // ignore storage errors
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => {
        clearTimeout(timeoutId);
    });
}

function isRetriableApiError(error) {
    if (!error) return false;
    if (error.name === "AbortError") return true;
    if (error.name === "TypeError") return true;
    if (typeof error.status === "number") {
        return error.status === 429 || error.status >= 500;
    }
    return false;
}

async function fetchWithRetry(requestFn, retries = API_MAX_RETRIES, retryDelayMs = API_RETRY_DELAY_MS) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;

            if (attempt === retries || !isRetriableApiError(error)) {
                throw error;
            }

            await sleep(retryDelayMs * (attempt + 1));
        }
    }

    throw lastError;
}

function getApiErrorMessage(error) {
    if (!error) {
        return "Could not load YGOPRODeck data. Please try again.";
    }

    if (error.name === "AbortError") {
        return "YGOPRODeck is taking too long to respond. Please try again.";
    }

    if (error.name === "TypeError") {
        return "Network error while contacting YGOPRODeck. Check your connection and retry.";
    }

    if (error.code === "INVALID_API_RESPONSE") {
        return "Received an invalid response from YGOPRODeck. Please try again.";
    }

    if (error.status === 429) {
        return "YGOPRODeck rate limit reached. Please wait a moment and try again.";
    }

    if (typeof error.status === "number") {
        return `YGOPRODeck returned an error (${error.status}). Please try again.`;
    }

    return "Could not load YGOPRODeck data. Please try again.";
}

function hasValidCache() {
    return categories.every(cat => Array.isArray(categoryPools[cat.filterKey]) && categoryPools[cat.filterKey].length > 0);
}

async function fetchCardsByTypes(types) {
    const url = new URL(API_BASE);
    url.searchParams.set("type", types.join(","));

    const response = await fetchWithRetry(() => fetchWithTimeout(url.toString(), {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    }));

    if (!response.ok) {
        const error = new Error(`API request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const json = await response.json();

    if (!json.data || !Array.isArray(json.data)) {
        const error = new Error("Invalid API response.");
        error.code = "INVALID_API_RESPONSE";
        throw error;
    }

    return json.data.filter(card =>
        card &&
        typeof card.id !== "undefined" &&
        typeof card.type === "string" &&
        Array.isArray(card.card_images) &&
        card.card_images.length > 0 &&
        card.card_images[0].image_url
    );
}

async function loadCategoryPools() {
    if (isLoadingPools) return;
    if (hasValidCache()) return;

    isLoadingPools = true;
    showStatus("Summoning random card pools from YGOPRODeck...", "info");

    try {
        const cached = getSessionCache();
        categoryPools = { ...cached };

        const missingCategories = categories.filter(cat => !Array.isArray(categoryPools[cat.filterKey]) || categoryPools[cat.filterKey].length === 0);

        if (!missingCategories.length) {
            showStatus("Random pools loaded from session cache.", "success");
            setTimeout(hideStatus, 2200);
            return;
        }

        const results = await Promise.allSettled(
            missingCategories.map(cat => fetchCardsByTypes(typeGroups[cat.filterKey]))
        );

        const failedCategories = [];
        let fetchedPoolsCount = 0;

        results.forEach((result, index) => {
            const cat = missingCategories[index];

            if (result.status === "fulfilled") {
                categoryPools[cat.filterKey] = result.value;
                fetchedPoolsCount += 1;
                return;
            }

            failedCategories.push(cat);
            console.error(`Failed to load pool for ${cat.id}:`, result.reason);
        });

        if (fetchedPoolsCount > 0) {
            saveSessionCache();
        }

        if (!failedCategories.length) {
            showStatus("Random pools loaded. Duel Roulette is ready.", "success");
            setTimeout(hideStatus, 2200);
            return;
        }

        const availableCategoryCount = categories.filter(cat =>
            Array.isArray(categoryPools[cat.filterKey]) && categoryPools[cat.filterKey].length > 0
        ).length;

        if (availableCategoryCount > 0) {
            const failedNames = failedCategories.map(cat => cat.randomTitle).join(", ");
            showStatus(
                `Some categories could not be loaded (${failedNames}). Duel Roulette will use available pools.`,
                "warning"
            );
            setTimeout(hideStatus, 4000);
            return;
        }

        throw new Error("No category pool could be loaded.");
    } catch (error) {
        console.error("Failed to load YGOPRODeck pools:", error);
        showStatus(getApiErrorMessage(error), "error");
        throw error;
    } finally {
        isLoadingPools = false;
    }
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getUniqueRandomCard(pool, usedIds) {
    const available = pool.filter(card => !usedIds.has(card.id));
    if (!available.length) return null;
    const chosen = getRandomItem(available);
    usedIds.add(chosen.id);
    return chosen;
}

function applyCardToSlot(categoryId, card) {
    const imgElement = document.getElementById(`img-${categoryId}`);
    const placeholderElement = document.getElementById(`placeholder-${categoryId}`);
    const input = document.getElementById(`upload-${categoryId}`);
    const imageCandidates = getCardImageCandidates(card);

    if (!imageCandidates.length) {
        imgElement.src = "";
        imgElement.alt = card?.name || "Card image unavailable";
        imgElement.classList.add("hidden");
        placeholderElement.classList.remove("hidden");
        return;
    }

    setImageSourceWithFallback(imgElement, imageCandidates);
    imgElement.alt = card.name;
    imgElement.classList.remove("hidden");
    placeholderElement.classList.add("hidden");
    input.value = "";
}

async function randomizeCards() {
    if (isRandomizing || isExportingImage) return;

    isRandomizing = true;
    hasShownImageLoadWarning = false;
    const button = document.getElementById("randomize-btn");
    const originalText = button.innerHTML;

    try {
        setActionButtonsDisabled(true);
        button.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Rolling...';
        refreshIcons();

        await loadCategoryPools();

        const usedIds = new Set();

        categories.forEach(cat => {
            const pool = categoryPools[cat.filterKey] || [];
            const card = getUniqueRandomCard(pool, usedIds);
            if (!card) return;
            applyCardToSlot(cat.id, card);
        });

        setMode("random");
        showStatus("Duel Roulette complete. The boss monster slot is now active.", "success");
        setTimeout(hideStatus, 2400);
    } catch (error) {
        console.error(error);
    } finally {
        isRandomizing = false;
        setActionButtonsDisabled(false);
        button.innerHTML = originalText;
        refreshIcons();
    }
}

async function waitForVisibleImages(container) {
    const images = Array.from(container.querySelectorAll("img"))
        .filter(img => img.src && !img.classList.contains("hidden"));

    await Promise.all(
        images.map(img => {
            if (img.complete && img.naturalWidth > 0) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                const done = () => resolve();
                img.onload = done;
                img.onerror = done;
            });
        })
    );
}

async function downloadImage() {
    if (isExportingImage || isRandomizing) return;

    isExportingImage = true;
    const element = document.getElementById("capture-area");
    const button = document.getElementById("download-btn");
    const originalText = button.innerHTML;

    try {
        setActionButtonsDisabled(true);
        button.innerHTML = '<i data-lucide="loader" class="animate-spin"></i> Generating...';
        refreshIcons();

        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        await waitForVisibleImages(element);

        element.classList.add("exporting");

        await new Promise(resolve => setTimeout(resolve, 120));

        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: "#020617",
            useCORS: true,
            logging: false,
            foreignObjectRendering: false
        });

        element.classList.remove("exporting");

        const link = document.createElement("a");
        link.download = "My-Favorite-YGO-Cards.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        button.innerHTML = originalText;
        refreshIcons();
    } catch (error) {
        element.classList.remove("exporting");
        console.error("Error during capture:", error);
        alert("An error occurred while generating the image.");
    } finally {
        isExportingImage = false;
        setActionButtonsDisabled(false);
        button.innerHTML = originalText;
        refreshIcons();
    }
}

function resetAll() {
    if (!confirm("Do you really want to remove all your cards?")) {
        return;
    }

    categories.forEach(cat => {
        const imgElement = document.getElementById(`img-${cat.id}`);
        const placeholderElement = document.getElementById(`placeholder-${cat.id}`);
        const input = document.getElementById(`upload-${cat.id}`);

        imgElement.src = "";
        imgElement.alt = cat.manualTitle;
        imgElement.classList.add("hidden");
        placeholderElement.classList.remove("hidden");
        input.value = "";
    });

    hasShownImageLoadWarning = false;
    setMode("manual");
    hideStatus();
}

buildGrid();
setMode("manual");
refreshIcons();
initEventListeners();
