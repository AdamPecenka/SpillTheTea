## Use Cases Check list

### FRONTEND

- [x] Registrácia
- [x] Prihlásenie
- [x] Odhlásenie používateľa
- [x] Zobrazenie / úprava profilu (meno, priezvisko, nickName, email)
- [x] Zobrazenie zoznamu kanálov
- [x] Zobrazenie pozvánok (zvýraznenie / topovanie)
- [x] UI pre vytvorenie / opustenie / zrušenie kanála
- [x] Výber typu kanála (public/private)
- [x] Zobrazenie histórie správ (infinite scroll)
- [x] Zobrazenie mentionov (vizuálne zvýraznenie)
- [x] Notifikácie (zobrazenie / správa preferencií)
- [x] Rozhranie na zmenu stavu (online / DND / offline)
- [x] Zobrazenie zoznamu členov kanála (/list)
- [x] Typing indicator (“X is typing”)
- [x] Live draft – vizualizácia rozpísaného textu
- [x] UI pre potvrdenie opustenia / zrušenia kanála
- [x] UI rozlíšenie public vs private kanál

### BACKEND

- [ ] Uloženie a overenie registrácie
- [ ] Autentifikácia a správa session/tokenu
- [ ] Validácia unikátnosti nickName a channelName
- [ ] Ukladanie kanálov & členských vzťahov
- [ ] Opustenie / vyhodenie z kanála (logika)
- [ ] Generovanie a správa pozvánok
- [ ] Vytvorenie kanála cez `/join`
- [ ] Správa private kanálov (/invite, /revoke)
- [ ] Pridanie do public kanála (/join auto-create)
- [ ] Moderácia public kanálov – /kick + hlasovanie
- [ ] Trvalý ban + unban správcom
- [ ] Automatické mazanie neaktívnych kanálov (30 dní)
- [ ] Ukladanie a načítanie histórie správ
- [ ] Delivery notifikácií (push / websocket)
- [ ] Preferencie notifikácií (mentions only)
- [ ] Stavová správa používateľa (presence)
- [ ] Offline bufferovanie správ
- [ ] Synchronizácia po návrate online
- [ ] Poskytovanie zoznamu členov (/list)
- [ ] Správa typing indikátora (emit / broadcast)
- [ ] Správa live draft textu v reálnom čase

### To Fix
- farbicky pri typing indikatori
- invited channels by mali byt v liste na vrchu
- odstranit nastevenie notifikacii pre kanalY
- mentionNotify UI fix

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