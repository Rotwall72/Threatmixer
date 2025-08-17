/*
Here, the selection screen is set up, which involves getting all of the region data and making all
of the region buttons work.
*/

// BUTTON TIPS
createTippy(previewToggleButton, previewToggleButton.dataset.title, "#dadbdd");

function setUpSelectionScreen(regionData) {
    // switching previews off if we're on mobile
    if (isMobileDevice) {
        previewsOn = false;
        previewToggleButton.style.display = "none";
    }

    // hiding the music screen for when we leave it to enter the selection screen
    hideScreen(musicScreen);
    showScreen(loadingScreen);

    // setting the page name
    document.title = "Threatmixer - Selection Screen";

    // we will not move onto the next step until a region button has been clicked
    return new Promise((resolve) => {

        // waiting for all of the buttons to load in before showing the selection screen
        var buttonSetUp = regionData.map((region, index) => {
            
            // uncomment for a full list of the regions within the console
            // console.log(`${index + 1}: ${region.name}`);

            return new Promise((buttonResolve) => {
                // storing the amount of buttons in each container
                var baseButtonArray = baseCarousel.querySelectorAll("button");
                var modButtonArray = modCarousel.querySelectorAll("button");
                var mscButtonArray = mscCarousel.querySelectorAll("button");
                var watchButtonArray = watchCarousel.querySelectorAll("button");
                var customButtonArray = customCarousel.querySelectorAll("button");

                // this switch case handles updating the carousel slides based on how many buttons there are
                switch (region.group) {
                    // if it's a vanilla region,
                    case ("base"):
                        // add a new slide to that carousel if there's already 6 buttons
                        baseSlideNumMax = newSlideCheck(baseButtonArray, baseSlideNumMax, baseCarousel);
                        break;
                    
                    case ("mods"):
                        modSlideNumMax = newSlideCheck(modButtonArray, modSlideNumMax,  modCarousel);
                        break;
                    
                    case ("msc"):
                        mscSlideNumMax = newSlideCheck(mscButtonArray, mscSlideNumMax,  mscCarousel);
                        break;
                
                    case ("watch"):
                        watchSlideNumMax = newSlideCheck(watchButtonArray, watchSlideNumMax,  watchCarousel);
                        break;
                    
                    case ("custom"):
                        customSlideNumMax = newSlideCheck(customButtonArray, customSlideNumMax, customCarousel);
                        break;
                }

                // creating a button
                var newRegionButton = document.createElement("button");
                newRegionButton.classList.add("region_button");

                // styling
                newRegionButton.style.backgroundImage = `url(${region.background})`;
                newRegionButton.innerText = region.name;
                newRegionButton.style.color = `${region.colors[0]}`;
                newRegionButton.style.border = `0.3vw solid`;

                // adding song snippets for when you hover over buttons using howler (if the button has one)
                if (region.preview != "N/A") {
                    var songPreview =  new Howl({
                        src: [region.preview, "sounds.mp3"],
                        loop: true,
                        onplay: () => {songPreview.fade(0, 1, 1000)},
                        onstop: () => {previewIsFadingOut = false}
                    })
                }

                regionButtonContainer[divIndex].appendChild(newRegionButton);

                // giving each button hover events
                newRegionButton.onmouseover = () => {
                    // making the button glow
                    newRegionButton.style.boxShadow = `0vw 0vw 1.3vw 0.4vw ${region.color}99`;

                    // fading in the song preview
                    if (region.preview != "N/A" && previewCanPlay && !loadingRegion && previewsOn) {
                        // first checking if another preview is currently trying to fade out
                        if (previewIsFadingOut) {
                            // if so, stop it
                            currentPreviewPlaying.stop()
                            clearTimeout(fadeCheck);
                            previewIsFadingOut = false;
                        }
                        
                        // if we're not fading out and the current songPreview isn't playing,
                        if (!previewIsFadingOut && !songPreview.playing() && !loadingRegion && previewsOn) {
                            songPreview.play()
                            currentPreviewPlaying = songPreview
                        }
                    }
                }

                newRegionButton.onmouseout = () => {
                    // removing the glow
                    newRegionButton.style.boxShadow = "";

                    // fading out the song preview
                    if (region.preview != "N/A" && previewCanPlay) {
                        previewIsFadingOut = true;
                        songPreview.fade(1, 0, 1000)
                        // waiting for the song to fully fade before stopping it
                        fadeCheck = setTimeout(() => {songPreview.stop()}, 1000)
                    }
                }

                // this function adds an onclick event to each button that will cause them to begin loading their respective song screen
                if (region.name != "Coming Soon!") {
                    addOnClick(newRegionButton, regionData, resolve);
                }

                // finishing button set up
                buttonResolve();
            })
        })

        // once button set up is complete,
        Promise.all(buttonSetUp).then(() => {
            
            // ensuring that the other carousel starts at the first slide
            if (selectionState == "base") {
                modCarousel.style.display = "flex";
                modCarousel.scrollLeft = 0;
                modCarousel.style.display = "none";
                mscCarousel.style.display = "flex";
                mscCarousel.scrollLeft = 0;
                mscCarousel.style.display = "none";
                watchCarousel.style.display = "flex";
                watchCarousel.scrollLeft = 0;
                watchCarousel.style.display = "none";
                customCarousel.style.display = "flex";
                customCarousel.scrollLeft = 0;
                customCarousel.style.display = "none";
            }

            // setting the carousel screen
            baseCarousel.scrollLeft = storedBaseSlide
            modCarousel.scrollLeft = storedModSlide
            mscCarousel.scrollLeft = storedMscSlide
            watchCarousel.scrollLeft = storedWatchSlide
            customCarousel.scrollLeft = storedCustomSlide

            // these variables handle setting carrot button status based on what screen we got sent to
            var atMidOfBaseCarousel = storedBaseSlide > 0 && storedBaseSlide < baseCarousel.scrollLeftMax,
                atMidOfModCarousel = storedModSlide > 0 && storedModSlide < modCarousel.scrollLeftMax,
                atMidOfMscCarousel = storedMscSlide > 0 && storedMscSlide < mscCarousel.scrollLeftMax,
                atMidOfWatchCarousel = storedWatchSlide > 0 && storedWatchSlide < watchCarousel.scrollLeftMax,
                atMidOfCustomCarousel = storedCustomSlide > 0 && storedCustomSlide < customCarousel.scrollLeftMax;
            
            var atStartOfBaseCarousel = storedBaseSlide == 0,
                atStartOfModCarousel = storedModSlide == 0,
                atStartOfMscCarousel = storedMscSlide == 0,
                atStartOfWatchCarousel = storedWatchSlide == 0,
                atStartOfCustomCarousel = storedCustomSlide == 0;
            
            var atEndOfBaseCarousel = storedBaseSlide == baseCarousel.scrollLeftMax,
                atEndOfModCarousel = storedModSlide == modCarousel.scrollLeftMax,
                atEndOfMscCarousel = storedMscSlide == mscCarousel.scrollLeftMax,
                atEndOfWatchCarousel = storedWatchSlide == watchCarousel.scrollLeftMax,
                atEndOfCustomCarousel = storedCustomSlide == customCarousel.scrollLeftMax;

            switch (selectionState) {
                case ("base"):
                    var scrollDistance = defineSlideHandling(atStartOfBaseCarousel, atMidOfBaseCarousel, atEndOfBaseCarousel, baseCarousel);
                    break;
                
                // likewise logic for the rest of the categories
                case ("mods"):
                    var scrollDistance = defineSlideHandling(atStartOfModCarousel, atMidOfModCarousel, atEndOfModCarousel, modCarousel);
                    break;
                
                case ("msc"):
                    var scrollDistance = defineSlideHandling(atStartOfMscCarousel, atMidOfMscCarousel, atEndOfMscCarousel, mscCarousel);
                    break;
                    
                case ("watch"):
                    var scrollDistance = defineSlideHandling(atStartOfWatchCarousel, atMidOfWatchCarousel, atEndOfWatchCarousel, watchCarousel);
                    break;
                
                case ("custom"):
                    var scrollDistance = defineSlideHandling(atStartOfCustomCarousel, atMidOfCustomCarousel, atEndOfCustomCarousel, customCarousel);
                    break;
            }
            
            carrotButtons[0].onclick = () => { // left carrot button
                if (!clickOnTimeout) {
                    setClickTimout();
                    
                    // this switch checks to see what carousel we're trying to move
                    switch (selectionState) {
                        case ("base"):
                            baseSlideNum = leftCarrotButtonHandling(baseSlideNum, baseSlideNumMax, scrollDistance, baseCarousel);
                            break;
                        
                        // likewise logic
                        case ("mods"):
                            modSlideNum = leftCarrotButtonHandling(modSlideNum, modSlideNumMax, scrollDistance, modCarousel);
                            break;
                        
                        case ("msc"):
                            mscSlideNum = leftCarrotButtonHandling(mscSlideNum, mscSlideNumMax, scrollDistance, mscCarousel);
                            break;
                            
                        case ("watch"):
                            watchSlideNum = leftCarrotButtonHandling(watchSlideNum, watchSlideNumMax, scrollDistance, watchCarousel);
                            break;
                        
                        case ("custom"):
                            customSlideNum = leftCarrotButtonHandling(customSlideNum, customSlideNumMax, scrollDistance, customCarousel);
                            break;
                    }
                }
            }

            carrotButtons[1].onclick = () => { // right carrot button
                if (!clickOnTimeout) {
                    setClickTimout();
                    switch (selectionState) {
                        case ("base"):
                            baseSlideNum = rightCarrotButtonHandling(baseSlideNum, baseSlideNumMax, scrollDistance, baseCarousel);
                            break;
                        
                        case ("mods"):
                            modSlideNum = rightCarrotButtonHandling(modSlideNum, modSlideNumMax, scrollDistance, modCarousel);
                            break;
                        
                        case ("msc"):
                            mscSlideNum = rightCarrotButtonHandling(mscSlideNum, mscSlideNumMax, scrollDistance, mscCarousel);
                            break;
                    
                        case ("watch"):
                            watchSlideNum = rightCarrotButtonHandling(watchSlideNum, watchSlideNumMax, scrollDistance, watchCarousel);
                            break;

                        case ("custom"):
                            customSlideNum = rightCarrotButtonHandling(customSlideNum, customSlideNumMax, scrollDistance, customCarousel);
                            break;
                    }
                }
            }
        });

        // revealing the selection screen
        hideScreen(loadingScreen);
        showScreen(selectionScreen);
        loadingRegion = false;

        // adding a short cooldown to when song previews can begin playing
        previewCooldown = setTimeout(() => {previewCanPlay = true}, 1000)
    })
}

// this function handles giving the button functionality and loading the music screen
function addOnClick(element, regionData, resolve) {
    element.onclick = () => {
        // preventing this code from running twice due to a double click
        if (!regionButtonClicked) {
            regionButtonClicked = true;
            loadingRegion = true;

            loadingText.innerText = "Preparing music screen...";
            loadingDetails.innerText = "Processed layers: (0/0)"
            
            hideScreen(selectionScreen);
            showScreen(loadingScreen);

            // first storing the current carousel state to reference for later
            storedBaseSlide = baseCarousel.scrollLeft;
            storedModSlide = modCarousel.scrollLeft;
            storedMscSlide = mscCarousel.scrollLeft;
            storedWatchSlide = watchCarousel.scrollLeft;
            storedCustomSlide = customCarousel.scrollLeft;

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
            var regionButtonArray = Array.from(regionButton),
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

                    // creating the layer and solo buttons
                    var newLayerButton = document.createElement("button"); 
                    newLayerButton.classList.add("layer_button", "layer_button_darkened");
                    newLayerButton.dataset.title = " (Muted)";

                    // giving the button a title
                    var rawLayerSrc = layer[1],
                        strIndex = -4,
                        layerName = "";

                    for (let i = 0; i < rawLayerSrc.length; i++) {
                        if (rawLayerSrc.at(strIndex) == " " || rawLayerSrc.at(strIndex) == "_") {
                            layerName = rawLayerSrc.slice(strIndex + 1, -4);
                            break;          
                        }
                        else {strIndex--;}
                    }

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

                            heArrives = new Audio("assets/music/misc/manifest.mp3");
                            heArrives.play();
                            beenFound = true;
                        }
                    }

                    // creating a pop-up tip for each button
                    createTippy(newLayerButton, layerName, buttonColor);
                    createTippy(newSoloButton, newSoloButton.dataset.title, buttonColor);
                    layerNameArray.push(layerName);
                
                    // storing audio files
                    regionThreatLayers.push(new Audio(layer[1]));
                
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

            // changing the background image depending on the region
            musicScreen.style.backgroundImage = `url(${regionChosen.background})`;

            // changing the color of the visualizer
            canvasContext.fillStyle = `${defaultColor}`;
            canvasContext.strokeStyle = `${defaultColor}`;

            // once this has all been done, move onto the next step
            resolve(); 
        }
    }
}

// Functions to simplify slide handling
function newSlideCheck(buttonArray, carouselSlideNumMax, carousel) {
    if (buttonArray.length % 6 == 0) {
        divIndex++;
        carouselSlideNumMax++;
        var newDiv = document.createElement("div");
        newDiv.classList.add("region_button_container");
        carousel.appendChild(newDiv);   
    }
    return carouselSlideNumMax;
}

function defineSlideHandling(start, mid, end, carousel) {
    // if on the first slide,
    if (start) {
        switchToBright(carrotButtons[1]);
        switchToDark(carrotButtons[0]);
    }

    // if in the middle, 
    if (mid) {
        switchToBright(carrotButtons[0], carrotButtons[1])
    }

    // if on the last slide,
    if (end) {
        switchToBright(carrotButtons[0]);
        switchToDark(carrotButtons[1]);
    }

    // finally, determining the scroll distance
    return scrollDistance = carousel.getBoundingClientRect().width;
}

function leftCarrotButtonHandling(carouselSlideNum, carouselSlideNumMax, scrollDistance, carousel) {
    // switching the right side button back on if we are moving off of the last page
    if (carouselSlideNum == carouselSlideNumMax) {
        switchToBright(carrotButtons[1]);
    }

    // moving the slide
    carousel.scrollLeft -= scrollDistance;

    // decreasing the slide number if its not already at 1
    if (carouselSlideNum > 1) {
        carouselSlideNum--;
        slideNum.innerText = `${carouselSlideNum}.`;
    }

    // switching the left carrot button off if we're on the first slide
    if (carouselSlideNum == 1) {
        switchToDark(carrotButtons[0])
    };

    // checking if we need to change the carousel name
    if (selectionState == "custom" && carouselSlideNum <= 2) {
        selectionHeader.innerText = "Extra Threat Themes";
    }

    return carouselSlideNum;
}

function rightCarrotButtonHandling(carouselSlideNum, carouselSlideNumMax, scrollDistance, carousel) {
    if (carouselSlideNum == 1) {
        switchToBright(carrotButtons[0]);
    }
    carousel.scrollLeft += scrollDistance;

    if (carouselSlideNum < carouselSlideNumMax) {
        carouselSlideNum++;
        slideNum.innerText = `${carouselSlideNum}.`;
    }

    if (carouselSlideNum == carouselSlideNumMax) {
        switchToDark(carrotButtons[1]);
    }

    if (selectionState == "custom" && carouselSlideNum >= 3) {
        selectionHeader.innerText = "Roasted's Threat Themes";
    }

    return carouselSlideNum;
}

// on clicks
baseButton.onclick = () => {
    selectionState = "base";
    selectionHeader.innerText = "Vanilla Regions";
    baseSlideNum = 1;
    slideNum.innerText = `${baseSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    baseButton.classList.add("extend_button")
    moddedButton.classList.remove("extend_button")
    mscButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    modCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "none";
    baseCarousel.style.display = "flex";
    baseCarousel.scrollLeft = 0;
}

moddedButton.onclick = () => {
    selectionState = "mods";
    selectionHeader.innerText = "Modded Regions";
    modSlideNum = 1;
    slideNum.innerText = `${modSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    moddedButton.classList.add("extend_button")
    mscButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "none";
    modCarousel.style.display = "flex";
    modCarousel.scrollLeft = 0;
}

mscButton.onclick = () => {
    selectionState = "msc";
    selectionHeader.innerText = "Downpour Regions";
    mscSlideNum = 1;
    slideNum.innerText = `${mscSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToDark(carrotButtons[1]);
    mscButton.classList.add("extend_button")
    moddedButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    modCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "none";
    mscCarousel.style.display = "flex";
    mscCarousel.scrollLeft = 0;
}

watchButton.onclick = () => {
    selectionState = "watch";
    selectionHeader.innerText = "Watcher Regions";
    watchSlideNum = 1;
    slideNum.innerText = `${watchSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    watchButton.classList.add("extend_button")
    mscButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    moddedButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    modCarousel.style.display = "none";
    customCarousel.style.display = "none";
    watchCarousel.style.display = "flex";
    watchCarousel.scrollLeft = 0;
}

customButton.onclick = () => {
    selectionState = "custom";
    selectionHeader.innerText = "Extra Threat Themes";
    customSlideNum = 1;
    slideNum.innerText = `${customSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    customButton.classList.add("extend_button")
    mscButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    moddedButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    modCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "flex";
    customCarousel.scrollLeft = 0;
}

selectionBackButton.onclick = () => {
    showScreen(homeScreen)
    hideScreen(selectionScreen)
    clearSelectionScreen()
    baseCarousel.scrollLeft = 0;
    modCarousel.scrollLeft = 0;
    mscCarousel.scrollLeft = 0;
    watchCarousel.scrollLeft = 0;
    customCarousel.scrollLeft = 0;
    baseSlideNum = 1;
    modSlideNum = 1;
    mscSlideNum = 1;
    watchSlideNum = 1;
    customSlideNum = 1;
    slideNum.innerText = 1;
    switchToBright(carrotButtons[1]);
    switchToDark(carrotButtons[0]);

    // restarting the menu music check
    menuMusicCheck = setInterval(() => {
        if (homeScreen.style.height == "100%" && !menuMusicPlaying && menuMusicEnabled) {
            menuMusicPlaying = true;
            menuMusic.volume(0.3);
            menuMusicTimeout = setTimeout(() => {menuMusic.play()}, 2000);
        }
    }, 1000)
}

previewToggleButton.onclick = () => {
    previewsOn = !previewsOn

    if (!previewsOn) {
        previewToggleIcon.src = "assets/images/button_icons/preview_disabled_icon.png";
        updateTippyContent(previewToggleButton, "Preview Toggle (Off)");
    }
    else {
        previewToggleIcon.src = "assets/images/button_icons/preview_enabled_icon.png";
        updateTippyContent(previewToggleButton, "Preview Toggle (On)");
    }
}

// MISC FUNCTIONS
function setClickTimout() { // to prevent carrot button spam
    clickOnTimeout = true;
    setTimeout(() => {clickOnTimeout = false;}, 500); // half of a second
}

function clearSelectionScreen() {
    layerButtonContainer.innerHTML = "";
    baseCarousel.innerHTML = "";
    modCarousel.innerHTML = "";
    mscCarousel.innerHTML = "";
    watchCarousel.innerHTML = "";
    customCarousel.innerHTML = "";
    document.title = "Threatmixer";
    regionButtonClicked = false;
    divIndex = -1;
    baseSlideNumMax = 0;
    modSlideNumMax = 0;
    mscSlideNumMax = 0;
    watchSlideNumMax = 0
    customSlideNumMax = 0;
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