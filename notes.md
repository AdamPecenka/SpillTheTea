## Use Cases Check list

### FRONTEND

- [x] Registrácia
- [x] Prihlásenie
- [ ] Odhlásenie používateľa
- [x] Zobrazenie / úprava profilu (meno, priezvisko, nickName, email)
- [x] Zobrazenie zoznamu kanálov
- [ ] Zobrazenie pozvánok (zvýraznenie / topovanie)
- [ ] UI pre vytvorenie / opustenie / zrušenie kanála
- [x] Výber typu kanála (public/private)
- [ ] Posielanie správ cez príkazový riadok
- [ ] Zobrazenie histórie správ (infinite scroll)
- [ ] Zobrazenie mentionov (vizuálne zvýraznenie)
- [ ] Notifikácie (zobrazenie / správa preferencií)
- [x] Rozhranie na zmenu stavu (online / DND / offline)
- [ ] Zobrazenie zoznamu členov kanála (/list)
- [ ] Typing indicator (“X is typing”)
- [ ] Live draft – vizualizácia rozpísaného textu
- [ ] UI pre potvrdenie opustenia / zrušenia kanála
- [ ] Sync kanálov po návrate z offline do online
- [x] UI rozlíšenie public vs private kanál
- [ ] Notifikácie iba pri neviditeľnej appke (AppVisibility)

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

