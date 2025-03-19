let timerInterval;
let timeLeft = 0;
let isPaused = false;
let currentPhaseIndex = 0;
let phaseElement = document.querySelector('.phase_name');
let progressBar = document.getElementById('progressBar');
let audio = document.getElementById("beep");
let phaseTimeLeft = 0;
let phaseDuration = 0;
let phases = [];

function updateConfig() {
    const warmup = parseInt(document.getElementById('warmup').value) || 0;
    const stations = parseInt(document.getElementById('stations').value) || 1;
    const sets = parseInt(document.getElementById('sets').value) || 1;
    const workTime = parseInt(document.getElementById('workTime').value) || 1;
    const restTime = parseInt(document.getElementById('restTime').value) || 1;

    phases = [];

    // Add warm-up phase
    if (warmup > 0) {
        phases.push({ name: "🔥 Warm-up", duration: warmup * 60 });
        phases.push({ name: "😌 Rest", duration: restTime }); // Add rest after warm-up
    }

    // Loop through sets and stations
    for (let set = 1; set <= sets; set++) {
        for (let station = 1; station <= stations; station++) {
            phases.push({ name: `💪 Station ${station} (Work)`, duration: workTime });

            // Add rest after work, except at the last station of the last set
            if (station < stations || set < sets) {
                phases.push({ name: "😌 Rest", duration: restTime });
            }
        }
    }

    timeLeft = phases.reduce((sum, phase) => sum + phase.duration, 0);
    displayTime(timeLeft);
}


function displayTime(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    document.getElementById('totalTime').textContent = `Total Time: ${minutes}:${secs}`;
}

function startWorkout() {
    updateConfig();
    if (phases.length === 0) return;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('stopBtn').disabled = false;
    isPaused = false;
    currentPhaseIndex = 0;
    switchPhase();
    timerInterval = setInterval(updateTime, 1000);
}

function updateTime() {
    if (isPaused || currentPhaseIndex >= phases.length) return;

    phaseTimeLeft--;
    timeLeft--;

    if (phaseTimeLeft <= 0) {
        currentPhaseIndex++;
        if (currentPhaseIndex < phases.length) {
            switchPhase();
        } else {
            stopWorkout();
        }
    }

    updateProgressBar();
    displayTime(timeLeft);
}

function switchPhase() {
    if (currentPhaseIndex >= phases.length) {
        stopWorkout();
        return;
    }

    const phase = phases[currentPhaseIndex];
    phaseElement.textContent = phase.name;
    phaseTimeLeft = phase.duration;
    phaseDuration = phase.duration;
    updateProgressBar();
    audio.currentTime = 0;
    audio.play().catch(err => console.log("Audio play blocked:", err));
}

function updateProgressBar() {
    const progress = ((phaseDuration - phaseTimeLeft) / phaseDuration) * 100;
    progressBar.style.width = `${progress}%`;
}

function pauseWorkout() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? "Resume" : "Pause";
}

function stopWorkout() {
    clearInterval(timerInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    phaseElement.textContent = "Workout Finished!";
    progressBar.style.width = "0%";
    document.getElementById("popup").style.display = "block";
    setTimeout(() => document.getElementById("popup").style.display = "none", 2000);
}

// Ensure total time is calculated correctly on page load
document.addEventListener("DOMContentLoaded", () => {
    updateConfig();
});

// Update total time when any input changes
document.querySelectorAll('.config input').forEach(input => {
    input.addEventListener('input', updateConfig);
});
