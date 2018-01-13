const io = require('socket.io')();
const port = process.env.PORT || 4000;
const sockets = new Map();
const activeYoutubes = {};
io.on('connection', socket => {
    sockets.set(socket, []);

    // Object.keys(activeYoutubes).forEach(id => {
    //     let count = activeYoutubes[id];
    //     while (count > 0) {
    //         socket.emit('new-youtube', id);
    //         count--;
    //     }
    // });

    socket.emit('getPreviousYou-tube', activeYoutubes);

    socket.on('new-youtube', addyouTube);
    socket.on('remove-youtube', removeYoutube);
    socket.on('disconnect', () => {
        const videos = sockets.get(socket) || [];
        videos.forEach(id => {
            if (activeYoutubes[id]) {
                removeYoutube(id);
            }
        })
    });

    function addyouTube(id) {
        activeYoutubes[id] = activeYoutubes[id] || 0;
        activeYoutubes[id]++;
        sockets.get(socket).push(id);
        sockets.forEach((arr, socket) => {
            socket.emit('new-youtube', id);
        });
    }

    function removeYoutube(id) {
        activeYoutubes[id]--;
        if (!activeYoutubes[id]) {
            delete activeYoutubes[id];
        }
        for (let socket of sockets.keys()) {
            socket.emit('remove-youtube', id);
        }
    }

});


io.listen(port);
console.log(`io listening on ${port}`);