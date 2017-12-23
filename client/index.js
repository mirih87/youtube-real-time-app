const socket = io('https://youtube-real-time-app.herokuapp.com');
const youTubeImages = {};
socket.on('connect', () => {
  socket.on('new-youtube', youtubeId => {
    youTubeImages[youtubeId] -= youTubeImages[youtubeId] || 0;
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

  socket.emit('new-youtube', 'yCjJyiqpAuU');
});


function renderImages() {
  const html = Object.keys(youTubeImages).reduce((acc, id) => {
    return acc + `
            <div class="you-item">
                <div class="counter">${youTubeImages[id]}</div>
                <img src="https://img.youtube.com/vi/${id}/0.jpg" />
            </div>
        `
  }, '')
  document.getElementById('youtube-images').innerHTML = html;
}