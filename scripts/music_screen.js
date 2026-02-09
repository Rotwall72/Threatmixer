/*
Here you'll find the code which handles the functionality of the "music screen",
which is where the user is sent upon selecting their region.
*/

// RECORDER SET UP
let audioContext = new (window.AudioContext || window.webkitAudioContext);
const oscillator = audioContext.createOscillator();
oscillator.type = "sine";
oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
const oscillatorDestination = audioContext.createMediaStreamDestination();
oscillator.connect(oscillatorDestination);

let mime;
if (MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
    mime = {mimeType: 'audio/ogg; codecs=opus'};
}
else if (MediaRecorder.isTypeSupported("audio/webm; codecs=opus")) {
    mime = {mimeType: "audio/webm; codecs=opus"}
} 
else {
    mime = {mimeType: ''};
}

const recorder = new MediaRecorder(oscillatorDestination.stream, mime);
recorder.ondataavailable = (noise) => {recordedData.push(noise.data);}

// turning the recorder's data into a file
const filePrompt = `Please enter a name for this recording: 
(NOTE: If you are using a web browser that isn't Firefox, then the resulting file may not have any metadata. See the HELP section on the home screen for more info.)`
recorder.onstop = () => {
    if (eraseRecording) {
        recordedData = [];
        eraseRecording = false;
    }

    else {
        songTimer.pause()
        pauseButton.click()
        var audioFile = new Blob(recordedData, {"type": recorder.mimeType}),
            fileUrl = URL.createObjectURL(audioFile),
            link = document.createElement("a");
        link.href = fileUrl;
        fileName = prompt(filePrompt);
        link.download = fileName + ".ogg";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileUrl);
        recordedData = [];
        songTimer.pause()
        pauseButton.click()
    }
}

// VISUALIZER SET UP
const visualizer = audioContext.createAnalyser();
visualizer.fftSize = 512;
const bufferLength = visualizer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const barWidth = 3;
canvas.width = barWidth * bufferLength;
const canvasContext = canvas.getContext("2d");
visualizer.fftSize = 512;
canvas.width = barWidth * bufferLength;
canvasContext.imageSmoothingEnabled = false;

function drawLine() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, canvas.height - 2);
    canvasContext.lineWidth = 3;
    canvasContext.stroke();
}

function startVisualizer() {
    visActive = true;

    // all credit goes towards QuickCodingTuts for this code
    // find out more about them and their channel in the LICENSE.md
    function animate() {
        window.requestAnimationFrame(animate);

        var x = 0;
        canvasContext.clearRect(0, 0, canvas.clientWidth, canvas.height);
        visualizer.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            drawLine();
            var rawBarHeight = dataArray[i];
            var dynamicBarHeight = (rawBarHeight / 255) * canvas.height;
            canvasContext.fillRect(x, canvas.height - dynamicBarHeight, barWidth, dynamicBarHeight);
            x += barWidth + 2;
        }
    }

    animate();
}

// BUTTON TIPS
Array.from(otherButtons).forEach((button) => {createTippy(button, button.dataset.title, "#ffffff")});
createTippy(exitButton, exitButton.dataset.title, "#ffffff");
createTippy(settingsButton, settingsButton.dataset.title, "#ffffff");
createTippy(masterVolumeSlider, `${masterVolumeSlider.value}%`, "#ffffff");
masterVolumeSlider.oninput = () => { 
    masterMultiplier = masterVolumeSlider.value / percentConversion;
    updateTippyContent(masterVolumeSlider, `${masterVolumeSlider.value}%`);

    // applying the master volume multiplier
    if (songStarted) {
        loadedLayers.forEach((layer, index) => {
            var newVolume = (volumeSliders[index].value / percentConversion) * masterMultiplier;
            layer.unmuteValue = newVolume;
            if (!layer.isMuted && !(layer.isFadingIn || layer.isFadingOut)) {layer.volume.gain.value = newVolume};
        })
    }
}

Array.from(fadeDurationSliders).forEach((slider) => {
    createTippy(slider, `${slider.value} seconds`, "#ffffff");
    slider.oninput = () => {updateTippyContent(slider, `${slider.value} seconds`);}
});

// FADING
function startLayerFadeIn(layer) {
    const secondsToMilliConversion = 1000,
        fadeInDuration = fadeDurationSliders[0].value,
        fadeDuration = fadeInDuration * secondsToMilliConversion, // in milliseconds
        updateIntervalTime = 30; // increase to reduce the speed at which the interval iterates and vice versa

    if (audioContext.state == "suspended" && songPaused) {
        pendingFadeIns.push(layer);
    }
    else {
        if (layersPlaying.includes(layer)) {
            layer.isFadingIn = true;
            layer.isFadingOut = false;
            layer.isMuted = false;

            var layerIndex = layer.index,
                layerName = layer.name,
                layerButton = layerButtons[layerIndex];
            layerButton.dataset.title = " (Fading In)";
            updateTippyContent(layerButton, layerName, layerIndex);

            var newVolume = layer.volume.gain.value;
            if (layer.fadeInterval != "") {clearInterval(layer.fadeInterval)}

            layer.fadeInterval = setInterval(() => {
                var unmuteValue = layer.unmuteValue,
                    volumeMult = masterMultiplier,
                    volumeInc = (unmuteValue * updateIntervalTime) / fadeDuration;
                
                if (songSoloed && !layer.isSoloed) {volumeMult = 0;}

                if (layer.volume.gain.value < unmuteValue && !layer.isFadingOut) {
                    // only continuing the fade in if the song isn't paused 
                    if (audioContext.state != "suspended" && !songPaused) {
                        newVolume += volumeInc;
                        layer.volume.gain.value = newVolume * volumeMult;
                    }
                }
                else {
                    clearInterval(layer.fadeInterval);
                    layer.isFadingIn = false;
                    layer.volume.gain.value = layer.unmuteValue;

                    layerButton.dataset.title = " (Playing)";
                    updateTippyContent(layerButton, layerName, layerIndex);
                }

                // console.log(layer.volume.gain.value);
            }, updateIntervalTime);
        }
        else {
            layer.isFadingIn = false;
        }
    }
}

function startLayerFadeOut(layer) {
    const secondsToMilliConversion = 1000,
        constMult = 1,
        fadeOutDuration = fadeDurationSliders[1].value,
        fadeDuration = fadeOutDuration * secondsToMilliConversion, // in milliseconds
        updateIntervalTime = 30; // increase to reduce the speed at which the interval iterates and vice versa

    if (audioContext.state == "suspended" && songPaused) {
        pendingFadeOuts.push(layer);
    }
    else {
        layer.isFadingOut = true;
        layer.isFadingIn = false;
        layer.isMuted = true;

        var layerIndex = layer.index,
            layerName = layer.name,
            layerButton = layerButtons[layerIndex];

        layerButton.dataset.title = " (Fading Out)";
        updateTippyContent(layerButton, layerName, layerIndex);
        
        if (layer.fadeInterval != "") {clearInterval(layer.fadeInterval);}
        var newVolume = layer.volume.gain.value;

        layer.fadeInterval = setInterval(() => {
            var unmuteValue = layer.unmuteValue,
                volumeMult = constMult,
                volumeRed = (unmuteValue * updateIntervalTime) / fadeDuration,
                otherLayerIsSoloed = songSoloed && !layer.isSoloed;
                
            if (otherLayerIsSoloed) {volumeMult = 0;}

            if ((layer.volume.gain.value > mute && !layer.isFadingIn) || otherLayerIsSoloed) {
                // only continuing the fade out if the song isn't paused 
                if (audioContext.state != "suspended" && !songPaused) {
                    newVolume -= volumeRed;
                    if (newVolume <= 0) {newVolume = 0;}
                    console.log(newVolume / volumeMult)
                    layer.volume.gain.value = newVolume * volumeMult;
                }
            }
            else if (!songSoloed && newVolume > mute) {
                layer.volume.gain.value = newVolume;
            }
            else {
                clearInterval(layer.fadeInterval);

                layer.isFadingOut = false;
                layer.volume.gain.value = mute;
                layer.isMuted = true; // failsafe
                
                switchToDark(layerButtons[layerIndex]);
                layerButton.dataset.title = " (Muted)";
                updateTippyContent(layerButton, layerName, layerIndex);
            }
        }, updateIntervalTime);
    }
}

// layer constructor
class Layer {
    constructor(bufferSource, gainNode, unmuteValue, index, isFadingIn, isFadingOut, isMuted, isSoloed, name, fadeInterval = "") {
        this.bufferSource = bufferSource;
        this.volume = gainNode;
        this.unmuteValue = unmuteValue;
        this.index = index,
        this.isFadingIn = isFadingIn;
        this.isFadingOut = isFadingOut;
        this.isMuted = isMuted;
        this.isSoloed = isSoloed;
        this.name = name;
        this.fadeInterval = fadeInterval;
    }
}

// PRIMARY FUNCTIONALITY
function setUpMusicScreen() {
    // loading screen handling
    var processingProgress = 0;
    var processingGoal = regionThreatLayers.length
    updateLoadingInfo(0, processingGoal)

    // event listener for keyboard inputs
    document.onkeydown = (event) => {
        var correspondingIndex;
        const keyPressed = event.key,
            indexToLengthAdjustment = 1,
            keyPressedinKeysArray = keysArray.includes(keyPressed),
            keyPressedinShiftArray = correspondingShiftKeys.includes(keyPressed),
            uppercaseKeyPressed = keysArray.includes(keyPressed.toLowerCase());

        // layer buttons inputs
        if (keyPressedinKeysArray) {
            correspondingIndex = keysArray.indexOf(keyPressed);
            if (correspondingIndex + indexToLengthAdjustment <= layerButtons.length) {
                if (layerNameArray[correspondingIndex] !== "Thanks Snoodle") {
                    layerButtons[correspondingIndex].click();
                }
                else if (beenFound) {
                    layerButtons[correspondingIndex].click();
                }
            };
        }

        // solo buttons inputs
        else if (keyPressedinShiftArray || uppercaseKeyPressed) {
            if (keyPressedinShiftArray) {correspondingIndex = correspondingShiftKeys.indexOf(keyPressed);}
            else if (uppercaseKeyPressed) {correspondingIndex = keysArray.indexOf(keyPressed.toLowerCase());}

            if (correspondingIndex + indexToLengthAdjustment <= soloButtons.length) {
                soloButtons[correspondingIndex].click();
            };
        }

        // option buttons inputs
        else {
            Array.from(otherButtons).forEach((button) => {
                if (keyPressed === button.dataset.correspondingkey) {
                    button.click();
                }
            })
        }
    }

    // error handling
    const oneMinute = 60000; // in ms
    var waitingForError = true;
    var errorListener = setTimeout(() => {
        waitingForError = false;
        errorResponses[0].innerText = "The loading time has been longer than usual. Something may have gone wrong.";
        errorResponses[1].innerText = "Refresh the page and try again. If the issue persists, troubleshoot your connection and/or seek help in our discord.";
        setResponseOpacityandColor("1", "orange");
    }, oneMinute);

    loadSounds = 
        regionThreatLayers.map((audio) => {
            return fetch(audio.src)
                .then((result) => {
                    if (!result.ok) {
                        clearTimeout(errorListener);
                        errorResponses[0].innerText = `An error has occured. Error status: ${result.status}`;
                        errorResponses[1].innerText = "See console for more information. If this is a re-occuring issue, leave a bug report in our discord.";
                        setResponseOpacityandColor("1", "red");
                    }
                    return result.arrayBuffer();
                })     
                .then((arrayBuffer) => {return audioContext.decodeAudioData(arrayBuffer);}) 
                .then((arrayBuffer) => {
                    processingProgress++;
                    updateLoadingInfo(processingProgress, processingGoal);
                    return arrayBuffer;
                });
        });

    Promise.all(loadSounds).then((arrayBuffer) => {
        hideScreen(loadingScreen);
        showScreen(musicScreen);

        if (waitingForError) {clearTimeout(errorListener);}
        setResponseOpacityandColor("0", "white");

        // ensuring that each layer loops at the exact same time
        if (!farShoreSelected) {
            arrayBuffer.forEach((layer) => {
                if (layer.duration < globalDuration) {
                    globalDuration = layer.duration
                }
            });
        }
        else {
            if (farShoreSelected) {
                globalDuration = 63.99999;
                farShoreSelected = false;
            }
        }

        // formatting the timer
        var songLength = () => {
            var roundedDuration = Math.round(globalDuration, 2),
                minutes = Math.floor(roundedDuration / 60),
                seconds = roundedDuration % 60
            
            if (seconds < 10) {seconds = `0${seconds}`}

            return `${minutes}:${seconds}`
        }

        timer.innerText = `00:00 / ${songLength()}`

        instanceSongLength = songLength()

        // if we paused the audioContext, resume it
        if (audioContext.state == "suspended") {audioContext.resume();}

        // using a for loop to check each button for inputs
        for (let i = 0; i < layerButtons.length; i++) {
            // listening for if a layer button has been clicked
            layerButtons[i].onclick = () => {
                if (!songStarted) {
                    // these if statements handle pre-selecting layers
                    // we keep track of what layers have been chosen by simply storing the value of i
                    if (!startingLayers.includes(i)) {
                        layerButtons[i].dataset.title = " (Pre-selected)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], i);
                        startingLayers.push(i);
                        switchToBright(layerButtons[i]);
                    }

                    else {
                        layerButtons[i].dataset.title = " (Muted)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], i);
                        var startingLayerIndex = startingLayers.indexOf(i)
                        startingLayers.splice(startingLayerIndex, 1);
                        switchToDark(layerButtons[i]);
                    }
                }

                // muting and unmuting audio
                else if (!songSoloed) {
                    var layer = loadedLayers[i];

                    if (layer.isMuted) {
                        layer.isMuted = false;
                        layerButtons[i].dataset.title = " (Playing)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], i);
                        layersPlaying.push(layer);
                         
                        if (!layersCanFade) {
                            layer.volume.gain.value = layer.unmuteValue;
                            if (layer.isFadingOut) {
                                layer.isFadingOut = false;
                                clearInterval(layer.fadeInterval);
                            }
                        }
                        else {
                            startLayerFadeIn(layer);
                        }

                        switchToBright(layerButtons[i]);
                    }

                    else {
                        layer.isMuted = true;
                        layerButtons[i].dataset.title = " (Muted)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], i);

                        if (!layersCanFade) {
                            layer.volume.gain.value = mute;
                            if (layer.isFadingIn) {
                                layer.isFadingIn = false;
                                clearInterval(layer.fadeInterval);
                            }
                        }
                        else {startLayerFadeOut(layer);}

                        var indexOfLayer = layersPlaying.indexOf(layer);
                        layersPlaying.splice(indexOfLayer, 1);
                        
                        switchToDark(layerButtons[i]);
                    }
                }

                // controlling start button brightness
                if (!songStarted) {
                    if (startingLayers.length != 0) {
                        switchToBright(startButton);
                    }
                    
                    else {
                        switchToDark(startButton);
                    }
                }
            };

            // solo button functionality
            soloButtons[i].onclick = () => {
                var layer = loadedLayers[i];

                if (!songSoloed && songStarted) {
                    updateTippyContent(soloButtons[i], "Solo Layer (Unmute All Others)");

                    if (layer.isMuted) { // if the layer we're trying to solo is muted,
                        if (layer.isFadingOut) {
                            clearInterval(layer.fadeInterval);
                            layer.isFadingOut = false;
                        }

                        layer.volume.gain.value = layer.unmuteValue;
                        layer.isMuted = false;
                        layersPlaying.push(layer);

                        layerButtons[i].dataset.title = " (Playing)";
                        updateTippyContent(layerButtons[i], layer.name, i);
                        
                        var layerIndex = layer.index;
                        soloButtons[layerIndex].style.filter = brightened;
                        soloButtons[layerIndex].querySelector("img").src = soloIcon2;
                        switchToBright(layerButtons[layerIndex]);
                    }

                    loadedLayers.forEach((currentLayer) => {
                        var currentIndex = currentLayer.index;

                        if (currentLayer != layer) { // if this layer doesn't match the layer we're trying to solo,
                            if (!(currentLayer.isFadingIn || currentLayer.isFadingOut)) { // if this layer is not currently fading in/out
                                currentLayer.volume.gain.value = mute;
                            }
                            currentLayer.isMuted = true;
                            switchToDark(layerButtons[currentIndex]);
                        }

                        else { // if it does,
                            currentLayer.isSoloed = true;
                            soloButtons[currentIndex].style.filter = brightened;
                            soloButtons[currentIndex].querySelector("img").src = soloIcon2;
                        }
                    });
                    songSoloed = true;

                    // darkening every other solo button
                    Array.from(soloButtons).forEach((element) => {
                        if (element != soloButtons[i]) {
                            element.style.removeProperty("filter");
                            switchToDark(element);
                        }
                    })
                }

                // this if statement handles un-soloing the song
                else if (!layer.isMuted) {
                    updateTippyContent(soloButtons[i], "Solo Layer (Mute All Others)");

                    layersPlaying.forEach((playingLayer) => {
                        var playingLayerIndex = playingLayer.index;

                        if (!(playingLayer.isFadingIn || playingLayer.isFadingOut)) { // if this layer is not currently fading in/out
                            playingLayer.volume.gain.value = playingLayer.unmuteValue;
                        }

                        playingLayer.isMuted = false;
                        switchToBright(layerButtons[playingLayerIndex]);
                        soloButtons[playingLayerIndex].style.filter = dimmed;
                        soloButtons[playingLayerIndex].querySelector("img").src = soloIcon1;

                        if (playingLayer.isSoloed) {
                            playingLayer.isSoloed = false;
                        }
                    });

                    songSoloed = false;

                    // brightening every other solo button
                    Array.from(soloButtons).forEach((element) => {
                        if (element != soloButtons[i]) {
                            switchToBright(element);
                        }
                    });
                };
            };
        };

        // start button functionality
        startButton.onclick = () => {
            if (!songStarted && startingLayers.length > 0) {
                prepSong(arrayBuffer);
                songStarted = true;
                switchToDark(startButton);
                updateTippyContent(playAllButton, "End Song");
            }
        };

        // pause button functionality
        pauseButton.onclick = () => {
            if (songStarted && !(audioContext.state == "suspended")) {
                updateTippyContent(pauseButton, "Resume Song & Recording");
                audioContext.suspend();
                songPaused = true;
                if (recorder.state == "recording") {
                    recorder.pause();
                    recordIcon.src = "assets/images/button_icons/rec_paused_icon.png";
                    updateTippyContent(recordButton, "Recording Paused");
                }
                songTimer.pause()
                pauseIcon.src = "assets/images/button_icons/resume_icon.png";
            }

            else if (songStarted) {
                updateTippyContent(pauseButton, "Pause Song & Recording");
                audioContext.resume();
                songPaused = false;
                if (recorder.state == "paused") {
                    recorder.resume();
                    recordIcon.src = "assets/images/button_icons/rec_progress_icon.png";
                    updateTippyContent(recordButton, "Recording...");
                }
                songTimer.pause();
                pauseIcon.src = "assets/images/button_icons/pause_icon.png";

                // starting any fade outs/ins that may have been initiated when the song was paused
                if (pendingFadeIns.length > 0 || pendingFadeOuts.length > 0) {
                    pendingFadeIns.forEach((layer) => {startLayerFadeIn(layer)});
                    pendingFadeIns = []
                    pendingFadeOuts.forEach((layer) => {startLayerFadeOut(layer)});
                    pendingFadeOuts = []
                }
            }
        };

        // play all button functionality
        playAllButton.onclick = () => {
            updateTippyContent(playAllButton, "End Song");

            // checking if the audio context is paused and resuming it if it was
            if (audioContext.state == "suspended") {audioContext.resume();}

            if (!songStarted) { // if we're trying to start all of them,
                songStarted = true;
                prepSong(arrayBuffer);

                // brightening all of the buttons
                Array.from(layerButtons).forEach((element, index) => {
                    if (loadedLayers[index].name != "Thanks Snoodle" || beenFound) {switchToBright(element)};
                });

                // darking the start button
                switchToDark(startButton);

                playAllIcon.src = "assets/images/button_icons/stop_icon.png";
            }
            
            else { // if we're trying to end all of them,
                updateTippyContent(playAllButton, "Play All Layers");

                // clearing AudioBufferSourceNodes and darkening layer buttons
                loadedLayers.forEach((layer) => {
                    var layerIndex = layer.index,
                    layerName = layer.name,
                    layerFadeInterval = layer.fadeInterval;

                    if (layerFadeInterval != "") {clearInterval(layerFadeInterval)}
                    layer.bufferSource.stop();
                    layer.bufferSource.disconnect();

                    switchToDark(layerButtons[layerIndex]);
                    layerButtons[layerIndex].dataset.title = " (Muted)"
                    updateTippyContent(layerButtons[layerIndex], layerName, layerIndex);
                }) 

                // darkening the solo buttons
                Array.from(soloButtons).forEach((element) => {
                    element.style.removeProperty("filter");
                    element.querySelector("img").src = soloIcon1;
                    switchToDark(element);
                });

                // darkening the pause button
                switchToDark(pauseButton);

                // stopping recording if is has started
                if (recorder.state != "inactive") {
                    if (!confirm("Save recording to device?")) {eraseRecording = true;}
                    recorder.stop();
                    updateTippyContent(recordButton, "Start Recording");
                    recordIcon.src = "assets/images/button_icons/rec_icon.png";
                    switchToDark(saveButton, deleteButton);
                }

                // reseting variables and button text
                songSoloed = false;
                songStarted = false;
                loadedLayers = [];
                layersPlaying = [];
                startingLayers = [];
                playAllIcon.src = "assets/images/button_icons/play_all_icon.png";
                pauseIcon.src = "assets/images/button_icons/pause_icon.png";
                stopUpdatingBar();

                // stopping the timer
                songTimer.stop()
                timer.innerText = `00:00 / ${instanceSongLength}`
            }
        };

        // record button functionality
        recordButton.onclick = () => {
            if (recorder.state == "inactive") {
                if (!songStarted) { // if we're trying to que the recording,
                    updateTippyContent(recordButton, "Recording Queued");
                    recorderQueued = true;
                    recordIcon.src = "assets/images/button_icons/rec_pending_icon.png";
                    switchToBright(deleteButton);
                }

                else {
                    updateTippyContent(recordButton, "Recording...");
                    recorder.start();
                    recordIcon.src = "assets/images/button_icons/rec_progress_icon.png"

                    // switching the other buttons on
                    switchToBright(saveButton, deleteButton);
                }
            }
        };

        saveButton.onclick = () => {
            if (recorder.state != "inactive") {
                updateTippyContent(recordButton, "Start Recording");
                recorder.stop();
                recordIcon.src = "assets/images/button_icons/rec_icon.png";

                // switching the other buttons off
                switchToDark(saveButton, deleteButton);
            }
        };

        deleteButton.onclick = () => {
            updateTippyContent(recordButton, "Start Recording");

            if (recorder.state != "inactive" && !recorderQueued) {
                eraseRecording = true;
                recorder.stop();
                updateTippyContent(recordButton, "Start Recording");
                recordIcon.src = "assets/images/button_icons/rec_icon.png";

                // switching the other buttons off
                switchToDark(saveButton, deleteButton);
            }

            else if (recorderQueued && !songStarted) {
                recorderQueued = false;
                recordIcon.src = "assets/images/button_icons/rec_icon.png";

                switchToDark(deleteButton);
            }
        };

        fadeToggleButton.onclick = () => {
            layersCanFade = !layersCanFade

            if (!layersCanFade) {
                fadeToggleIcon.src = "assets/images/button_icons/fade_disabled_icon.png";
                updateTippyContent(fadeToggleButton, "Fade Toggle (Off)");
            }
            else {
                fadeToggleIcon.src = "assets/images/button_icons/fade_enabled_icon.png";
                updateTippyContent(fadeToggleButton, "Fade Toggle (On)");
            }
        };

        visButton.onclick = () => {
            canvas.classList.toggle("hide_canvas")

            if (canvas.classList.contains("hide_canvas")) {
                visIcon.src = "assets/images/button_icons/vis_disabled_icon.png";
                updateTippyContent(visButton, "Visualizer Toggle (Off)");
            }
            else {
                visIcon.src = "assets/images/button_icons/vis_enabled_icon.png";
                updateTippyContent(visButton, "Visualizer Toggle (On)");
            }
        };

        settingsButton.onclick = () => {
            if (settingsContainer.style.opacity == "0") {
                settingsContainer.style.opacity = "1";
                settingsContainer.style.pointerEvents = "inherit";
            }
            else {
                settingsContainer.style.opacity = "0";
                settingsContainer.style.pointerEvents = "none";
            }
        }

        volumeResetButton.onclick = () => {
            volumeSliders.forEach((slider, index) => {
                slider.value = 100;
                updateTippyContent(slider, `${slider.value}%`, false, index);
                if (songStarted) {
                    var layer = loadedLayers[index],
                        newVolume = masterMultiplier;
                    layer.unmuteValue = newVolume;
                    if (!layer.isMuted) {layer.volume.gain.value = newVolume;}
                }
                
            })
        }

        shortcutToggle.oninput = () => {
            var display;
            if (shortcutToggle.checked) {display = "block";}
            else {display = "none";}

            Array.from(keyLabels).forEach((label) => {
                label.style.setProperty("--shortcut-visibility", display);
            })
        }

        exitButton.onclick = () => {
            songStarted = false;
            layersCanFade = false;
            fadeToggleIcon.src = "assets/images/button_icons/fade_disabled_icon.png";
            audioContext.suspend();
            if (recorder.state != "inactive") {
                recorder.stop();
                eraseRecording = true;
            }

            if (audioContext.state == "suspended") {audioContext.resume();}

            stopUpdatingBar();

            for (let i = 0; i < loadedLayers.length; i++) {
                var layer = loadedLayers[i];
                layer.bufferSource.stop();
                layer.bufferSource.disconnect();
            }

            playAllIcon.src = "assets/images/button_icons/play_all_icon.png";
            pauseIcon.src = "assets/images/button_icons/pause_icon.png";
            recordIcon.src = "assets/images/button_icons/rec_icon.png";
            switchToDark(saveButton, deleteButton, pauseButton);

            globalDuration = 9999;
            failsafesDone = false;
            regionButtonClicked = false;
            loadingRegion = false;
            layerNameArray = [];
            tippyLayerNames = [];
            volumeSliders = [];

            settingsContainer.style.opacity = "0";
            settingsContainer.style.pointerEvents = "none";
            layerButtonContainer.innerHTML = "";

            updateTippyContent(playAllButton, "Play All Layers");
            updateTippyContent(pauseButton, "Pause Song & Recording");
            updateTippyContent(recordButton, "Start Recording");
            updateTippyContent(fadeToggleButton, "Fade Toggle (Off)");

            if (timerExists) {songTimer.stop()}

            // resetting event handler
            document.onkeydown = () => {}

            // returning to the selection screen
            hideScreen(musicScreen);
            showScreen(selectionScreen);
        };
    });
}

// this function stores the methods for how the layers will be set up
function prepSong(arrayBuffer) {
    arrayBuffer.forEach((audioBuffer, index) => {
        // creating the bufferSource
        var bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.loop = true;
        bufferSource.loopEnd = globalDuration;
        
        // creating a gainNode and connecting it to the oscillator
        var gainNode = audioContext.createGain();
        gainNode.connect(oscillatorDestination);
        gainNode.connect(audioContext.destination);
        bufferSource.connect(gainNode);
        gainNode.connect(visualizer);

        // returning the buffer, gain, and index of the layer in an array for easy accessibility
        // see the contsructor in set_up.js for reference
        const percentConversion = 100;
        var unmuteValue = (volumeSliders[index].value / percentConversion) * masterMultiplier;
        loadedLayers.push(new Layer(bufferSource, gainNode, unmuteValue, index, false, false, true, false, layerNameArray[index]));
    });
    

    Array.from(soloButtons).forEach((element) => {
        switchToBright(element);
    });
    switchToBright(pauseButton);

    if (recorderQueued) {
        updateTippyContent(recordButton, "Recording...");
        recorder.start();
        recordIcon.src = "assets/images/button_icons/rec_progress_icon.png";
        recorderQueued = false;

        // switching the other buttons on
        switchToBright(saveButton, deleteButton);
    }

    // setting up the layers
    for (let i = 0; i < loadedLayers.length; i++) {
        var layer = loadedLayers[i];

        // this if statement checks for three scenarios
        // 1. If any layers have been chosen to start first or if the play all button has been clicked
        // 2. If he's been found
        // 3. If fading is enabled
        if ((startingLayers.includes(i) || songStarted) && (layer.name != "Thanks Snoodle" || beenFound) && !layersCanFade) {
            layer.volume.gain.value = layer.unmuteValue;
            layer.isMuted = false;
            layerButtons[i].dataset.title = " (Playing)";
            updateTippyContent(layerButtons[i], layer.name, i);
            layersPlaying.push(layer);
        }

        // if none of these are true, that must mean this layer has to start off muted
        else {
            layer.volume.gain.value = mute;
            layer.isMuted = true;
        }

        layer.bufferSource.start(audioContext.currentTime);
        if (layersCanFade && (startingLayers.includes(i) || songStarted)) {
            layer.isMuted = false;
            layerButtons[i].dataset.title = " (Playing)";
            updateTippyContent(layerButtons[i], layer.name, i);
            layersPlaying.push(layer);
            startLayerFadeIn(layer);
        }
    }

    playAllIcon.src = "assets/images/button_icons/stop_icon.png";

    timerExists = true;
    songTimer = new Tock({
        callback: () => {
            var currentPlayback = songTimer.msToTime(songTimer.lap()).slice(0, -4)
            timer.innerText = `${currentPlayback} / ${instanceSongLength}`
        }
    })

    songTimer.start()

    if (!visActive) {startVisualizer();}
    startUpdatingBar(globalDuration, songTimer);
}

// these next functions handles the song progress bar
function startUpdatingBar(globalDuration, songTimer) {
    var startTime = audioContext.currentTime;
    barUpdateInterval = setInterval(() => {
        // storing the amount of time that has passed since starting
        // this is a way of getting the current time of the audioBuffers since you can't just use .currentTime
        var ellapsedTime = audioContext.currentTime - startTime,
            duration = globalDuration,
            progressPercent = (ellapsedTime / duration) * percentConversion;
        progressBar.value = progressPercent;

        // resetting the progress bar if it gets full
        if (progressBar.value == 100) {
            progressBar.value = 0;
            startTime = audioContext.currentTime
            songTimer.stop()
            songTimer.start()
        }
    }, 10);
}

function stopUpdatingBar() {
    clearInterval(barUpdateInterval);
    if (audioContext.state != "suspended" || !songStarted) {progressBar.value = 0;}
}

function setResponseOpacityandColor(opacity, color) {
    Array.from(errorResponses).forEach((text) => {
        text.style.opacity = opacity;
        text.style.color = color;
    });
}

// hiding settings container when clicking anywhere else
musicScreen.addEventListener("click", (event) => {
    const settingsContainerClicked = event.target == settingsContainer,
        settingsButtonClicked = event.target == settingsButton,
        settingsButtonIconClicked = Array.from(otherButtonIcons).includes(event.target),
        settingsOptionClicked = settingsContainer.contains(event.target);

    if (!settingsContainerClicked && !settingsButtonClicked && !settingsButtonIconClicked && !settingsOptionClicked) {
        settingsContainer.style.opacity = "0";
        settingsContainer.style.pointerEvents = "none";
    }
});