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
- [ ] Zobrazenie zoznamu členov kanála (/list)
- [ ] Typing indicator (“X is typing”)
- [ ] Live draft – vizualizácia rozpísaného textu
- [ ] UI pre potvrdenie opustenia / zrušenia kanála
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

