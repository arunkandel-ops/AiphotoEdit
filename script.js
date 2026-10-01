document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-input");
    const uploadLabel = document.getElementById("upload-label");
    const presetList = document.getElementById("preset-list");
    const presetSearch = document.getElementById("preset-search");
    const demoGrid = document.getElementById("demo-grid");
    const dropZone = document.getElementById("drop-zone");
    const compareSlider = document.getElementById("compare-slider");
    const editedLayer = document.getElementById("edited-layer");
    const originalPreview = document.getElementById("original-preview");
    const editedPreview = document.getElementById("edited-preview");
    const statImage = document.getElementById("stat-image");
    const statStyle = document.getElementById("stat-style");
    const resetFiltersBtn = document.getElementById("reset-filters");
    const randomizePresetBtn = document.getElementById("randomize-preset");
    const downloadSelectedBtn = document.getElementById("download-selected");

    const defaultAdjustments = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        warmth: 0,
        sepia: 0,
        grayscale: 0,
        blur: 0,
        hue: 0
    };

    let loadedImageSrc = "";
    let presets = [];
    let activePresetId = null;
    let currentAdjustments = { ...defaultAdjustments };
    let favorites = new Set();

    const controlMap = {
        brightness: document.getElementById("brightness"),
        contrast: document.getElementById("contrast"),
        saturation: document.getElementById("saturation"),
        warmth: document.getElementById("warmth"),
        sepia: document.getElementById("sepia"),
        grayscale: document.getElementById("grayscale"),
        blur: document.getElementById("blur"),
        hue: document.getElementById("hue")
    };

    function setDropZoneState(isActive) {
        if (!dropZone) return;
        dropZone.classList.toggle("dragover", isActive);
    }

    function getActivePreset() {
        return presets.find((preset) => preset.id === activePresetId) || presets[0] || null;
    }

    function buildFilterString(customPreset = "") {
        const brightness = currentAdjustments.brightness;
        const contrast = currentAdjustments.contrast;
        const saturation = currentAdjustments.saturation;
        const sepia = currentAdjustments.sepia;
        const grayscale = currentAdjustments.grayscale;
        const blur = currentAdjustments.blur;
        const warmthHue = currentAdjustments.warmth * 0.7;
        const hue = currentAdjustments.hue + warmthHue;

        const filters = [
            customPreset,
            `brightness(${brightness}%)`,
            `contrast(${contrast}%)`,
            `saturate(${saturation}%)`,
            `sepia(${sepia}%)`,
            `grayscale(${grayscale}%)`,
            `blur(${blur}px)`,
            `hue-rotate(${hue}deg)`
        ].filter(Boolean);

        return filters.join(" ");
    }

    function syncAdjustmentControls() {
        Object.entries(controlMap).forEach(([key, input]) => {
            if (input) {
                input.value = currentAdjustments[key];
            }
        });
    }

    function syncPreview() {
        if (!loadedImageSrc) {
            return;
        }

        const preset = getActivePreset();
        const baseFilter = preset ? preset.filter : "";
        const finalFilter = buildFilterString(baseFilter);

        if (editedPreview) {
            editedPreview.src = loadedImageSrc;
            editedPreview.style.filter = finalFilter;
        }

        if (originalPreview) {
            originalPreview.src = loadedImageSrc;
            originalPreview.style.filter = "none";
        }

        if (statStyle) {
            statStyle.textContent = preset ? preset.title : "Classic";
        }

        if (compareSlider && editedLayer) {
            const position = Number(compareSlider.value);
            editedLayer.style.clipPath = `inset(0 0 0 ${position}%)`;
        }
    }

    function renderPresetButtons() {
        if (!presetList) return;

        const query = (presetSearch?.value || "").trim().toLowerCase();
        const filtered = presets.filter((preset) => {
            if (!query) return true;
            const haystack = `${preset.title} ${preset.description} ${preset.category}`.toLowerCase();
            return haystack.includes(query);
        });

        presetList.innerHTML = "";

        if (filtered.length === 0) {
            presetList.innerHTML = '<p class="empty-search">No matching styles found.</p>';
            return;
        }

        filtered.forEach((preset) => {
            const btn = document.createElement("button");
            btn.className = `preset-btn ${activePresetId === preset.id ? "active" : ""}`;
            btn.type = "button";
            btn.innerHTML = `
                <div class="preset-topline">
                    <div>
                        <h4>${preset.title}</h4>
                        <span class="category-tag">${preset.category}</span>
                    </div>
                    <span class="favorite-toggle ${favorites.has(preset.id) ? "favorited" : ""}" data-favorite-id="${preset.id}">${favorites.has(preset.id) ? "★" : "☆"}</span>
                </div>
                <p>${preset.description}</p>
            `;

            btn.addEventListener("click", (event) => {
                const favoriteTrigger = event.target.closest("[data-favorite-id]");
                if (favoriteTrigger) {
                    event.stopPropagation();
                    toggleFavorite(preset.id);
                    return;
                }

                activePresetId = preset.id;
                renderPresetButtons();
                renderDemos();
                syncPreview();
            });

            presetList.appendChild(btn);
        });
    }

    function renderDemos() {
        if (!demoGrid) return;

        if (!loadedImageSrc) {
            demoGrid.innerHTML = '<div class="empty-state"><p>Upload an image to generate live variations.</p></div>';
            return;
        }

        const selector = activePresetId ? [activePresetId] : presets.map((preset) => preset.id);
        const visible = presets.filter((preset) => selector.includes(preset.id));

        demoGrid.innerHTML = "";

        visible.forEach((preset) => {
            const card = document.createElement("div");
            card.className = "demo-card";
            const imgId = `preset-${preset.id}`;
            const localFilter = buildFilterString(preset.filter);

            card.innerHTML = `
                <div class="image-shell">
                    <img id="${imgId}" src="${loadedImageSrc}" alt="${preset.title}" style="filter: ${localFilter}">
                </div>
                <div class="demo-meta">
                    <p>${preset.title}</p>
                    <button class="download-btn" data-download-id="${preset.id}" type="button">Download</button>
                </div>
            `;

            card.querySelector(".download-btn").addEventListener("click", () => {
                exportPresetImage(preset.id, localFilter);
            });

            demoGrid.appendChild(card);
        });
    }

    function toggleFavorite(presetId) {
        if (favorites.has(presetId)) {
            favorites.delete(presetId);
        } else {
            favorites.add(presetId);
        }
        renderPresetButtons();
    }

    function exportPresetImage(presetId, filterString) {
        const img = document.getElementById(`preset-${presetId}`) || editedPreview;
        if (!img) return;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.naturalWidth || img.width || 1200;
        canvas.height = img.naturalHeight || img.height || 1200;

        context.filter = filterString;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const link = document.createElement("a");
        link.download = `styleshift-${presetId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    function handleFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            loadedImageSrc = event.target.result;
            uploadLabel.textContent = `✅ ${file.name}`;
            statImage.textContent = file.name.length > 18 ? `${file.name.slice(0, 18)}...` : file.name;
            renderDemos();
            syncPreview();
        };
        reader.readAsDataURL(file);
    }

    function resetAdjustments() {
        currentAdjustments = { ...defaultAdjustments };
        syncAdjustmentControls();
        syncPreview();
        renderDemos();
    }

    function randomizePreset() {
        if (presets.length === 0) return;
        const randomIndex = Math.floor(Math.random() * presets.length);
        activePresetId = presets[randomIndex].id;
        renderPresetButtons();
        renderDemos();
        syncPreview();
    }

    function bindControls() {
        Object.entries(controlMap).forEach(([key, input]) => {
            if (!input) return;
            input.addEventListener("input", (event) => {
                currentAdjustments[key] = Number(event.target.value);
                syncPreview();
                renderDemos();
            });
        });

        if (compareSlider) {
            compareSlider.addEventListener("input", () => {
                if (editedLayer) {
                    editedLayer.style.clipPath = `inset(0 0 0 ${compareSlider.value}%)`;
                }
            });
        }

        if (presetSearch) {
            presetSearch.addEventListener("input", renderPresetButtons);
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener("click", resetAdjustments);
        }

        if (randomizePresetBtn) {
            randomizePresetBtn.addEventListener("click", randomizePreset);
        }

        if (downloadSelectedBtn) {
            downloadSelectedBtn.addEventListener("click", () => {
                const preset = getActivePreset();
                if (!loadedImageSrc || !preset) {
                    return;
                }
                exportPresetImage(preset.id, buildFilterString(preset.filter));
            });
        }

        if (fileInput) {
            fileInput.addEventListener("change", (event) => {
                const file = event.target.files[0];
                handleFile(file);
            });
        }

        if (dropZone) {
            ["dragenter", "dragover"].forEach((eventName) => {
                dropZone.addEventListener(eventName, (event) => {
                    event.preventDefault();
                    setDropZoneState(true);
                });
            });

            ["dragleave", "dragend", "drop"].forEach((eventName) => {
                dropZone.addEventListener(eventName, (event) => {
                    event.preventDefault();
                    setDropZoneState(false);
                });
            });

            dropZone.addEventListener("drop", (event) => {
                const file = event.dataTransfer.files[0];
                handleFile(file);
            });
        }
    }

    async function loadPresets() {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/presets");
            const data = await response.json();
            presets = data.presets || [];
            if (presets.length > 0) {
                activePresetId = presets[0].id;
            }
            renderPresetButtons();
            renderDemos();
            syncPreview();
            syncAdjustmentControls();
        } catch (error) {
            console.error("Failed to load presets:", error);
            if (presetList) {
                presetList.innerHTML = '<p class="error-msg">Unable to load the preset library. Check the backend server.</p>';
            }
        }
    }

    bindControls();
    loadPresets();
});