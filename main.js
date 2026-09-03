document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('playBtn');
    const playIconContainer = playBtn.querySelector('.play-icon');
    const recordWrapper = document.querySelector('.record-wrapper');
    const progressBarFill = document.getElementById('progressBarFill');
    const currentTimeEl = document.getElementById('currentTime');
    const trackTitle = document.getElementById('trackTitle');
    const queueList = document.getElementById('queueList');
    
    let isPlaying = false;
    let progress = 0;
    let progressInterval;
    
    const tracks = [
        { title: "Ambient Serenity", duration: 260 },
        { title: "Golden Hour Drift", duration: 310 },
        { title: "Kyoto Rain", duration: 195 }
    ];
    let currentTrackIndex = 0;

    const svgPlay = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const svgPause = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function updateTrackUI() {
        trackTitle.textContent = tracks[currentTrackIndex].title;
        document.getElementById('totalTime').textContent = formatTime(tracks[currentTrackIndex].duration);
        progress = 0;
        updateProgress();
        updateQueueUI();
    }

    function updateQueueUI() {
        const items = queueList.querySelectorAll('.queue-item');
        items.forEach((item, index) => {
            if(index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    function togglePlay() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playIconContainer.innerHTML = svgPause;
            playIconContainer.querySelector('svg').style.marginLeft = "0";
            recordWrapper.classList.add('playing');
            
            progressInterval = setInterval(() => {
                progress += 1;
                if (progress >= tracks[currentTrackIndex].duration) {
                    nextTrack();
                }
                updateProgress();
            }, 1000);
            
        } else {
            playIconContainer.innerHTML = svgPlay;
            playIconContainer.querySelector('svg').style.marginLeft = "3px";
            recordWrapper.classList.remove('playing');
            clearInterval(progressInterval);
        }
    }

    function updateProgress() {
        const percent = (progress / tracks[currentTrackIndex].duration) * 100;
        progressBarFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(progress);
    }

    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        if(isPlaying) clearInterval(progressInterval);
        updateTrackUI();
        if(isPlaying) {
            progressInterval = setInterval(() => {
                progress += 1;
                if (progress >= tracks[currentTrackIndex].duration) nextTrack();
                updateProgress();
            }, 1000);
        }
    }

    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        if(isPlaying) clearInterval(progressInterval);
        updateTrackUI();
        if(isPlaying) {
            progressInterval = setInterval(() => {
                progress += 1;
                if (progress >= tracks[currentTrackIndex].duration) nextTrack();
                updateProgress();
            }, 1000);
        }
    }

    playBtn.addEventListener('click', togglePlay);
    document.getElementById('nextBtn').addEventListener('click', nextTrack);
    document.getElementById('prevBtn').addEventListener('click', prevTrack);

    updateTrackUI();
});
