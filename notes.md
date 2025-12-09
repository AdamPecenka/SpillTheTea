### To Fix
- farbicky pri typing indikatori
- invited channels by mali byt v liste na vrchu
- mentionNotify UI fix
- rozdielne Dialog kart pre leavovanie kanalu (channel list / 3dot menu v kanali)

### Dev notes
- dorobit editovanie profilu
    - mozno nemat default profilovu fotku
        - nechat null v db?
        - pridat avatar picker component do register page?

- pri socketoch v nasej appke nechceme namespaces, IBA rooms ako najvyssie delenie
    - channel rooms
        - `channel:<id>`
    - user room
        - `user:<id>`

| Emit pattern | Who receives | Includes sender? | Why / Notes |
|---|---:|:---:|---|
| socket.emit(event, data) | Only that single socket (the one calling emit) | ✅ Yes (only the sender) | Direct send to the current socket instance. |
| io.emit(event, data) | Every connected socket on the server | ✅ Yes (all sockets, including sender) | Global broadcast across the whole server. |
| socket.broadcast.emit(event, data) | Every connected socket except the sender | ❌ No (sender excluded) | Broadcast from this socket to everyone else on the server. |
| io.to(room).emit(event, data) / io.in(room).emit(...) | All sockets that have joined the room | ✅ Yes (all room members, including sender) | Room-scoped broadcast that includes the sender. |
| socket.to(room).emit(event, data) / socket.broadcast.to(room).emit(...) | All sockets in the room except the sending socket | ❌ No (sender excluded) | Room-scoped broadcast that excludes the specific socket instance that emitted. Good for excluding just the current tab. |
| io.in(room).except([socketId,...]).emit(...) | All sockets in the room except the listed socket ids | ❌ No (listed sockets excluded) | Allows excluding specific socket IDs (useful to exclude all sockets from a particular tab or device). Available in recent Socket.IO releases. |
| socket.broadcast.to(room).emit(...) | All sockets in the room except the sender | ❌ No | Equivalent to socket.to(room).emit(...). |