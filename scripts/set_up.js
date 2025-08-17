/*
Here, miscellaneous processes, including those for the home screen, can be found
*/

let deviceName = navigator.userAgent,
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
    regionButton = document.getElementsByClassName("region_button"),
    selectionScreen = document.getElementById("selection_screen"),
    name2 = document.getElementById("name2"),
    bird = document.getElementById("bird"),
    menuMusicToggleButton = document.getElementById("menu_music_toggle_button"),
    menuMusicToggleIcon = document.getElementById("menu_music_toggle_icon"),
    discordButton = document.getElementById("discord_button"),
    githubButton = document.getElementById("github_button"),
    loadingText = document.getElementById("loading_text"),
    loadingDetails = document.getElementById("loading_details"),
    loadingErrorResponse = document.getElementById("loading_error_response"),
    elementsNeedingOtherTippy = document.getElementsByClassName("needs_other_tippy_style");

const selectionHeader = document.getElementById("selection_header"), // selection screen
    baseButton = document.getElementById("base_button"),
    moddedButton = document.getElementById("modded_button"),
    mscButton = document.getElementById("downpour_button"),
    watchButton = document.getElementById("watcher_button"),
    customButton = document.getElementById("custom_button"),
    baseCarousel = document.getElementById("base_carousel"),
    modCarousel = document.getElementById("mod_carousel"),
    mscCarousel = document.getElementById("downpour_carousel"),
    watchCarousel = document.getElementById("watcher_carousel"),
    customCarousel = document.getElementById("custom_carousel"),
    carrotButtons = document.getElementsByClassName("carrot_buttons"),
    regionButtonContainer = document.getElementsByClassName("region_button_container"),
    slideNum = document.getElementById("slide_number"),
    selectionBackButton = document.getElementById("selection_back_button"),
    previewToggleButton = document.getElementById("preview_toggle_button"),
    previewToggleIcon = document.getElementById("preview_toggle_icon"),
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
let menuMusicTimeout, // misc/home screen
    canBounce = true,
    menuMusicEnabled = false,
    tippyLayerNames = [],
    volumeSliders = [];

const brightened = "brightness(100%)", // selection screen
    dimmed = "brightness(50%)",
    unmute = 1,
    mute = 0,
    soloIcon1 = "assets/images/button_icons/solo_icon_1.png",
    soloIcon2 = "assets/images/button_icons/solo_icon_2.png";
let regionThreatLayers, hoverCheck, currentPreviewPlaying,
    divIndex = -1,
    baseSlideNum = 1,
    baseSlideNumMax = 0,
    storedBaseSlide = 0, 
    modSlideNum = 1,
    modSlideNumMax = 0,
    storedModSlide = 0,
    mscSlideNum = 1,
    mscSlideNumMax = 0,
    storedMscSlide = 0,
    watchSlideNum = 1,
    watchSlideNumMax = 0,
    storedWatchSlide = 0,
    customSlideNum = 1,
    customSlideNumMax = 0,
    storedCustomSlide = 0,
    houseCount = 0,
    farShoreSelected = false,
    menuMusicPlaying = false,
    clickOnTimeout = false,
    regionButtonClicked = false,
    previewIsFadingOut = false,
    previewCanPlay = false,
    loadingRegion = false,
    previewsOn = true,
    selectionState = "base";

const percentConversion = 100; // music screen
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
const hiddenElements = [loadingScreen, musicScreen, selectionScreen,
    modCarousel, mscCarousel, watchCarousel, customCarousel]

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
                aboutButton.onclick = () => {
                    MDAndButtonContainer.style.visibility = "visible";
                    MDAndButtonContainer.style.opacity = "1";
                    MDContainer.scrollTop = 0
                };
                break;

            case ("TUTORIAL.md"):
                helpButton.onclick = () => {
                    MDAndButtonContainer.style.visibility = "visible"
                    MDAndButtonContainer.style.opacity = "1";
                    MDContainer.scrollTop = 0
                };
                break;

            case ("LICENSE.md"):
                creditsButton.onclick = () => {
                    MDAndButtonContainer.style.visibility = "visible"
                    MDAndButtonContainer.style.opacity = "1";
                    MDContainer.scrollTop = 0
                };
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
    storedBaseSlide = 0;
    storedModSlide = 0;
    storedMscSlide = 0;
    storedWatchSlide = 0;
    storedCustomSlide = 0;
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
githubButton.style.setProperty("--left-distance", "6.5vw");

// menu music handling
let menuMusic = new Howl({
    src: "assets/music/misc/menu_music.mp3",
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
        var squeak = new Audio("assets/music/music_snippets/squeak.wav")
        squeak.play()
        canBounce = false;

        setTimeout(() => {
            bird.style.display = "none";
            bird.style.animation = "";
            canBounce = true;
        }, 2000)
    }
}

// MISC FUNCTIONS
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