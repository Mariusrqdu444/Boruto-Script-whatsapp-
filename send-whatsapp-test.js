// Script simplu pentru trimiterea directă a unui mesaj WhatsApp
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Valoarea corectă pentru Phone Number ID
const PHONE_NUMBER_ID = '606093835919104';

// Celelalte valori din variabilele de mediu
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN;

// Configurare simplă
const targetPhoneNumber = '+407xxxxxxxx';  // Prefixul + este important pentru API-ul WhatsApp
const messageText = 'Acesta este un mesaj de test din aplicația WhatsApp Messenger';

async function sendWhatsAppMessage() {
  console.log('=== Test trimitere mesaj WhatsApp ===');
  console.log(`ID Număr de telefon: ${PHONE_NUMBER_ID}`);
  console.log(`Număr destinatar: ${targetPhoneNumber}`);
  console.log('-----------------------------------');
  
  if (!WHATSAPP_TOKEN) {
    console.error('EROARE: Token-ul WhatsApp API nu este disponibil!');
    return;
  }
  
  try {
    console.log('Trimitem mesajul...');
    
    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: targetPhoneNumber,
        type: 'text',
        text: {
          body: messageText
        }
      })
    });
    
    const data = await response.json();
    console.log(`Cod răspuns: ${response.status}`);
    console.log('Răspuns:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Mesajul a fost trimis cu SUCCES!');
    } else {
      console.error('❌ Trimiterea mesajului a EȘUAT!');
      
      // Analizăm cauza eșecului
      if (data.error) {
        console.error('Cauza eșecului:', data.error.message);
        
        if (data.error.error_data?.details) {
          console.error('Detalii:', data.error.error_data.details);
        }
        
        // Sfaturi pentru remedierea celor mai frecvente erori
        if (data.error.message.includes('Invalid parameter')) {
          console.log('\n⚠️ RECOMANDĂRI:');
          console.log('1. Verificați dacă numărul de telefon destinatar include codul de țară cu prefixul + (ex: +407xxxxxxxx)');
          console.log('2. Verificați dacă numărul de telefon destinatar este înregistrat în WhatsApp');
          console.log('3. Verificați ID-ul numărului de telefon (PHONE_NUMBER_ID) - asigurați-vă că este corect');
          console.log('4. Asigurați-vă că numărul destinatar este înregistrat în lista de contacte de test dacă contul dvs. este în modul sandbox');
        }
      }
    }
  } catch (error) {
    console.error('EROARE:', error.message);
  }
}

// Rulăm funcția
sendWhatsAppMessage();