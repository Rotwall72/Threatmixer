/*
Here, miscellaneous processes, including those for the home screen, can be found
*/

// first figuring out if the user is using a mobile device
const deviceName = navigator.userAgent,
    mobileNames = /android|iphone|kindle|ipad/i,
    isMobileDevice = mobileNames.test(deviceName);

// element refrences
const aboutButton = document.getElementById("about_button"), // misc/home screen
    helpButton = document.getElementById("help_button"),
    creditsButton = document.getElementById("credits_button"),
    feedbackButton = document.getElementById("feedback_button"),
    musicScreen = document.getElementById("music_screen"),
    loadingScreen = document.getElementById("loading_screen"),
    homeScreen = document.getElementById("home_screen"),
    screenCover = document.getElementById("screen_cover"),
    selectionScreen = document.getElementById("selection_screen"),
    name2 = document.getElementById("name2"),
    bird = document.getElementById("bird"),
    menuMusicToggleButton = document.getElementById("menu_music_toggle_button"),
    menuMusicToggleIcon = document.getElementById("menu_music_toggle_icon"),
    discordButton = document.getElementById("discord_button"),
    githubButton = document.getElementById("github_button"),
    loadingText = document.getElementById("loading_text"),
    loadingDetails = document.getElementById("loading_details"),
    errorResponses = document.getElementsByClassName("error_responses"),
    elementsNeedingOtherTippy = document.getElementsByClassName("needs_other_tippy_style");

const regionButtonContainer = document.getElementById("region_button_container"), // selection screen
    regionButtons = document.getElementsByClassName("region_button"),
    buttonOverflow = document.getElementById("button_overflow"),
    selectionBackButton = document.getElementById("selection_back_button"),
    previewToggleButton = document.getElementById("preview_toggle_button"),
    previewToggleIcon = document.getElementById("preview_toggle_icon"),
    searchBar = document.getElementById("search_bar"),
    searchOptions = document.getElementById("search_options"),
    searchDropdownOptions = document.getElementsByClassName("search_dropdown_options"),
    filterOptions = document.getElementsByClassName("filter_options"),
    filterLabels = document.getElementsByClassName("filter_labels"),
    showAllButton = document.getElementById("show_all_button"),
    hideAllButton = document.getElementById("hide_all_button"),
    groupInfo = document.getElementById("group_info"),
    layerInfo = document.getElementById("layer_info"),
    musicCreditsInfo = document.getElementById("music_credits_info"),
    regionCreditsInfo = document.getElementById("region_credits_info"),
    artCreditsInfo = document.getElementById("art_credits_info"),
    regionTitle = document.getElementById("region_name");

const layerButtons = document.getElementsByClassName("layer_button"), // music screen
    soloButtons = document.getElementsByClassName("solo_button"),
    otherButtons = document.getElementsByClassName("other_buttons"),
    otherButtonIcons = document.getElementsByClassName("other_button_icons"),
    pauseButton = document.getElementById("pause_button"),
    pauseIcon = pauseButton.querySelector("img"),
    playAllButton = document.getElementById("play_button"),
    playAllIcon = playAllButton.querySelector("img"),
    startButton = document.getElementById("start_button"),
    recordButton = document.getElementById("record_button"),
    recordIcon = recordButton.querySelector("img"),
    saveButton = document.getElementById("save_button"),
    deleteButton = document.getElementById("delete_button"),
    beginButton = document.getElementById("begin_button"),
    exitButton = document.getElementById("exit_button"),
    visButton = document.getElementById("visualizer_toggle"),
    fadeToggleButton = document.getElementById("fade_toggle"),
    fadeToggleIcon = document.getElementById("fade_toggle_icon"),
    visIcon = visButton.querySelector("img"),
    fadeDurationSliders = document.getElementsByClassName("fade_duration_sliders"),
    layerButtonContainer = document.getElementById("layer_button_container"),
    progressBar = document.getElementById("progress_bar"),
    timer = document.getElementById("timer"),
    canvas = document.getElementById("canvas"),
    settingsButton = document.getElementById("settings_button"),
    settingsContainer = document.getElementById("settings_container"),
    volumeResetButton = document.getElementById("volume_reset_button"),
    masterVolumeSlider = document.getElementById("master_volume_slider"),
    sliders = document.getElementsByClassName("sliders");

// globals
const linkPrefix = "https://raw.githubusercontent.com/Rotwall72/Threatmixer-Audio-Storage/main/"; // misc/home screen
let menuMusicTimeout, 
    canBounce = true,
    menuMusicEnabled = false,
    tippyLayerNames = [],
    volumeSliders = [];

let regionThreatLayers, hoverCheck, previousPreview, // selection screen
    noRegionsText, favFilterLabel,
    houseCount = 0,
    storedScrollPosition = buttonOverflow.scrollTop,
    farShoreSelected = false,
    menuMusicPlaying = false,
    clickOnTimeout = false,
    regionButtonClicked = false,
    previewCanPlay = false,
    loadingRegion = false,
    regionCountFinished = false,
    favoriteButtonCicked = false,
    failsafesDone = false,
    previewsOn = getLocalItem("previewsOn"),
    excludeList = [],
    favoritedArray = getLocalItem("favorites");

const percentConversion = 100, // music screen
    brightened = "brightness(100%)",
    dimmed = "brightness(50%)",
    unmute = 1,
    mute = 0,
    soloIcon1 = "assets/images/button_icons/solo_icon_1.png",
    soloIcon2 = "assets/images/button_icons/solo_icon_2.png";
let songSoloed, songStarted, eraseRecording, loadedLayers, 
    layersPlaying, startingLayers, recordedData, songDuration, 
    barUpdateInterval, fadeCheck, instanceSongLength,
    masterMultiplier = 1,
    globalDuration = 9999999,
    recorderQueued = false,
    visActive = false,
    layersCanFade = false,
    timerExists = false,
    songPaused = false,
    beenFound = false,
    pendingFadeIns = [],
    pendingFadeOuts = [],
    layerNameArray = [];

// hiding certain screens for cleaner page startup
const hiddenElements = [loadingScreen, musicScreen, selectionScreen];

// hiding all other screens and only showing the home screen first
hideScreen(selectionScreen, musicScreen, loadingScreen);
showScreen(homeScreen);

hiddenElements.forEach((element) => {
    element.style.display = "none";
})
screenCover.addEventListener("click", () => {screenCover.style.display = "none";})
settingsContainer.style.opacity = "0";

// unhiding the other screens once they've been flattened
setTimeout(() => {
    loadingScreen.style.display = "flex";
    musicScreen.style.display = "flex";
    selectionScreen.style.display = "flex";
}, 300);

// markdown file handling
const MDArray = ["README.md", "TUTORIAL.md", "LICENSE.md"];
let MDArrayIndex = 0;

MDArray.forEach((file) => {
    fetch(file).then((rawMD) => {    
        return rawMD.text();
    }).then((MDText) => {
        // adding the containers
        var MDAndButtonContainer = document.createElement("div");
        MDAndButtonContainer.classList.add("markdown_and_back_container")
        document.body.appendChild(MDAndButtonContainer);
        MDAndButtonContainer.style.visibility = "hidden";
        MDAndButtonContainer.style.opacity = "0";

        var MDContainer = document.createElement("div");
        MDContainer.classList.add("markdown_container")
        MDAndButtonContainer.appendChild(MDContainer);

        // putting the md text into the MDContainer
        MDContainerContent = marked.parse(MDText);
        MDContainer.innerHTML = MDContainerContent

        // adding a back button
        var backButton = document.createElement("button");
        backButton.classList.add("back_button")
        backButton.innerText = "X";
        backButton.onclick = () => {
            MDAndButtonContainer.style.visibility = "hidden";
            MDAndButtonContainer.style.opacity = "0";
        };
        MDAndButtonContainer.appendChild(backButton);

        // applying classes and other changes to elements within the markdown
        MDContainer.querySelectorAll("img").forEach((element) => {
            element.classList.add("markdown_img")
            
            if (element.alt == "Button Icon") {
                element.classList.add("markdown_button_img");
                element.parentElement.classList.add("markdown_button_img_container")
            }
        })

        // taking the links and applying attributes to them
        MDContainer.querySelectorAll("a").forEach((element) => {
            element.classList.add("markdown_link");
            element.target = "_blank";
        });

        // giving each file their respective class and button
        switch (file) {
            case ("README.md"):
                defineMarkdownOnclick(aboutButton, MDAndButtonContainer, MDContainer);
                break;

            case ("TUTORIAL.md"):
                defineMarkdownOnclick(helpButton, MDAndButtonContainer, MDContainer);
                break;

            case ("LICENSE.md"):
                defineMarkdownOnclick(creditsButton, MDAndButtonContainer, MDContainer);
                break;
        }

        MDArrayIndex++;
    })
})

menuMusicToggleButton.onclick = () => {
    menuMusicEnabled = !menuMusicEnabled

    if (!menuMusicEnabled) {
        if (menuMusicPlaying) {menuMusic.stop()}
        clearTimeout(menuMusicTimeout);
        menuMusicToggleIcon.src = "assets/images/button_icons/menu_music_disabled_icon.png";
        updateTippyContent(menuMusicToggleButton, "Menu Music Toggle (Off)");
    }
    else {
        menuMusic.play()
        menuMusicToggleIcon.src = "assets/images/button_icons/menu_music_enabled_icon.png";
        updateTippyContent(menuMusicToggleButton, "Menu Music Toggle (On)");
    }
}

beginButton.onclick = () => {
    hideScreen(homeScreen, selectionScreen);
    loadingText.innerText = "Preparing selection screen...";
    showScreen(loadingScreen);
    if (menuMusicPlaying && menuMusicEnabled) {menuMusic.fade(menuMusic.volume(), 0, 3000);}
    clearInterval(menuMusicCheck);
    clearTimeout(menuMusicTimeout);
    runProgram();
}

defineButtonLink(feedbackButton, "https://forms.gle/R7q3uP9jSBQfEmuF8");
defineButtonLink(discordButton, "https://discord.gg/BCU2UbMRBc");
defineButtonLink(githubButton, "https://github.com/Rotwall72/Threatmixer");

// button tips
createTippy(menuMusicToggleButton, menuMusicToggleButton.dataset.title, "#dadbdd");
createTippy(discordButton, discordButton.dataset.title, "#5865f2");
createTippy(githubButton, githubButton.dataset.title, "#f0f6fc");

discordButton.style.setProperty("--border-color", "#5865f2");
discordButton.style.setProperty("--glow-color", "#5865f299");
discordButton.style.setProperty("--left-distance", "1.1vw");
githubButton.style.setProperty("--border-color", "#f0f6fc");
githubButton.style.setProperty("--glow-color", "#f0f6fc99");
githubButton.style.setProperty("--left-distance", "7.1vw");

// menu music handling
let menuMusic = new Howl({
    src: buildAudioSRC("music/misc/menu_music.mp3"),
    loop: true,
    onplay: () => {menuMusicPlaying = true;},
    onstop: () => {menuMusicPlaying = false;}
});

menuMusic.on("volume", () => {if (menuMusic.volume() == mute) {menuMusic.stop()}});

// checking if the menu music can be played
let menuMusicCheck = setInterval(() => {
    const fullHeight = "100%"
    if (homeScreen.style.height == fullHeight && !menuMusicPlaying && menuMusicEnabled) {
        menuMusicPlaying = true;
        menuMusic.volume(0.3);
        menuMusicTimeout = setTimeout(() => {menuMusic.play()}, 2000); // play after 2 seconds
    }
}, 1000)

name2.onclick = () => {
    if (canBounce) {
        bird.style.display = "block";
        bird.style.animation = "bounce 1s ease alternate 2";
        var squeak = new Audio(buildAudioSRC("music/music_snippets/squeak.wav"));
        squeak.play()
        canBounce = false;

        setTimeout(() => {
            bird.style.display = "none";
            bird.style.animation = "";
            canBounce = true;
        }, 2000)
    }
}

// Setting up the preview toggle
createTippy(previewToggleButton, previewToggleButton.dataset.title, "#dadbdd");
if (!previewsOn) {
    previewToggleIcon.src = "assets/images/button_icons/preview_disabled_icon.png";
    updateTippyContent(previewToggleButton, "Preview Toggle (Off)");
}

// MISC FUNCTIONS
function defineMarkdownOnclick(button, parentContainer, childContainer) {
    button.onclick = () => {
        parentContainer.style.visibility = "visible";
        parentContainer.style.opacity = "1";
        childContainer.scrollTop = 0;
    }
}

function switchToBright(...elements) {
    elements.forEach((element) => {
        if (Array.from(layerButtons).includes(element)) {
            element.classList.replace("layer_button_darkened", "layer_button_brightened");
        }

        else {
            element.classList.replace("darken_button", "brighten_button");
        }
    })
}

function switchToDark(...elements) {
    elements.forEach((element) => {
        if (Array.from(layerButtons).includes(element)) {
            if (element.classList.contains("alt_layer_button_brightened")) {
                element.classList.replace("alt_layer_button_brightened", "alt_layer_button_darkened");
            }

            else {
                element.classList.replace("layer_button_brightened", "layer_button_darkened");
            }
        }

        else {
            element.classList.replace("brighten_button", "darken_button");
        }
    })
}

function hideScreen(...screens) {
    screens.forEach((screen) => {
        screen.style.height = "0%";
        var screenContent = screen.querySelectorAll("*");
        screenContent.forEach((element) => {element.style.visibility = "hidden";})
    })
}

function showScreen(...screens) {
    screens.forEach((screen) => {
        screen.style.height = "100%";
        var screenContent = screen.querySelectorAll("*");
        screenContent.forEach((element) => {element.style.visibility = "visible";})
    })
}

// tippys
function createTippy(element, content, color) { 
    // default tippy values
    var theme = "default-style",
        followCursor = true,
        interactive = false,
        placement = "top";
    
    var otherButtonsArray = Array.from(otherButtons),
        layerButtonsArray = Array.from(layerButtons);

    // changing these values based on the element
    if (otherButtonsArray.includes(element) || Array.from(elementsNeedingOtherTippy).includes(element)) {theme = "other-button-style";}
    if (element.tagName == "INPUT") {followCursor = "horizontal"; placement = "bottom";}

    // creating the inside of the layer button tippy
    if (layerButtonsArray.includes(element)) {
        followCursor = false; interactive = true;

        // creating layer button volume sliders
        var layerName = document.createElement("p");
        layerName.innerText = content;
        layerName.classList.add("tippy_layer_name");
        tippyLayerNames.push(layerName);

        var layerVolumeSlider = document.createElement("input");
        layerVolumeSlider.type = "range";
        layerVolumeSlider.min = "0";
        layerVolumeSlider.max = "300";
        layerVolumeSlider.value = "100";
        layerVolumeSlider.classList.add("sliders");
        layerVolumeSlider.style.setProperty("--dynamic-color", color);
        volumeSliders.push(layerVolumeSlider);

        // creating a tippy for the volume slider (tipception)
        createTippy(layerVolumeSlider, `${layerVolumeSlider.value}%`, color);
        layerVolumeSlider.oninput = () => {
            updateTippyContent(layerVolumeSlider, `${layerVolumeSlider.value}%`);

            if (songStarted) {
                var layerIndex = layerButtonsArray.indexOf(element),
                    layer = loadedLayers[layerIndex],
                    newVolume = (layerVolumeSlider.value / 100) * masterMultiplier;

                layer.unmuteValue = newVolume;
                if (!layer.isMuted && !(layer.isFadingIn || layer.isFadingOut)) {layer.volume.gain.value = newVolume};
            }
        }

        var nameAndVolumeDiv = document.createElement("div");
        nameAndVolumeDiv.classList.add("layer_button_tippy_div");
        nameAndVolumeDiv.appendChild(layerName);
        nameAndVolumeDiv.appendChild(layerVolumeSlider);
        content = nameAndVolumeDiv;
    }

    tippy(element, {
        theme: theme,
        content: content,
        trigger: tippyTarget(),
        arrow: false,
        followCursor: followCursor,
        hideOnClick: false,
        interactive: interactive,
        allowHtml: true,
        placement: placement,
        onMount(instance) {
            instance.popper.querySelector(".tippy-box")
            .style.setProperty("--tippy-color", `${color}`)
        }
    });
}

function updateTippyContent(element, content, index = -1) {
    var buttonTip = element._tippy;
    var isLayerButton = Array.from(layerButtons).includes(element);

    if (isLayerButton) {tippyLayerNames[index].innerText = content + element.dataset.title;}
    else {buttonTip.setContent(content);}
}

function tippyTarget() {
    if (isMobileDevice) {return "focus";}
    else {return "mouseenter";}
}

function defineButtonLink(button, src) {
    button.onclick = () => {
        var link = document.createElement("a");
        link.href = src;
        link.target = "blank_";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function buildAudioSRC(pathing) {
    return linkPrefix + pathing;
}

function getLocalItem(item) {
    switch (item) {
        case ("favorites"):
            const returnedArray = localStorage.getItem(item);
            if (returnedArray === null) {return [];}
            return JSON.parse(returnedArray); 
        case ("previewsOn"):
            const returnedBool = localStorage.getItem(item);
            if (returnedBool === null) {return true;}
            return returnedBool === "true";
        default:
            return null;
    }
}