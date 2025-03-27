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

### Opțiunea 1: Deployment cu render.yaml (recomandat)

1. Creați un cont pe [Render](https://render.com) dacă nu aveți deja unul
2. Din dashboard-ul Render, accesați "Blueprints"
3. Conectați repository-ul Git care conține codul aplicației
4. Fișierul `render.yaml` inclus în repository va configura automat serviciul
5. Urmați pașii din interfața Render pentru a finaliza deployment-ul

### Opțiunea 2: Deployment manual

1. Creați un cont pe [Render](https://render.com) dacă nu aveți deja unul
2. Creați un nou Web Service
3. Conectați repository-ul Git care conține codul aplicației
4. Configurați manual următoarele setări:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment Variables**: Nu este necesară configurarea variabilelor de mediu suplimentare
   - **Health Check Path**: `/api/health`

### Obținerea unui token WhatsApp Business API

Pentru a utiliza aplicația, veți avea nevoie de un token de acces de la WhatsApp Business API:

1. Accesați [Meta for Developers](https://developers.facebook.com/)
2. Creați o aplicație pentru WhatsApp Business
3. Generați un token de acces pentru WhatsApp API
4. Copiați token-ul pentru utilizare în aplicație

## Cum se utilizează aplicația

1. **Autentificare**: Introduceți token-ul API și numărul dvs. de telefon WhatsApp Business
2. **Configurare destinatari**: Adăugați numerele de telefon ale destinatarilor
3. **Detalii mesaj**: Introduceți conținutul mesajului
4. **Opțiuni avansate**: Configurați întârzierile și numărul de reîncercări (opțional)
5. **Control**: Începeți și opriți trimiterea mesajelor

## Întreținere și suport

Pentru întrebări sau asistență, contactați autorul aplicației.

## Note pentru dezvoltare

Pentru dezvoltare locală:
1. Clonați repository-ul
2. Rulați `npm install` pentru a instala dependențele
3. Executați `npm run dev` pentru a porni serverul de dezvoltare