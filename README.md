# WhatsApp Business API Messaging Application

Această aplicație permite trimiterea de mesaje WhatsApp folosind WhatsApp Business API direct prin intermediul unui token API de la Meta.

## Caracteristici

- Autentificare directă cu token WhatsApp Business API
- Interfață de utilizator intuitivă pentru configurarea mesajelor
- Suport pentru trimiterea către numere individuale sau grupuri multiple
- Opțiuni avansate pentru întârzieri și reîncercări
- Sistem de jurnalizare (logging) în timp real
- Sesiuni private și izolate pentru fiecare utilizator

## Tehnologii utilizate

- **Frontend**: React, TailwindCSS, ShadcnUI
- **Backend**: Node.js, Express
- **State Management**: React Context API, TanStack Query
- **API Integration**: WhatsApp Business API

## Configurare pentru Deployment

### Deployment pe Render

1. Creați un cont pe [Render](https://render.com) dacă nu aveți deja unul
2. Din dashboard-ul Render, faceți click pe butonul "New +" și selectați "Web Service"
3. Conectați repository-ul Git care conține codul aplicației
4. Configurați manual următoarele setări:
   - **Name**: Numele dorit pentru aplicație (ex: whatsapp-messenger)
   - **Runtime**: Node
   - **Region**: Alegeți regiunea cea mai apropiată de locația dvs.
   - **Branch**: main (sau branch-ul principal)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev`
   
5. **IMPORTANT**: Configurați variabilele de mediu necesare:
   - **WHATSAPP_API_TOKEN**: Token-ul de acces de la WhatsApp Business API
   - **WHATSAPP_PHONE_NUMBER**: Numărul dvs. de telefon WhatsApp Business (format: +407xxxxxxxx)
   - **WHATSAPP_PHONE_NUMBER_ID**: ID-ul numărului de telefon (ex: 606093835919104)

6. Faceți click pe "Create Web Service" pentru a începe procesul de deployment
7. Așteptați finalizarea procesului de deployment (poate dura câteva minute)
8. După finalizare, veți primi un URL de acces pentru aplicația dvs.

### Obținerea unui token WhatsApp Business API

Pentru a utiliza aplicația, veți avea nevoie de un token de acces de la WhatsApp Business API:

1. Accesați [Meta for Developers](https://developers.facebook.com/)
2. Creați o aplicație pentru WhatsApp Business
3. Generați un token de acces pentru WhatsApp API
4. Copiați token-ul pentru utilizare în aplicație

## Cum se utilizează aplicația

1. **Autentificare**: 
   - Introduceți token-ul API WhatsApp Business
   - Introduceți numărul dvs. de telefon WhatsApp Business (format: +407xxxxxxxx)
   - Introduceți ID-ul numărului de telefon (ex: 606093835919104)

2. **Configurare destinatari**: 
   - Adăugați numerele de telefon ale destinatarilor
   - **IMPORTANT**: Asigurați-vă că numerele sunt în formatul corect (cu prefix "+" și codul țării)
   - Exemplu format corect: +407xxxxxxxx

3. **Detalii mesaj**: 
   - Introduceți conținutul mesajului text
   - Sau încărcați un fișier cu mesaje

4. **Opțiuni avansate**: 
   - Configurați întârzierile între mesaje (în milisecunde)
   - Setați numărul de reîncercări în caz de eșec
   - Activați/dezactivați notificările

5. **Control**: 
   - Începeți trimiterea mesajelor cu butonul "Start"
   - Monitorizați progresul în secțiunea de logs
   - Opriți trimiterea în orice moment cu butonul "Stop"

## Depanare și probleme comune

### Erori de format pentru numere de telefon

API-ul WhatsApp necesită ca numerele de telefon să fie în format international complet:
- **Format corect**: +407xxxxxxxx (cu prefixul "+" urmat de codul țării)
- **Format incorect**: 07xxxxxxxx (lipsește prefixul "+" și codul țării)
- **Format incorect**: 407xxxxxxxx (lipsește prefixul "+")

### Eroarea "Invalid parameter"

Dacă primiți eroarea "Invalid parameter" la trimiterea mesajelor:
1. Verificați formatul numerelor de telefon (trebuie să includă prefixul "+" și codul țării)
2. Asigurați-vă că ID-ul numărului de telefon este corect (ex: 606093835919104)
3. Verificați dacă numerele destinatarilor sunt înregistrate în WhatsApp

## Întreținere și suport

Pentru întrebări sau asistență, contactați autorul aplicației.

## Note pentru dezvoltare

Pentru dezvoltare locală:
1. Clonați repository-ul
2. Rulați `npm install` pentru a instala dependențele
3. Executați `npm run dev` pentru a porni serverul de dezvoltare