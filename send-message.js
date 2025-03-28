// Script simplu pentru trimiterea unui mesaj WhatsApp
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preluarea variabilelor de mediu
const apiToken = process.env.WHATSAPP_API_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '606093835919104';

async function sendMessage() {
  if (!apiToken) {
    console.error('EROARE: Token-ul API WhatsApp lipsește din variabilele de mediu');
    return;
  }

  console.log('==== TRIMITERE MESAJ WHATSAPP ====');
  
  // 1. Solicită numărul destinatarului
  readline.question('Introduceți numărul de telefon destinatar (cu cod de țară, ex: 407xxxxxxxx): ', async (phoneNumber) => {
    // Adăugăm prefix + dacă lipsește
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    console.log(`Număr destinatar formatat: ${phoneNumber}`);
    
    // 2. Solicită mesajul
    readline.question('Introduceți mesajul de trimis: ', async (message) => {
      console.log(`Mesaj: "${message}"`);
      console.log(`Trimitem către: ${phoneNumber}`);
      console.log(`Folosind Phone Number ID: ${phoneNumberId}`);
      
      try {
        console.log('Trimitere în curs...');
        
        const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
            type: 'text',
            text: { body: message }
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('✅ Mesaj trimis cu succes!');
          console.log(`ID mesaj: ${data.messages?.[0]?.id}`);
        } else {
          console.error('❌ Eroare la trimiterea mesajului');
          console.error('Cod de răspuns:', response.status);
          console.error('Detalii eroare:', JSON.stringify(data, null, 2));
          
          // Sugestii pentru rezolvarea erorilor comune
          if (data.error?.code === 100) {
            console.log('\nSugestii pentru rezolvare:');
            console.log('1. Verificați dacă numărul destinatar este în format corect (începe cu "+" urmat de codul țării)');
            console.log('2. Asigurați-vă că numărul destinatar este înregistrat în WhatsApp');
            console.log('3. Verificați dacă Phone Number ID-ul este corect');
          }
        }
      } catch (error) {
        console.error('Eroare neașteptată:', error.message);
      }
      
      readline.close();
    });
  });
}

// Rulăm funcția
sendMessage().catch(err => {
  console.error('Eroare neașteptată:', err);
  readline.close();
});