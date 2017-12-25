const io = require('socket.io')();
const port = process.env.PORT || 4000;
const sockets = new Map();
const activeYoutubes = {};
io.on('connection', socket => {
    sockets.set(socket, []);

    Object.keys(activeYoutubes).forEach(id => {
        let count = activeYoutubes[id];
        while (count > 0) {
            socket.emit('new-youtube', id);
            count--;
        }
    });

    socket.on('new-youtube', id => {
        activeYoutubes[id] = activeYoutubes[id] || 0;
        activeYoutubes[id]++;
        sockets.get(socket).push(id);
        sockets.forEach((arr, socket) => {
            socket.emit('new-youtube', id);
        });
    });

    socket.on('remove-youtube', id => {
        activeYoutubes[id]--;
        if (!activeYoutubes[id]) {
            delete activeYoutubes[id];
        }
        sockets.forEach((arr, socket) => {
            socket.emit('remove-youtube', id);
        });
    });

    socket.on('disconnect', () => {
        const videos = sockets.get(socket) || [];
        videos.forEach(id => {
            if (activeYoutubes[id]) {
                activeYoutubes[id]--;
            }

            for (let socket of sockets.keys()) {
                socket.emit('remove-youtube', id);
            }
        })
    })

});


io.listen(port);
console.log(`io listening on ${port}`);