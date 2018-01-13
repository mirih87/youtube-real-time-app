const socket = io('https://youtube-real-time-app.herokuapp.com');
let youTubeImages = {};
let oldVideoId, currentVideoId;
socket.on('connect', () => {

    socket.on('getPreviousYou-tube', previousImages => {
        youTubeImages = previousImages;
        renderPreviousImages();
    });

    socket.on('new-youtube', (youtubeId) => {
        youTubeImages[youtubeId] = youTubeImages[youtubeId] || 0;
        youTubeImages[youtubeId]++;
        renderChanges(youtubeId, youTubeImages[youtubeId]);
    });

    socket.on('remove-youtube', youtubeId => {
        if (youTubeImages[youtubeId]) {
            youTubeImages[youtubeId]--;
            if (!youTubeImages[youtubeId]) {
                delete youTubeImages[youtubeId];
            }
            renderChanges(youtubeId, youTubeImages[youtubeId]);
        }
    });

    setTimeout(() => {
        oldVideoId = findVideoId();
        setNewVideo();

        const items = document.getElementById('items');
        if (items && window.location.origin == 'https://www.youtube.com') {
            items.addEventListener('click', () => setTimeout(setNewVideo, 1000));
        }

    }, 1000);

});


function renderPreviousImages() {
    const html = Object.keys(youTubeImages).reduce((acc, id) => {
        return acc + `
            <div class="you-item" id=${id}>
                <div class="counter">${youTubeImages[id]}</div>
                <img src="https://img.youtube.com/vi/${id}/0.jpg" />
            </div>
        `
    }, '');
    document.getElementById('youtube-images').innerHTML = html;
}

function renderChanges(id, counter = 0) {
    let item = document.getElementById(id);
    if (!counter) { // remove img
        item.remove();
    }
    else if (item && counter > 0) {   // update counter
        item.getElementsByTagName('div')[0].innerText = counter;
    } else { // add image
        item = document.createElement('div');
        item.className = 'you-item';
        item.id = id;
        const counterElem = document.createElement('div');
        counterElem.className = 'counter';
        counterElem.innerText = counter;
        const img = document.createElement('img');
        img.src = `https://img.youtube.com/vi/${id}/0.jpg`;
        item.appendChild(counterElem);
        item.appendChild(img);
        document.getElementById('youtube-images').appendChild(item);
    }
}

function setNewVideo() {

    const videoElem = findVideoElement();
    currentVideoId = findVideoId();
    if (currentVideoId != oldVideoId) {
        socket.emit('remove-youtube', oldVideoId);
        oldVideoId = currentVideoId;
    }

    if (currentVideoId && videoElem) {
        socket.emit('new-youtube', currentVideoId);
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


