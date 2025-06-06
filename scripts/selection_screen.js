/*
Here, the selection screen is set up, which involves getting all of the region data and making all
of the region buttons work.
*/

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
            
            // console.log(`${index}: ${region.name}`)

            return new Promise((buttonResolve) => {

                // storing the amount of buttons in each container
                var baseButtonArray = baseCarousel.querySelectorAll("button");
                var modButtonArray = modCarousel.querySelectorAll("button");
                var mscButtonArray = mscCarousel.querySelectorAll("button");
                var watchButtonArray = watchCarousel.querySelectorAll("button");

                // this switch case handles updating the carousel slides based on how many buttons there are
                switch (region.group) {

                    // if it's a vanilla region,
                    case ("base"):
                        // add a new slide to that carousel if there's already 6 buttons
                        if (baseButtonArray.length % 6 == 0) {
                            divIndex++;
                            baseSlideNumMax++;
                            var newDiv = document.createElement("div");
                            newDiv.classList.add("region_button_container");
                            baseCarousel.appendChild(newDiv);
                        }

                        break;
                    
                    case ("mods"):
                        if (modButtonArray.length % 6 == 0) {
                            divIndex++;
                            modSlideNumMax++;
                            var newDiv = document.createElement("div");
                            newDiv.classList.add("region_button_container");
                            modCarousel.appendChild(newDiv);
                        }

                        break;
                    
                    case ("msc"):
                        if (mscButtonArray.length % 6 == 0) {
                            divIndex++;
                            mscSlideNumMax++;
                            var newDiv = document.createElement("div");
                            newDiv.classList.add("region_button_container");
                            mscCarousel.appendChild(newDiv);
                        }

                        break;
                
                    case ("watch"):
                        if (watchButtonArray.length % 6 == 0) {
                            divIndex++;
                            watchSlideNumMax++;
                            var newDiv = document.createElement("div");
                            newDiv.classList.add("region_button_container");
                            watchCarousel.appendChild(newDiv);
                        }

                        break;
                }

                // creating a button
                var newRegionButton = document.createElement("button");
                newRegionButton.classList.add("region_button");

                // styling
                newRegionButton.style.backgroundImage = `url(${region.background})`;
                newRegionButton.innerText = region.name;
                newRegionButton.style.color = `${region.color}`;
                newRegionButton.style.border = `0.3vw solid`;

                // adding song snippets for when you hover over buttons using howler (if the button has one)
                if (region.preview != "N/A") {
                    var songPreview =  new Howl({
                        src: [region.preview, "sounds.mp3"],
                        loop: true,
                        onplay: () => {songPreview.fade(0, 1, 1000)},
                        onstop: () => {isFadingOut = false}
                    })
                }

                regionButtonContainer[divIndex].appendChild(newRegionButton);

                // giving each button hover events
                newRegionButton.onmouseover = () => {
                    // making the button glow
                    newRegionButton.style.boxShadow = `0vw 0vw 1.3vw 0.4vw ${region.color}99`;

                    // fading in the song preview
                    if (region.preview != "N/A" && canPlay && !loadingRegion && previewsOn) {
                        // first checking if another preview is currently trying to fade out
                        if (isFadingOut) {
                            // if so, stop it
                            currentPreviewPlaying.stop()
                            clearTimeout(fadeCheck);
                            isFadingOut = false;
                        }
                        
                        // if we're not fading out and the current songPreview isn't playing,
                        if (!isFadingOut && !songPreview.playing() && !loadingRegion && previewsOn) {
                            songPreview.play()
                            currentPreviewPlaying = songPreview
                        }
                    }
                }

                newRegionButton.onmouseout = () => {
                    // removing the glow
                    newRegionButton.style.boxShadow = "";

                    // fading out the song preview
                    if (region.preview != "N/A" && canPlay) {
                        isFadingOut = true;
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
            }

            // setting the carousel screen
            baseCarousel.scrollLeft = storedBaseSlide
            modCarousel.scrollLeft = storedModSlide
            mscCarousel.scrollLeft = storedMscSlide
            watchCarousel.scrollLeft = storedWatchSlide

            // these variables handle setting carrot button status based on what screen we got sent to
            var atMidOfBaseCarousel = storedBaseSlide > 0 && storedBaseSlide < baseCarousel.scrollLeftMax,
                atMidOfModCarousel = storedModSlide > 0 && storedModSlide < modCarousel.scrollLeftMax,
                atMidOfMscCarousel = storedMscSlide > 0 && storedMscSlide < mscCarousel.scrollLeftMax,
                atMidOfWatchCarousel = storedWatchSlide > 0 && storedWatchSlide < watchCarousel.scrollLeftMax;
            
            var atStartOfBaseCarousel = storedBaseSlide == 0,
                atStartOfModCarousel = storedModSlide == 0,
                atStartOfMscCarousel = storedMscSlide == 0,
                atStartOfWatchCarousel = storedWatchSlide == 0;
            
            var atEndOfBaseCarousel = storedBaseSlide == baseCarousel.scrollLeftMax,
                atEndOfModCarousel = storedModSlide == modCarousel.scrollLeftMax,
                atEndOfMscCarousel = storedMscSlide == mscCarousel.scrollLeftMax,
                atEndOfWatchCarousel = storedWatchSlide == watchCarousel.scrollLeftMax;

            switch (selectionState) {
                case ("base"):
                    
                    // if on the first slide,
                    if (atStartOfBaseCarousel) {
                        switchToBright(carrotButtons[1]);
                        switchToDark(carrotButtons[0]);
                    }

                    // if in the middle, 
                    if (atMidOfBaseCarousel) {
                        switchToBright(carrotButtons[0], carrotButtons[1])
                    }

                    // if on the last slide,
                    if (atEndOfBaseCarousel) {
                        switchToBright(carrotButtons[0]);
                        switchToDark(carrotButtons[1]);
                    }

                    // finally, determining the scroll distance
                    var scrollDistance = baseCarousel.getBoundingClientRect().width;
                    break;
                
                // likewise logic for the rest of the categories
                case ("mods"):
                    if (atStartOfModCarousel) {
                        switchToBright(carrotButtons[1]);
                        switchToDark(carrotButtons[0]);
                    }

                    if (atMidOfModCarousel) {
                        switchToBright(carrotButtons[0], carrotButtons[1])
                    }

                    if (atEndOfModCarousel) {
                        switchToBright(carrotButtons[0]);
                        switchToDark(carrotButtons[1]);
                    }

                    var scrollDistance = modCarousel.getBoundingClientRect().width;
                    break;
                
                case ("msc"):
                    if (atStartOfMscCarousel) {
                        switchToBright(carrotButtons[1]);
                        switchToDark(carrotButtons[0]);
                    }

                    if (atMidOfMscCarousel) {
                        switchToBright(carrotButtons[0], carrotButtons[1])
                    }

                    if (atEndOfMscCarousel) {
                        switchToBright(carrotButtons[0]);
                        switchToDark(carrotButtons[1]);
                    }

                    var scrollDistance = mscCarousel.getBoundingClientRect().width;
                    break;
                    
                case ("watch"):
                    if (atStartOfWatchCarousel) {
                        switchToBright(carrotButtons[1]);
                        switchToDark(carrotButtons[0]);
                    }

                    if (atMidOfWatchCarousel) {
                        switchToBright(carrotButtons[0], carrotButtons[1])
                    }

                    if (atEndOfWatchCarousel) {
                        switchToBright(carrotButtons[0]);
                        switchToDark(carrotButtons[1]);
                    }

                    var scrollDistance = watchCarousel.getBoundingClientRect().width;
                    break;
            }
            
            carrotButtons[0].onclick = () => { // left carrot button
                if (!clickOnTimeout) {
                    setClickTimout();
                    
                    // this switch checks to see what carousel we're trying to move
                    switch (selectionState) {
                        case ("base"):
                            // switching the right slde button back on if we are moving off of the last page
                            if (baseSlideNum == baseSlideNumMax) {
                                switchToBright(carrotButtons[1]);
                            }

                            // moving the slide
                            baseCarousel.scrollLeft -= scrollDistance;

                            // decreasing the slide number if its not already at 1
                            if (baseSlideNum > 1) {
                                baseSlideNum--;
                                slideNum.innerText = `${baseSlideNum}.`;
                            }

                            // switching the left carrot button off if we're on the first slide
                            if (baseSlideNum == 1) {
                                switchToDark(carrotButtons[0])
                            };

                            break;
                        
                        // likewise logic
                        case ("mods"):
                            if (modSlideNum == modSlideNumMax) {
                                switchToBright(carrotButtons[1]);
                            }

                            modCarousel.scrollLeft -= scrollDistance;

                            if (modSlideNum > 1) {
                                modSlideNum--;
                                slideNum.innerText = `${modSlideNum}.`;
                            }

                            if (modSlideNum == 1) {
                                switchToDark(carrotButtons[0])
                            }
                            
                            break;
                        
                        case ("msc"):
                            if (mscSlideNum == mscSlideNumMax) {
                                switchToBright(carrotButtons[1]);
                            }

                            mscCarousel.scrollLeft -= scrollDistance;

                            if (mscSlideNum > 1) {
                                mscSlideNum--;
                                slideNum.innerText = `${mscSlideNum}.`;
                            }

                            if (mscSlideNum == 1) {
                                switchToDark(carrotButtons[0])
                            }
                            
                            break;
                            
                        case ("watch"):
                            if (watchSlideNum == watchSlideNumMax) {
                                switchToBright(carrotButtons[1]);
                            }

                            watchCarousel.scrollLeft -= scrollDistance;

                            if (watchSlideNum > 1) {
                                watchSlideNum--;
                                slideNum.innerText = `${watchSlideNum}.`;
                            }

                            if (watchSlideNum == 1) {
                                switchToDark(carrotButtons[0])
                            }
                            
                            break;
                    }
                }
            }

            carrotButtons[1].onclick = () => { // right carrot button
                if (!clickOnTimeout) {
                    setClickTimout();
                    switch (selectionState) {
                        case ("base"):
                            if (baseSlideNum == 1) {
                                switchToBright(carrotButtons[0]);
                            }

                            baseCarousel.scrollLeft += scrollDistance;

                            if (baseSlideNum < baseSlideNumMax) {
                                baseSlideNum++;
                                slideNum.innerText = `${baseSlideNum}.`;
                            }
                            
                            if (baseSlideNum == baseSlideNumMax) {
                                switchToDark(carrotButtons[1]);
                            }
                            
                            break;
                        
                        case ("mods"):
                            if (modSlideNum == 1) {
                                switchToBright(carrotButtons[0]);
                            }

                            modCarousel.scrollLeft += scrollDistance;

                            if (modSlideNum < modSlideNumMax) {
                                modSlideNum++;
                                slideNum.innerText = `${modSlideNum}.`;
                            }
                            
                            if (modSlideNum == modSlideNumMax) {
                                switchToDark(carrotButtons[1])
                            }

                            break;
                        
                        case ("msc"):
                            if (mscSlideNum == 1) {
                                switchToBright(carrotButtons[0]);
                            }

                            mscCarousel.scrollLeft += scrollDistance;

                            if (mscSlideNum < mscSlideNumMax) {
                                mscSlideNum++;
                                slideNum.innerText = `${mscSlideNum}.`;
                            }
                            
                            if (mscSlideNum == mscSlideNumMax) {
                                switchToDark(carrotButtons[1])
                            }

                            break;
                    
                        case ("watch"):
                            if (watchSlideNum == 1) {
                                switchToBright(carrotButtons[0]);
                            }

                            watchCarousel.scrollLeft += scrollDistance;

                            if (watchSlideNum < watchSlideNumMax) {
                                watchSlideNum++;
                                slideNum.innerText = `${watchSlideNum}.`;
                            }
                            
                            if (watchSlideNum == watchSlideNumMax) {
                                switchToDark(carrotButtons[1])
                            }

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
        previewCooldown = setTimeout(() => {canPlay = true}, 1000)
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

            // defining variables
            layerSoloed = false;
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
            // changing the title of the page
            document.title = `Threatmixer - ${regionChosen.name}`;
            
            // setting the header to the region's name
            regionTitle.innerText = regionData[regionIndex].name

            // managing layerButtonContainer width based on how many layers there are
            switch (regionIndex) {
                case 0: // chimney canopy
                    layerButtonContainer.style.width = "52vw";
                    altColorNeeded = true;
                    break;
                
                case 9: // metroplis
                    layerButtonContainer.style.width = "58vw";
                    altColorNeeded = true;
                    break;

                case 14: // aether ridge
                    layerButtonContainer.style.width = "56vw";
                    altColorNeeded = false;
                    break;
                
                case 16: // coral caves
                    layerButtonContainer.style.width = "56vw";
                    altColorNeeded = true;
                    break;

                case 21: // stormy coast
                    layerButtonContainer.style.width = "56vw";
                    altColorNeeded = true;
                    break;
                
                case 31: // far shore
                    layerButtonContainer.style.width = "100%";
                    altColorNeeded = false;
                    farShoreSelected = true;
                    break;

                case 36: // luminous cove
                    layerButtonContainer.style.width = "65vw";
                    altColorNeeded = true;
                    break;
                
                case 38: // moss fields
                    layerButtonContainer.style.width = "62vw";
                    altColorNeeded = true;
                    break;

                default: // if none of these things were selected
                    layerButtonContainer.style.width = "100%";
                    altColorNeeded = false;
                    break;
            }

            // storing the color changes we'll need based on the chosen region
            if (altColorNeeded) {
                var altColor = regionChosen.altColor;
                var altFilter = regionChosen.altFilter;
            }
            var pageStyle = regionChosen.color;
            var iconFilter = regionChosen.filter;

            // here, we dynamically create as many buttons and sounds as we need based on what's in the json
            regionChosen.layers.forEach((layer, index) => {

                // creating a div to hold each of the buttons
                var newDiv = document.createElement("div");
                newDiv.classList.add("layer_options");

                // creating the layer and solo buttons
                var newLayerButton = document.createElement("button"); 
                newLayerButton.classList.add("layer_button", "layer_button_darkened");
                newLayerButton.style.border = `0.16vw solid ${pageStyle}`;
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

                // creating a solo button
                var newSoloButton = document.createElement("button");
                newSoloButton.classList.add("solo_button", "darken_button");
                newSoloButton.style.border = `0.16vw solid ${pageStyle}`;
                newSoloButton.dataset.title = "Solo Layer (Mute Others)";

                // creating the icons to put in each button
                var newLayerIcon = document.createElement("img");
                newLayerIcon.classList.add("button_icon");

                // EASTER EGG 1
                if (regionIndex == 29 && layer[1].includes("JUG.ogg")){
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

                newLayerIcon.style.filter = `${iconFilter}`;

                var newSoloIcon = document.createElement("img");
                newSoloIcon.classList.add("button_icon", "solo_button_icon");
                newSoloIcon.src = soloIcon1;
                newSoloIcon.style.filter = `${iconFilter}`;

                // applying alternate colors to buttons if needed
                var tippyStyle = "dynamic-style";

                if ((altColorNeeded && regionIndex == 0 && layerButtons.length > 7) || // chimney canopy
                    (altColorNeeded && regionIndex == 9 && layerButtons.length > 8) || // metropolis
                    (altColorNeeded && regionIndex == 16 && layerButtons.length > 8) ||  // coral caves
                    (altColorNeeded && regionIndex == 21 && layerButtons.length > 13) ||  // stormy coast
                    (altColorNeeded && regionIndex == 36 && layerButtons.length < 10) || // luminous cove
                    (altColorNeeded && regionIndex == 38 && layerButtons.length > 8)) { // moss fields
                    tippyStyle = "alt-dynamic-style"
                    newLayerButton.classList.replace("layer_button_darkened", "alt_layer_button_darkened")
                    newLayerButton.style.border = `0.16vw solid ${altColor}`;
                    newSoloButton.style.border = `0.16vw solid ${altColor}`;
                    newLayerIcon.style.filter = `${altFilter}`;
                    newSoloIcon.style.filter = `${altFilter}`;
                }

                // creating a pop-up tip for each button
                createTippy(newLayerButton, tippyStyle, layerName, true);
                createTippy(newSoloButton, tippyStyle, newSoloButton.dataset.title, false);
                layerNameArray.push(layerName);

                // adding our new elements onto the page
                newLayerButton.appendChild(newLayerIcon);
                newSoloButton.appendChild(newSoloIcon);
                newDiv.appendChild(newLayerButton);
                newDiv.appendChild(newSoloButton);
                layerButtonContainer.appendChild(newDiv);
            
                // storing audio files
                regionThreatLayers.push(new Audio(layer[1])); 
            });

            // creating more style changes for classes
            var styleChanges = document.createElement("style");
            styleChanges.textContent = `
            #exit_button, #region_name, #visualizer_toggle, .other_buttons, #timer, #fade_button {
                color: ${pageStyle};
            }

            #exit_button, #visualizer_toggle, #timer_container, .other_buttons, #fade_button, #timer_container {
                border: 0.16vw solid ${pageStyle};
            }

            .layer_button_brightened {
                box-shadow: 0vw 0vw 1.3vw 0.4vw ${pageStyle}99;
            }

            .alt_layer_button_brightened {
                box-shadow: 0vw 0vw 1.3vw 0.4vw ${altColor}99;
            }

            .other_button_icons {
                filter: ${iconFilter};
            }

            progress::-moz-progress-bar {
                background-color: ${pageStyle};
            }

            progress::-webkit-progress-value {
                background-color: ${pageStyle};
            }

            .tippy-box[data-theme~="dynamic-style"] {
                color: ${pageStyle};
                border: 0.2vw solid ${pageStyle};
            }

            .tippy-box[data-theme~="alt-dynamic-style"] {
                color: ${altColor};
                border: 0.2vw solid ${altColor};
            }
            `;
            
            // adding these changes
            document.head.appendChild(styleChanges);

            // changing the background image depending on the region
            
            /* Potentially scrapping this
            var backgroundGradient = `linear-gradient(to bottom,rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%)`;
            var backgroundImage = `url(${regionChosen.background}) center/cover no-repeat`;
            musicScreen.style.background = `${backgroundGradient}, ${backgroundImage}`;
            */
            
            musicScreen.style.backgroundImage = `url(${regionChosen.background})`;

            // changing the color of the visualizer
            canvasContext.fillStyle = `${pageStyle}`;
            canvasContext.strokeStyle = `${pageStyle}`;

            // once this has all been done, move onto the next step
            resolve(); 
        }
    }
}