const socket = io('https://youtube-real-time-app.herokuapp.com');
const youTubeImages = {};
socket.on('connect', () => {
    socket.on('new-youtube', (youtubeId) => {
        youTubeImages[youtubeId] = youTubeImages[youtubeId] || 0;
        youTubeImages[youtubeId]++;
        renderImages();
    });

    socket.on('remove-youtube', youtubeId => {
        if (youTubeImages[youtubeId]) {
            youTubeImages[youtubeId]--;
            if (!youTubeImages[youtubeId]) {
                delete youTubeImages[youtubeId];
            }
            renderImages();
        }
    });

    setTimeout(() => {
        const videoElem = findVideoElement();
        const videoId = findVideoId();

        if (videoId && videoElem) {
            if (isVideoPlaying(videoElem)) {
                socket.emit('new-youtube', videoId);
            }
            ['play'].forEach(event => videoElem.addEventListener(event, () => {
                socket.emit('new-youtube', videoId);
            }));
            ['pause'].forEach(event => videoElem.addEventListener(event, () => {
                socket.emit('remove-youtube', videoId);
            }));
        }
    }, 1000);

});


function renderImages() {
    const html = Object.keys(youTubeImages).reduce((acc, id) => {
        return acc + `
            <div class="you-item">
                <div class="counter">${youTubeImages[id]}</div>
                <img src="https://img.youtube.com/vi/${id}/0.jpg" />
            </div>
        `
    }, '');
    document.getElementById('youtube-images').innerHTML = html;
}

function findVideoId() {
    if (window.location.origin != 'https://www.youtube.com') {
        return;
    }
    return window.location.search.split('v=')[1];
}


function findVideoElement() {
    return document.getElementsByTagName('video')[0];

}

function isVideoPlaying(video) {
    return !video.paused && !video.ended;// && video.currentTime > 0
}
