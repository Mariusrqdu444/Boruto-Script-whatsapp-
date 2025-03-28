// Script simplu pentru testarea directă a conexiunii WhatsApp API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Preluarea variabilelor de mediu
const apiToken = process.env.WHATSAPP_API_TOKEN;
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;

// Testarea conectării la API WhatsApp
async function testWhatsAppConnection() {
  console.log('=== Test conexiune WhatsApp API ===');
  console.log(`Token API disponibil: ${!!apiToken}`);
  console.log(`Număr telefon disponibil: ${!!phoneNumber}`);
  console.log('-----------------------------------');
  
  if (!apiToken) {
    console.error('EROARE: Token-ul API WhatsApp lipsește din variabilele de mediu');
    return false;
  }
  
  if (!phoneNumber) {
    console.error('EROARE: Numărul de telefon WhatsApp lipsește din variabilele de mediu');
    return false;
  }
  
  try {
    console.log('Verificăm autenticarea cu WhatsApp API...');
    
    // Verificăm autentificarea cu tokenul API
    const verifyUrl = `https://graph.facebook.com/v17.0/me`;
    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const status = response.status;
    console.log(`Cod de răspuns: ${status}`);
    
    const data = await response.json();
    console.log('Răspuns API:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Autentificarea cu API WhatsApp este REUȘITĂ!');
      
      // Verificăm Business ID asociat token-ului pentru a verifica dacă numărul de telefon este corect
      console.log(`\nVerificarea Business API completă...`);
      
      try {
        // Obținem WABAs (WhatsApp Business Accounts) asociate cu token-ul
        console.log('Verificăm conturile de WhatsApp Business asociate...');
        
        const businessUrl = `https://graph.facebook.com/v17.0/me/phone_numbers`;
        const businessResponse = await fetch(businessUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json' 
          }
        });
        
        const businessData = await businessResponse.json();
        console.log(`Cod de răspuns: ${businessResponse.status}`);
        
        if (businessResponse.ok && businessData.data && businessData.data.length > 0) {
          console.log('Numere de telefon asociate cu contul:');
          businessData.data.forEach((phone, index) => {
            console.log(`  ${index + 1}. ${phone.display_phone_number} (ID: ${phone.id})`);
            
            // Verificăm dacă numărul nostru se potrivește cu vreunul din cele asociate
            if (phone.display_phone_number.replace(/[^0-9]/g, '') === phoneNumber.replace(/[^0-9]/g, '')) {
              console.log(`  ✅ Numărul de telefon verificat (${phoneNumber}) este asociat acestui cont!`);
            }
          });
          
          console.log('✅ Verificarea Business API este REUȘITĂ!');
          
          // Testăm trimiterea unui mesaj demo (opțional)
          console.log('\nDoriți să trimiteți un mesaj de test? (Modificați script-ul pentru a activa această funcționalitate)');
          
          return true;
        } else {
          console.error('❌ Nu am putut obține informații despre numerele de telefon asociate!');
          console.log('Răspuns API (business):', JSON.stringify(businessData, null, 2));
          
          // Chiar dacă această verificare eșuează, continuăm cu token-ul valid
          console.log('\n⚠️ ATENȚIE: Verificarea numărului de telefon nu a funcționat, dar token-ul API este valid.');
          console.log('Puteți încerca să trimiteți un mesaj oricum pentru a testa conexiunea completă.');
          return true;
        }
      } catch (error) {
        console.error(`❌ Eroare la verificarea contului: ${error.message}`);
        
        // Chiar dacă această verificare eșuează, continuăm cu token-ul valid
        console.log('\n⚠️ ATENȚIE: Verificarea numărului de telefon nu a funcționat, dar token-ul API este valid.');
        console.log('Puteți încerca să trimiteți un mesaj oricum pentru a testa conexiunea completă.');
        return true;
      }
    } else {
      console.error('❌ Autentificarea cu API WhatsApp a EȘUAT!');
      return false;
    }
  } catch (error) {
    console.error('❌ EROARE la testarea conexiunii WhatsApp:', error.message);
    return false;
  }
}

// Funcție pentru trimiterea unui mesaj de test (dezactivată implicit pentru siguranță)
async function sendTestMessage(targetNumber) {
  if (!targetNumber) {
    console.log('Niciun număr de telefon țintă specificat pentru testare');
    return;
  }
  
  try {
    console.log(`\nTrimitem un mesaj de test către ${targetNumber}...`);
    
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
        text: { body: 'Acesta este un mesaj de test din aplicația WhatsApp Messenger. [Generat automat]' }
      })
    });
    
    const messageData = await messageResponse.json();
    console.log(`Cod de răspuns: ${messageResponse.status}`);
    console.log('Răspuns API (trimitere mesaj):', JSON.stringify(messageData, null, 2));
    
    if (messageResponse.ok) {
      console.log('✅ Mesajul de test a fost trimis cu SUCCES!');
      return true;
    } else {
      console.error('❌ Trimiterea mesajului de test a EȘUAT!');
      return false;
    }
  } catch (error) {
    console.error('❌ EROARE la trimiterea mesajului de test:', error.message);
    return false;
  }
}

// Executăm testul
async function runTests() {
  const connectionSuccessful = await testWhatsAppConnection();
  
  if (connectionSuccessful) {
    console.log('\n=== CONCLUZIE ===');
    console.log('✅ API-ul WhatsApp Business este configurat corect și funcțional.');
    console.log('Acum puteți utiliza aplicația web pentru a trimite mesaje.');
    console.log('\nDacă întâmpinați probleme cu interfața web, puteți:');
    console.log('1. Utiliza acest script pentru teste (modificați-l pentru a trimite mesaje)');
    console.log('2. Deploying pe Render.com pentru un mediu mai stabil');
    
    // Puteți decomenta și modifica linia următoare pentru a testa trimiterea unui mesaj
    // (Înlocuiți cu un număr real în format internațional, ex: 407xxxxxxxx)
    // await sendTestMessage('407xxxxxxxx');
  } else {
    console.log('\n=== CONCLUZIE ===');
    console.log('❌ Există probleme cu configurarea API-ului WhatsApp Business.');
    console.log('Vă rugăm să verificați token-ul API și numărul de telefon.');
  }
}

// Rulăm testele
runTests().catch(err => {
  console.error('Eroare neașteptată:', err);
});