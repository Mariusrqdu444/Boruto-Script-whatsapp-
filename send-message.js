// Script pentru trimiterea de mesaje WhatsApp
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Verificăm argumentele primite
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Utilizare: node send-message.js NUMĂR_DESTINAȚIE [MESAJ]');
  console.log('Exemplu: node send-message.js 407xxxxxxxx "Acesta este un mesaj de test"');
  process.exit(1);
}

// Preluam variabilele din argumente și mediu
const targetNumber = args[0];
const messageText = args[1] || 'Acesta este un mesaj de test din aplicația WhatsApp Messenger.';
const apiToken = process.env.WHATSAPP_API_TOKEN;
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;

async function sendMessage() {
  console.log('=== Trimitere mesaj WhatsApp ===');
  console.log(`Număr expeditor: ${phoneNumber}`);
  console.log(`Număr destinatar: ${targetNumber}`);
  console.log(`Mesaj: ${messageText}`);
  console.log('--------------------------------');
  
  if (!apiToken) {
    console.error('EROARE: Token-ul API WhatsApp lipsește din variabilele de mediu');
    return false;
  }
  
  if (!phoneNumber) {
    console.error('EROARE: Numărul de telefon WhatsApp lipsește din variabilele de mediu');
    return false;
  }
  
  try {
    console.log('Trimitem mesajul...');
    
    const messageUrl = `https://graph.facebook.com/v17.0/${phoneNumber}/messages`;
    const messageResponse = await fetch(messageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: targetNumber,
        type: 'text',
        text: { body: messageText }
      })
    });
    
    const messageData = await messageResponse.json();
    console.log(`Cod de răspuns: ${messageResponse.status}`);
    console.log('Răspuns API:', JSON.stringify(messageData, null, 2));
    
    if (messageResponse.ok) {
      console.log('✅ Mesajul a fost trimis cu SUCCES!');
      
      // Afișăm ID-ul mesajului pentru referință
      if (messageData.messages && messageData.messages.length > 0) {
        console.log(`ID Mesaj: ${messageData.messages[0].id}`);
      }
      
      return true;
    } else {
      console.error('❌ Trimiterea mesajului a EȘUAT!');
      
      // Afișăm informații detaliate despre eroare
      if (messageData.error) {
        console.error(`Cod eroare: ${messageData.error.code}`);
        console.error(`Mesaj eroare: ${messageData.error.message}`);
        
        // Sugestii pentru erori comune
        if (messageData.error.code === 132000) {
          console.log('\nSugestie: Numărul de destinație trebuie să fie format internațional, fără "+" (ex: 407xxxxxxxx)');
        }
        if (messageData.error.message.includes('permission')) {
          console.log('\nSugestie: Asigurați-vă că token-ul API are permisiunile necesare sau că numărul de telefon este corect asociat contului.');
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ EROARE la trimiterea mesajului:', error.message);
    return false;
  }
}

// Executăm trimiterea de mesaj
sendMessage().catch(err => {
  console.error('Eroare neașteptată:', err);
});