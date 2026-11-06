document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const seekSlider = document.getElementById("seekSlider");
    const currentTimeEl = document.getElementById("currentTime");
    const durationTimeEl = document.getElementById("durationTime");
    const currentSongTitle = document.getElementById("currentSongTitle");
    const artIcon = document.querySelector(".fa-spin-hover");

    const modeTabBtn = document.getElementById("modeTabBtn");
    const themeSelector = document.getElementById("themeSelector");
    const themeColorInput = document.getElementById("themeColor");
    const sensitivitySlider = document.getElementById("sensitivitySlider");

    const canvas = document.getElementById("visualizer");
    const ctx = canvas.getContext("2d");

    let audioCtx, analyser, mediaSource, streamSource, masterGain, silentGain;
    let eqBands =[];
    let isContextRunning = false;
    let currentSourceType = null;
    let songList =[];
    let currentSongIndex = 0;
    let visualizerSensitivity = 1;

    // Responsive Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Hide/Show Panels Logic
    const toggleUiBtn = document.getElementById("toggleUiBtn");
    const mainPanels = document.getElementById("mainPanels");
    let isUiVisible = true;
    toggleUiBtn.addEventListener("click", () => {
        isUiVisible = !isUiVisible;
        if(isUiVisible) {
            mainPanels.classList.remove("hidden");
            toggleUiBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Panels';
        } else {
            mainPanels.classList.add("hidden");
            toggleUiBtn.innerHTML = '<i class="fas fa-eye"></i> Show Panels';
        }
    });

    // Sensitivity Slider
    sensitivitySlider.addEventListener("input", (e) => {
        visualizerSensitivity = parseFloat(e.target.value);
    });

    // Init Audio Context
    function initAudioContext() {
        if (isContextRunning) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;

        // Master Gain (লোকাল অডিওর জন্য)
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.8;

        // Silent Gain (ব্রাউজার অডিও ট্র্যাক করার সময় ডাবল সাউন্ড বন্ধ করতে)
        silentGain = audioCtx.createGain();
        silentGain.gain.value = 0;

        const bandFrequencies =[60, 250, 1000, 4000, 12000];
        eqBands = bandFrequencies.map(freq => {
            let filter = audioCtx.createBiquadFilter();
            filter.type = "peaking";
            filter.frequency.value = freq;
            filter.Q.value = 1.0;
            filter.gain.value = 0;
            return filter;
        });

        // EQ চেইন কানেকশন (Master Gain -> EQ -> ...)
        masterGain.connect(eqBands[0]);
        eqBands.reduce((prev, curr) => {
            prev.connect(curr);
            return curr;
        });

        // Media Element Source একবারই তৈরি করতে হবে
        mediaSource = audioCtx.createMediaElementSource(audioPlayer);

        isContextRunning = true;
        drawVisualizer();
    }

    // --- DYNAMIC AUDIO ROUTING ---
    
    // ১. প্লেলিস্টের গানের জন্য (EQ অ্যাপ্লাই হবে এবং সাউন্ড প্লে হবে)
    function routeLocalAudio() {
        if (!isContextRunning) initAudioContext();
        if (currentSourceType === 'local') return;

        if (streamSource) streamSource.disconnect();
        mediaSource.disconnect();
        analyser.disconnect();
        eqBands[eqBands.length - 1].disconnect();

        mediaSource.connect(masterGain);
        eqBands[eqBands.length - 1].connect(analyser);
        analyser.connect(audioCtx.destination); // স্পিকারে সাউন্ড যাবে

        currentSourceType = 'local';
    }

    // ২. ব্রাউজার অডিও ট্র্যাকের জন্য (EQ বাইপাস এবং মিউট, যেন সাউন্ড ন্যাচারাল থাকে)
    function routeBrowserAudio(stream) {
        if (!isContextRunning) initAudioContext();

        if (streamSource) streamSource.disconnect();
        mediaSource.disconnect();
        analyser.disconnect();
        eqBands[eqBands.length - 1].disconnect();

        streamSource = audioCtx.createMediaStreamSource(stream);

        // সিগন্যাল শুধু ভিজুয়ালাইজারে যাবে, তারপর Silent Gain এর কারণে স্পিকারে আর প্লে হবে না
        streamSource.connect(analyser);
        analyser.connect(silentGain);
        silentGain.connect(audioCtx.destination);

        currentSourceType = 'stream';
    }

    // EQ Sliders Event
    document.querySelectorAll(".eq-band").forEach((slider, index) => {
        slider.addEventListener("input", (e) => {
            if (audioCtx) eqBands[index].gain.value = parseFloat(e.target.value);
        });
    });

    // EQ Reset Logic
    document.getElementById("resetEqBtn").addEventListener("click", () => {
        document.querySelectorAll(".eq-band").forEach((slider, index) => {
            slider.value = 0;
            if (audioCtx) eqBands[index].gain.value = 0;
        });
    });

    // --- Custom Player Controls ---
    function formatTime(seconds) {
        let min = Math.floor(seconds / 60);
        let sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0'+sec : sec}`;
    }

    function togglePlayPause() {
        if (audioPlayer.paused) {
            routeLocalAudio(); // লোকাল অডিও রাউট করা
            if (audioCtx.state === 'suspended') audioCtx.resume();
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }

    playPauseBtn.addEventListener("click", togglePlayPause);

    audioPlayer.addEventListener("play", () => {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        artIcon.classList.add("playing");
    });

    audioPlayer.addEventListener("pause", () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        artIcon.classList.remove("playing");
    });

    audioPlayer.addEventListener("timeupdate", () => {
        if (audioPlayer.duration) {
            seekSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            currentTimeEl.innerText = formatTime(audioPlayer.currentTime);
            durationTimeEl.innerText = formatTime(audioPlayer.duration);
        }
    });

    seekSlider.addEventListener("input", () => {
        audioPlayer.currentTime = (seekSlider.value / 100) * audioPlayer.duration;
    });

    audioPlayer.addEventListener("ended", playNextSong);
    document.getElementById("nextBtn").addEventListener("click", playNextSong);
    document.getElementById("prevBtn").addEventListener("click", playPrevSong);

    function playNextSong() {
        if(songList.length > 0) {
            currentSongIndex = (currentSongIndex + 1) % songList.length;
            loadAndPlay(songList[currentSongIndex]);
        }
    }

    function playPrevSong() {
        if(songList.length > 0) {
            currentSongIndex = (currentSongIndex - 1 + songList.length) % songList.length;
            loadAndPlay(songList[currentSongIndex]);
        }
    }

    function loadAndPlay(song) {
        audioPlayer.src = song.file_path;
        currentSongTitle.innerText = song.title;
        togglePlayPause();
    }

    // --- Browser Tracking API (Fixed Logic) ---
    modeTabBtn.addEventListener("click", async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            audioPlayer.pause(); 
            routeBrowserAudio(stream); // ব্রাউজার অডিও রাউট করা
            
            currentSongTitle.innerText = "Tracking Live Audio...";
            artIcon.classList.add("playing");

            stream.getVideoTracks()[0].addEventListener('ended', () => {
                currentSongTitle.innerText = "Stopped Tracking";
                artIcon.classList.remove("playing");
                if(streamSource) streamSource.disconnect();
            });
        } catch (err) {
            alert("Share a tab and enable 'Share audio'.");
        }
    });

    // --- Playlist File Upload Logic ---
    function fetchSongs() {
        fetch("fetch_songs.php")
        .then(res => res.json())
        .then(data => {
            songList = data;
            const playlist = document.getElementById("playlist");
            playlist.innerHTML = "";
            data.forEach((song, index) => {
                let li = document.createElement("li");
                li.innerHTML = `<span style="flex:1;"><i class="fas fa-music"></i> ${song.title}</span> <button class="delete-btn" data-id="${song.id}"><i class="fas fa-trash"></i></button>`;
                li.querySelector("span").addEventListener("click", () => { currentSongIndex = index; loadAndPlay(song); });
                li.querySelector(".delete-btn").addEventListener("click", function(e) {
                    e.stopPropagation();
                    if(confirm("Delete this song?")) {
                        let formData = new FormData(); formData.append("id", this.getAttribute("data-id"));
                        fetch("delete.php", { method: "POST", body: formData }).then(() => fetchSongs());
                    }
                });
                playlist.appendChild(li);
            });
        });
    }

    document.getElementById("audioFile").addEventListener("change", function() {
        const fileLabel = document.querySelector(".upload-actions label");
        if (this.files[0]) fileLabel.innerHTML = `<i class="fas fa-check-circle"></i> File Selected`;
    });

    document.getElementById("uploadBtn").addEventListener("click", () => {
        const title = document.getElementById("songTitle").value;
        const file = document.getElementById("audioFile").files[0];
        if(!title || !file) return alert("Please provide title and file");

        const uploadBtn = document.getElementById("uploadBtn");
        const originalBtnText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Wait...`;
        uploadBtn.disabled = true;

        let formData = new FormData(); formData.append("title", title); formData.append("audio_file", file);
        fetch("upload.php", { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            uploadBtn.innerHTML = originalBtnText;
            uploadBtn.disabled = false;
            if(data.status === "success") {
                document.getElementById("songTitle").value = "";
                document.getElementById("audioFile").value = "";
                document.querySelector(".upload-actions label").innerHTML = `<i class="fas fa-folder-open"></i> File`;
                fetchSongs();
            }
        })
        .catch(() => {
            uploadBtn.innerHTML = originalBtnText;
            uploadBtn.disabled = false;
        });
    });

    fetchSongs();

    // --- Modular Visualizer Drawing Logic ---
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "rgba(5, 5, 5, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const theme = themeSelector.value;
        const selectedColor = themeColorInput.value;

        if (window.AudioVisualizers && window.AudioVisualizers[theme]) {
            window.AudioVisualizers[theme](ctx, canvas, dataArray, bufferLength, selectedColor, visualizerSensitivity);
        }
    }
    // --- RGB & Multi-Color Mode Logic ---
    const rgbModeBtn = document.getElementById("rgbModeBtn");
    let isRgbMode = false;
    let globalHue = 0; // কালার ঘোরানোর জন্য ভেরিয়েবল

    rgbModeBtn.addEventListener("click", () => {
        isRgbMode = !isRgbMode;
        if(isRgbMode) {
            rgbModeBtn.classList.add("rgb-active");
            themeColorInput.style.opacity = "0.3"; // সিঙ্গেল কালার পিকার হাইড করা
            themeColorInput.style.pointerEvents = "none";
        } else {
            rgbModeBtn.classList.remove("rgb-active");
            themeColorInput.style.opacity = "1";
            themeColorInput.style.pointerEvents = "auto";
        }
    });

    // --- Modular Visualizer Drawing Logic ---
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "rgba(5, 5, 5, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const theme = themeSelector.value;
        let activeColor = themeColorInput.value; // ডিফল্ট সিঙ্গেল কালার

        // 🌟 ম্যাজিক: মাল্টি-কালার জেনারেটর 🌟
        if (isRgbMode) {
            globalHue += 1.5; // কালার মুভমেন্টের স্পিড (বাড়িয়ে বা কমিয়ে দেখতে পারেন)
            
            // ডায়নামিক গ্রেডিয়েন্ট রোটেশন (স্ক্রিনের চারদিকে কালার ঘুরবে)
            let angle = globalHue * 0.01;
            let x1 = (canvas.width / 2) + Math.cos(angle) * canvas.width;
            let y1 = (canvas.height / 2) + Math.sin(angle) * canvas.height;
            let x2 = (canvas.width / 2) - Math.cos(angle) * canvas.width;
            let y2 = (canvas.height / 2) - Math.sin(angle) * canvas.height;

            // ৩টি আলাদা কালারের সংমিশ্রণ
            let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, `hsl(${globalHue % 360}, 100%, 50%)`); // 1st Color
            gradient.addColorStop(0.5, `hsl(${(globalHue + 60) % 360}, 100%, 50%)`); // 2nd Color
            gradient.addColorStop(1, `hsl(${(globalHue + 120) % 360}, 100%, 50%)`); // 3rd Color

            activeColor = gradient; // সিঙ্গেল কালারের বদলে গ্রেডিয়েন্ট কালার সেট করা হলো
        }

        if (window.AudioVisualizers && window.AudioVisualizers[theme]) {
            window.AudioVisualizers[theme](ctx, canvas, dataArray, bufferLength, activeColor, visualizerSensitivity);
        }
    }
});
// --- Equalizer Virtual Page Logic ---
    const openEqBtn = document.getElementById("openEqBtn");
    const closeEqBtn = document.getElementById("closeEqBtn");
    const eqVirtualPage = document.getElementById("eqVirtualPage");

    // ওপেন বাটন ক্লিক করলে পেজ উপরে উঠবে
    openEqBtn.addEventListener("click", () => {
        eqVirtualPage.classList.remove("hidden");
    });

    // ক্লোজ/ব্যাক বাটন ক্লিক করলে পেজ নিচে নেমে যাবে
    closeEqBtn.addEventListener("click", () => {
        eqVirtualPage.classList.add("hidden");
    });

    