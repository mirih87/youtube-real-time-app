const socket = io('https://youtube-real-time-app.herokuapp.com');
const youTubeImages = {};
let oldVideoId, currentVideoId;
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
        oldVideoId = findVideoId();
        setNewVideo();

        var items = document.getElementById('items');
        if (items && window.location.origin == 'https://www.youtube.com') {
            items.addEventListener('click', () => setTimeout(setNewVideo, 1000));
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


function setNewVideo() {

    const videoElem = findVideoElement();
    currentVideoId = findVideoId();
    if (currentVideoId != oldVideoId) {
        socket.emit('remove-youtube', oldVideoId);
        oldVideoId = currentVideoId;
    }

    if (currentVideoId && videoElem) {
        if (isVideoPlaying(videoElem)) {
            socket.emit('new-youtube', currentVideoId);
        }
        // ['play'].forEach(event => videoElem.addEventListener(event, () => {
        //     if (wasAdStopped) {
        //         socket.emit('new-youtube', currentVideoId);
        //     }
        // }));
        // ['pause'].forEach(event => videoElem.addEventListener(event, () => {
        //     socket.emit('remove-youtube', currentVideoId);
        // }));
    }
}

function findVideoId() {
    if (window.location.origin != 'https://www.youtube.com') {
        return;
    }

    return new URLSearchParams(location.search).get('v');
}


function findVideoElement() {
    return document.getElementsByTagName('video')[0];

}

function isVideoPlaying(video) {
    return !video.paused && !video.ended;// && video.currentTime > 0
}

