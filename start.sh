#!/bin/bash

# Script de pornire pentru producție
echo "Pornire aplicație WhatsApp Messenger în mediul de producție"

# Verificăm dacă variabilele de mediu există
if [ -z "$WHATSAPP_API_TOKEN" ]; then
    echo "EROARE: WHATSAPP_API_TOKEN lipsește. Verificați variabilele de mediu în Render."
    exit 1
fi

if [ -z "$WHATSAPP_PHONE_NUMBER" ]; then
    echo "EROARE: WHATSAPP_PHONE_NUMBER lipsește. Verificați variabilele de mediu în Render."
    exit 1
fi

if [ -z "$WHATSAPP_PHONE_NUMBER_ID" ]; then
    echo "EROARE: WHATSAPP_PHONE_NUMBER_ID lipsește. Verificați variabilele de mediu în Render."
    exit 1
fi

# Pornim aplicația
echo "Variabilele de mediu au fost verificate cu succes!"
echo "Pornire server..."
npm run dev