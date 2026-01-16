/*
Here, the selection screen is set up, which involves getting all of the region data and making all
of the region buttons work.
*/

// preview constructor
class Preview {
    constructor(song, region, isFadingOut = false, isFadingIn = false) {
        this.song = song,
        this.region = region,
        this.isFadingOut = isFadingOut,
        this.isFadingIn = isFadingIn
    }
}

function setUpSelectionScreen(regionData) {
    // switching previews and keyboard shortcuts off if we're on mobile
    if (isMobileDevice) {
        previewsOn = false;
        previewToggleButton.style.display = "none";
        shortcutToggle.checked = false;
    }

    hideScreen(musicScreen);
    showScreen(loadingScreen);
    document.title = "Threatmixer - Selection Screen";


        // figuring out how many regions there are of each group
        Array.from(filterLabels).forEach((label) => {
            const targetGroup = label.htmlFor.replace("_filter", "");
            if (!regionCountFinished) {
                var regionCount = 0;

                if (targetGroup !== "fav") {
                    regionData.forEach((region) => {
                        if ((region.groups[0] == targetGroup)) {regionCount++;}
                    })

                    label.innerHTML += ` (${regionCount})`;
                }
                else {
                    favFilterLabel = label;
                    updateFavoritesLabelCount(favoritedArray, label);
                }
            }
        });

        regionCountFinished = true;

    return new Promise((resolve) => {

        // waiting for all of the buttons to load in before showing the selection screen
        var buttonSetUp = regionData.map((region, index) => {
            
            // uncomment for a full list of the regions within the console
            // console.log(`${index}: ${region.name}`);

            return new Promise((buttonResolve) => {
                // creating a button
                var newRegionButton = document.createElement("button");
                newRegionButton.classList.add("region_button");

                // styling
                newRegionButton.style.setProperty("--region-button-color", region.colors[0]);
                newRegionButton.style.setProperty("--region-button-glow-color", region.colors[0] + "99")
                newRegionButton.style.backgroundImage = `url(${region.background})`;
                newRegionButton.innerText = region.name;

                // new indicator
                if (region.new) {
                    var newRegionIndicator = document.createElement("img");
                    newRegionIndicator.src = "assets/images/misc/new_region_indicator_icon.png";
                    newRegionIndicator.classList.add("new_region_indicators");
                    newRegionIndicator.style.setProperty("--indicator-filter", region.filters[0]);
                    newRegionIndicator.style.setProperty("--glow-color", region.colors[0]);
                    newRegionButton.appendChild(newRegionIndicator);
                }

                // favorite button
                var newFavoriteButton = document.createElement("img");
                newFavoriteButton.classList.add("favorite_button");

                /* The .favorited property doesn't carry over between selection resets,
                so we keep track of which regions were favorite using favoritedArray */
                const regionItem = [region.name, region.groups[0]];
                favoritedArray.forEach((item) => {
                    if (item.toString() == regionItem.toString()) {
                        region.favorited = true;
                        region.groups.push("fav");
                    }
                })

                setFavoriteButtonIcon(region.favorited, newFavoriteButton);

                newFavoriteButton.onclick = () => {
                    favoriteButtonCicked = true;

                    if (!region.favorited) {
                        region.favorited = true;
                        region.groups.push("fav");
                        favoritedArray.push(regionItem);
                        groupInfo.innerText += ", Favorites";
                    }
                    else {
                        region.favorited = false;
                        region.groups.pop();

                        var removedRegionIndex;
                        favoritedArray.forEach((region, index) => {
                            const regionName = region[0],
                                regionGroup = region[1],
                                removedRegionName = regionItem[0],
                                removedRegionGroup = regionItem[1];

                            if (regionName === removedRegionName && regionGroup === removedRegionGroup && removedRegionIndex === undefined) {
                                removedRegionIndex = index;
                            }
                        })

                        favoritedArray.splice(removedRegionIndex, 1);
                        groupInfo.innerText = groupInfo.innerText.replace(", Favorites", "");
                    }

                    updateFavoritesLabelCount(favoritedArray, favFilterLabel);
                    setFavoriteButtonIcon(region.favorited, newFavoriteButton);
                    localStorage.setItem("favorites", JSON.stringify(favoritedArray));
                }

                newRegionButton.appendChild(newFavoriteButton);
                buttonOverflow.appendChild(newRegionButton);

                var songPreview = new Preview(null, region.name);

                // giving each button hover events
                newRegionButton.onmouseenter = () => {
                    // updating info text
                    var regionGroup;
                    switch (region.groups[0]) {
                        case ("base"):
                            regionGroup = "Vanilla Regions"
                            break;
                        case ("msc"):
                            regionGroup = "Downpour Regions"
                            break;
                        case ("watch"):
                            regionGroup = "Watcher Regions"
                            break;
                        case ("mods"):
                            regionGroup = "Modded Regions"
                            break;
                        case ("extra"):
                            regionGroup = "Extra Threat Themes"
                            break;
                        case ("roast"):
                            regionGroup = "Roasted's Threat Themes"
                            break;
                        case ("night"):
                            regionGroup = "NMRW/Night Variants"
                            break;
                        case ("frigid"):
                            regionGroup = "Frigid Threat Themes"
                            break;
                        case ("pilgrim"):
                            regionGroup = "Pilgrimate Threat Themes"
                            break;
                        case("jeeper"):
                            regionGroup = "Jeeper's Watcher Themes"
                            break;
                        case("misc"):
                            regionGroup = "Miscellaneous"
                            break;
                        default:
                            regionGroup = region.groups[0];
                            break;
                    }

                    if (region.favorited) {regionGroup += ", Favorites"}

                    groupInfo.innerText = `Category: ${regionGroup}`;
                    layerInfo.innerText = `Layers: ${region.layers.length}`;
                    musicCreditsInfo.innerText = `Song by: ${region.songCredits}`;
                    regionCreditsInfo.innerText = `Region by: ${region.regionCredits}`;
                    artCreditsInfo.innerText = `Art by: ${region.artCredits}`;

                    // creating the song preview
                    if (region.preview !== undefined && previewsOn) {
                        previousPreview?.song.stop();
                        clearTimeout(fadeCheck);
                        previousPreview = songPreview;
                        songPreview.song = new Howl({
                            src: buildAudioSRC(region.preview, region.pathingToAudioRepo),
                            loop: true,
                            onplay: () => {songPreview.song.fade(0, 1, 1000)},
                            onstop: () => {songPreview.isFadingOut = false;}
                        })
                    }
                    
                    if (region.preview != "N/A" && previewCanPlay && !loadingRegion && previewsOn) {
                        if (previousPreview !== undefined) {
                            if (previousPreview.isFadingOut) {
                                previousPreview.song.stop();
                                clearTimeout(fadeCheck);
                                previousPreview.isFadingOut = false;
                            }

                            if (!previousPreview.isFadingOut && !songPreview.song.playing() && !loadingRegion && previewsOn) {
                                songPreview.song.play();
                            }
                        }
                        else {
                            songPreview.song.play();
                        }
                    }
                }

                newRegionButton.onmouseleave = () => {
                    // resetting info text
                    groupInfo.innerText = "Category: N/A";
                    layerInfo.innerText = "Layers: N/A";
                    musicCreditsInfo.innerText = "Song by: N/A";
                    regionCreditsInfo.innerText = "Region by: N/A";
                    artCreditsInfo.innerText = "Art by: N/A";

                    // fading out the song preview
                    if (region.preview != "N/A" && previewCanPlay && previewsOn) {
                        songPreview.isFadingOut = true;
                        songPreview.song.fade(1, 0, 1000);
                        // waiting for the song to fully fade before stopping it
                        fadeCheck = setTimeout(() => {songPreview.song.stop()}, 1000)
                    }
                }

                // this function adds an onclick event to each button that will cause them to begin loading their respective song screen
                if (region.name != "Coming Soon!") {
                    addOnClick(newRegionButton, regionData, resolve);
                }

                // finishing button set up
                buttonResolve();
            })
        });

        // once button set up is complete,
        Promise.all(buttonSetUp).then(() => {
            hideScreen(loadingScreen);
            showScreen(selectionScreen);
            loadingRegion = false;

            noRegionsText = document.createElement("p");
            noRegionsText.id = "no_regions_text";
            noRegionsText.innerText = "No regions found :(";
            buttonOverflow.appendChild(noRegionsText);

            // sending the scroll bar to where it was before
            buttonOverflow.scrollTop = storedScrollPosition;

            // search and filter functionality
            if (!failsafesDone) {filterRegions(regionData, searchBar.value.toLowerCase())} // failsafe check
            searchBar.oninput = () => {filterRegions(regionData, searchBar.value.toLowerCase())}

            Array.from(filterOptions).forEach((checkbox, index) => {
                if (!failsafesDone) {filterRegions(regionData, searchBar.value.toLowerCase(), checkbox)}; // failsafe checks
                updateLabelBrightness(checkbox, index);
                checkbox.oninput = () => {
                    filterRegions(regionData, searchBar.value.toLowerCase(), checkbox);
                    updateLabelBrightness(checkbox, index);
                }
            })

            failsafesDone = true;
        });

        // adding a short cooldown to when song previews can begin playing
        previewCooldown = setTimeout(() => {previewCanPlay = true}, 1000)
    })
}

// this function handles giving the button functionality and loading the music screen
function addOnClick(element, regionData, resolve) {
    element.onclick = () => {
        // preventing this code from running twice due to a double click, and also if the favorite button was clicked
        if (!regionButtonClicked && !favoriteButtonCicked) {
            regionButtonClicked = true;
            loadingRegion = true;
           
            loadingText.innerText = "Preparing music screen...";
            loadingDetails.innerText = "Processed layers: (0/0)";
            storedScrollPosition = buttonOverflow.scrollTop;
            
            hideScreen(selectionScreen);
            showScreen(loadingScreen);

            // defining variables
            songSoloed = false;
            songStarted = false;
            eraseRecording = false;
            loadedLayers = [];
            layersPlaying = [];
            startingLayers = [];
            recordedData = [];
            regionThreatLayers = [];

            // storing the index of the region that was selected, as well as the region itself
            var regionButtonArray = Array.from(regionButtons),
                regionIndex = regionButtonArray.indexOf(element),
                regionChosen = regionData[regionIndex];

            // setting the header to the region's name
            if (regionChosen.trueName == undefined) {var regionName = regionChosen.name;}
            else {var regionName = regionChosen.trueName;}
            regionTitle.innerText = regionName;

            // and the title of the tab as well
            document.title = `Threatmixer - ${regionName}`;

            // also checking for other specific regions as well
            switch (regionName) {
                case ("Far Shore"):
                    farShoreSelected = true;
                    break;
            }

            // finding the default colors for our region
            var colorArray = regionChosen.colors,
                filterArray = regionChosen.filters,
                defaultColor = colorArray[0],
                defaultFilter = filterArray[0];

            // applying layerButtonContainer width
            layerButtonContainer.style.width = regionChosen.containerWidth;

            // here, we dynamically create as many buttons and sounds as we need based on what's in the json
            regionChosen.layers.forEach((layer, index) => {
                // creating a div to hold each of the buttons
                var newDiv = document.createElement("div");
                newDiv.classList.add("layer_options");

                // creating a layer button
                var newLayerButton = document.createElement("button"); 
                newLayerButton.classList.add("layer_button", "layer_button_darkened");
                newLayerButton.dataset.title = " (Muted)";

                // text info
                appendKeyLabel(newLayerButton, keysArray[index]);

                // giving the button a title
                var rawLayerSrc = layer[1],
                    strIndex = -4,
                    layerName = "",
                    underscoreSkipped = false;
                const exceptionArray = ["The Cusp"]

                for (let i = 0; i < rawLayerSrc.length; i++) {
                    const hitSpace = rawLayerSrc.at(strIndex) == " ",
                        hitUnderscore = rawLayerSrc.at(strIndex) == "_";

                    if (hitSpace || hitUnderscore) {
                        if (exceptionArray.includes(regionName) && hitUnderscore) {
                            strIndex--;
                            underscoreSkipped = true;  
                        }
                        else {
                            layerName = rawLayerSrc.slice(strIndex + 1, -4);
                            break;
                        }
                    }
                    else {strIndex--;}
                }

                if (underscoreSkipped) {layerName = layerName.replace("_", " ");}

                // hardcoding House of Braids tippy names (for now)
                if (regionName == "House of Braids") {
                    switch (houseCount) {
                        case 8:
                            layerName = "BASS1 (NIGHT)";
                            break;
                        case 9:
                            layerName = "DRUM2 (NIGHT)";
                            break;
                        case 10:
                            layerName = "BREAKS1 (NIGHT)";
                            break;
                        case 11:
                            layerName = "LEAD2 (NIGHT)";
                            break;
                        case 12:
                            layerName = "WAWA (NIGHT)";
                            break;
                    }

                    houseCount++;
                }
                else if (regionName == "Woven Nest" && index == 11) {
                    layerName = "Thanks Snoodle";
                }

                // creating a solo button
                var newSoloButton = document.createElement("button");
                newSoloButton.classList.add("solo_button", "darken_button");
                newSoloButton.dataset.title = "Solo Layer (Mute Others)";

                // creating the icons to put in each button
                var newLayerIcon = document.createElement("img");
                newLayerIcon.classList.add("button_icon");

                if (regionName == "Data Manifold" && index == 3) {
                    var potRoll = Math.floor(Math.random() * 10) + 1;

                    if (potRoll == 1) {
                        newLayerIcon.src = `assets/images/button_icons/smug_jug_icon.png`;
                    }
                    else {
                        newLayerIcon.src = `assets/images/button_icons/${layer[0]}`;
                    }
                }
                else {
                    newLayerIcon.src = `assets/images/button_icons/${layer[0]}`;
                }

                var newSoloIcon = document.createElement("img");
                newSoloIcon.classList.add("button_icon", "solo_button_icon");
                newSoloIcon.src = soloIcon1;

                // applying color to the buttons
                var buttonColor = colorArray[layer[2]],
                    buttonFilter = filterArray[layer[2]];

                newLayerButton.style.border = `0.16vw solid ${buttonColor}`;
                newLayerButton.style.color = `${buttonColor}`
                newSoloButton.style.border = `0.16vw solid ${buttonColor}`;
                if (layerName != "Thanks Snoodle") {newLayerIcon.style.filter = `${buttonFilter}`};
                newSoloIcon.style.filter = `${buttonFilter}`;

                newLayerButton.style.setProperty("--glow-color", `${buttonColor}99`);
                newLayerButton.style.setProperty("--tippy-color", `${buttonColor}`);
                
                // adding our new elements onto the page
                newLayerButton.appendChild(newLayerIcon);
                newSoloButton.appendChild(newSoloIcon);
                newDiv.appendChild(newLayerButton);
                newDiv.appendChild(newSoloButton);
                layerButtonContainer.appendChild(newDiv);

                if (regionName == "Woven Nest" && index == 11 && !beenFound) {
                    newDiv.style.opacity = "0";
                    newLayerButton.style.pointerEvents = "none";
                    newSoloButton.style.pointerEvents = "none";
                    newDiv.style.transition = "opacity 1s ease";

                    var him = document.getElementById("c");
                    him.style.display = "block";

                    him.onclick = () => {
                        newDiv.style.opacity = "1";
                        him.style.display = "none";
                        newLayerButton.style.pointerEvents = "auto";
                        newSoloButton.style.pointerEvents = "auto";

                        heArrives = new Audio(buildAudioSRC("music/misc/manifest.mp3"));
                        heArrives.play();
                        beenFound = true;
                    }
                }

                // creating a pop-up tip for each button
                createTippy(newLayerButton, layerName, buttonColor);
                createTippy(newSoloButton, newSoloButton.dataset.title, buttonColor);
                layerNameArray.push(layerName);
            
                // storing audio files
                regionThreatLayers.push(new Audio(buildAudioSRC(layer[1], regionChosen.pathingToAudioRepo)));
            });

            // creating dynamic style changes
            var styleChanges = document.createElement("style");
            styleChanges.textContent = `
            .tippy-box[data-theme~="other-button-style"] {
                color: ${defaultColor};
                border: 0.2vw solid ${defaultColor};
            }
            `;
            
            // adding these changes
            document.head.appendChild(styleChanges);
            
            setDynamicColor([exitButton, settingsButton, settingsContainer, regionTitle, 
                visButton, timer, fadeToggleButton, progressBar, 
                document.getElementById("timer_container")], defaultColor);
            
            setDynamicColor(Array.from(otherButtons), defaultColor);
            setDynamicFilter(Array.from(otherButtonIcons), defaultFilter);
            setDynamicFilter([shortcutToggle], defaultFilter);

            // giving the option buttons key labels
            if (!keyLabelsAlreadyAppend) {
                Array.from(otherButtons).forEach((button) => {
                    appendKeyLabel(button, button.dataset.correspondingkey);
                })
                keyLabelsAlreadyAppend = true;
            }

            // changing the background image depending on the region
            musicScreen.style.backgroundImage = `url(${regionChosen.background})`;

            // changing the color of the visualizer
            canvasContext.fillStyle = `${defaultColor}`;
            canvasContext.strokeStyle = `${defaultColor}`;

            // once this has all been done, move onto the next step
            resolve();
        }
        else {
            favoriteButtonCicked = false;
        }
    }
}

// on clicks
selectionBackButton.onclick = () => {
    showScreen(homeScreen)
    hideScreen(selectionScreen)
    clearSelectionScreen()
    failsafesDone = false;

    // restarting the menu music check
    menuMusicCheck = setInterval(() => {
        if (homeScreen.style.height == "100%" && !menuMusicPlaying && menuMusicEnabled) {
            menuMusicPlaying = true;
            menuMusic.volume(0.3);
            menuMusicTimeout = setTimeout(() => {menuMusic.play()}, 2000);
        }
    }, 1000);
}

previewToggleButton.onclick = () => {
    previewsOn = !previewsOn
    localStorage.setItem("previewsOn", previewsOn);

    if (!previewsOn) {
        previewToggleIcon.src = "assets/images/button_icons/preview_disabled_icon.png";
        updateTippyContent(previewToggleButton, "Preview Toggle (Off)");
        Howler.stop()
    }
    else {
        previewToggleIcon.src = "assets/images/button_icons/preview_enabled_icon.png";
        updateTippyContent(previewToggleButton, "Preview Toggle (On)");
    }
}

showAllButton.onclick = () => {
    Array.from(filterOptions).forEach((checkbox) => {
        if (!checkbox.checked) {checkbox.click();}
    })
}

hideAllButton.onclick = () => {
    Array.from(filterOptions).forEach((checkbox) => {
        if (checkbox.checked) {checkbox.click();}
    })
}

// MISC FUNCTIONS
function filterRegions(regionData, searchInput, filterInput = null) {
    // finding what categories of regions need to be excluded
    if (filterInput != null) {
        const filterCategory = filterInput.value,
            regionGroupInList = excludeList.includes(filterCategory),
            checked = filterInput.checked;

        if (!checked && !regionGroupInList) {
            excludeList.push(filterCategory);
        }
        else if (checked && regionGroupInList) {
            excludeList.splice(excludeList.indexOf(filterCategory), 1)
        }
    }

    regionData.forEach((region) => {
        const regionIndex = regionData.indexOf(region),
            currentRegionButton = regionButtons[regionIndex];
        var regionName = region.name.toLowerCase(),
            regionTrueName = regionName,
            regionArtists = [region.songCredits.toLowerCase()];
        
        const layerPathing = region.layers[0][1],
            filePrefixIndex = layerPathing.indexOf("TH_");
        // the +3 signifies moving 3 indexes to the right to reach the start of the ancronym
        // likewise, the +7 signifies the end of the acronym (if it's 4 chars long) starting from the TH_ prefix
        var regionAcronym = layerPathing.slice(filePrefixIndex + 3, filePrefixIndex + 7).toLowerCase();

        const indexOfDash = -1;
        if (regionAcronym[indexOfDash] === "-") {regionAcronym.splice(indexOfDash, 1)}
        regionAcronym = regionAcronym.trim();

        if (regionArtists[0].includes("&")) {
            regionArtists = regionArtists[0].split(" & ");
        }
        // trueName by default = display name, unless specified in json
        if (region.trueName != undefined) {
            regionTrueName = region.trueName.toLowerCase();
        }
        if (regionName == "TOOOOOOOO OOOOOOOOO OOOOOOOBS".toLowerCase()) {
            regionName = regionName.replaceAll(" ", "");
        }
        if (regionName.slice(0, 4) == "the ") {
            regionName = regionName.replace("the ", "");
        }

        var searchConditionMet = false;
        switch(searchOptions.value) {
            case("region"):
                const nameContainsInput = regionName.slice(0, searchInput.length) === searchInput;
                const trueNameContainsInput = regionTrueName.slice(0, searchInput.length) === searchInput;
                searchConditionMet = nameContainsInput || trueNameContainsInput;
                break;
            case("artist"):
                regionArtists.forEach((artist) => {
                    if (artist.slice(0, searchInput.length) === searchInput) {searchConditionMet = true;}
                })
                break;
            case("acronym"):
                searchConditionMet = regionAcronym.slice(0, searchInput.length) === searchInput;
                break;
        }
        

        var allGroupsExcluded = true;

        region.groups.forEach((group) => {
            if (allGroupsExcluded) {
                allGroupsExcluded = excludeList.includes(group);
            }
        });

        if (!searchConditionMet || allGroupsExcluded) {
            currentRegionButton.style.display = "none";
        }
        else {
            currentRegionButton.style.display = "block";
        }
    });

    // checking if all of the region buttons are hidden
    var allHidden = true;
    Array.from(regionButtons).forEach((button) => {
        if (button.style.display != "none") {allHidden = false;}
    })

    if (allHidden) {noRegionsText.style.display = "block";}
    else {noRegionsText.style.display = "none";}
}

function clearSelectionScreen() {
    document.title = "Threatmixer";
    layerButtonContainer.innerHTML = "";
    buttonOverflow.innerHTML = "";
    groupInfo.innerText = "Category:";
    layerInfo.innerText = "Layers:";
    musicCreditsInfo.innerText = "Song by:";
    regionCreditsInfo.innerText = "Region by:";
    artCreditsInfo.innerText = "Art by:";
    regionButtonClicked = false;
    houseCount = 0;
}

function setDynamicColor(elementArray, color) {
    elementArray.forEach((element) => {
        element.style.setProperty("--dynamic-color", color);
    })
}

function setDynamicFilter(iconArray, filter) {
    iconArray.forEach((icon) => {
        icon.style.setProperty("--dynamic-filter", filter);
    })
}

function updateLoadingInfo(progress, goal) {
    loadingDetails.innerText = `Processed layers: (${progress}/${goal})`;
}

function updateLabelBrightness(checkbox, index) {
    if (!checkbox.checked) {
        filterLabels[index].style.setProperty("--label-brightness", "50%");
    }
    else {
        filterLabels[index].style.setProperty("--label-brightness", "100%");
    }
}

function setFavoriteButtonIcon(regionFavorited, button) {
    if (regionFavorited) {
        button.src = "assets/images/misc/favorited_icon.png";
        button.classList.toggle("favorited");
    }
    else {
        button.src = "assets/images/misc/unfavorited_icon.png";
        button.classList.remove("favorited");
    }
}

function updateFavoritesLabelCount(favoritedArray, label) {
    label.innerHTML = "Favorites ";
    label.innerHTML += `(${favoritedArray.length})`;
}

function appendKeyLabel(button, key) {
    var keyLabel = document.createElement("p");
    keyLabel.classList.add("key_labels");
    keyLabel.innerText = key;
    if (shortcutToggle.checked) {keyLabel.style.setProperty("--shortcut-visibility", "block");}
    else {keyLabel.style.setProperty("--shortcut-visibility", "none");}
    button.appendChild(keyLabel);
}