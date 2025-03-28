// Script pentru testarea formatului corect al numerelor de telefon pentru WhatsApp Business API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Preluarea variabilelor de mediu
const apiToken = process.env.WHATSAPP_API_TOKEN;
const phoneNumberId = '606093835919104';

// Funcție pentru testarea unui format de număr de telefon
async function testPhoneFormat(phoneNumber) {
  console.log(`\nTestăm formatul: "${phoneNumber}"`);
  
  try {
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
        text: { body: `Test format număr de telefon: ${phoneNumber}` }
      })
    });
    
    const data = await response.json();
    console.log(`Status răspuns: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ FORMAT VALID! Mesaj trimis cu succes');
      console.log(`ID mesaj: ${data.messages[0].id}`);
      return true;
    } else {
      console.log('❌ Format invalid. Eroare:');
      console.log(JSON.stringify(data.error || data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Eroare în timpul testării:', error.message);
    return false;
  }
}

// Testăm diferite formate de numere de telefon
async function runTests() {
  // Înlocuiți cu un număr real pentru test
  const baseNumber = '407xxxxxxxx'; // Exemplu pentru România: 407xxxxxxxx
  
  console.log('==== TEST FORMATE NUMERE TELEFON PENTRU WHATSAPP BUSINESS API ====');
  console.log('Număr de bază pentru teste:', baseNumber);
  
  const formats = [
    baseNumber,                       // Format fără prefixe (407xxxxxxxx)
    `+${baseNumber}`,                 // Cu prefix + (+407xxxxxxxx)
    `00${baseNumber}`,                // Cu prefix 00 (00407xxxxxxxx)
    `${baseNumber.replace(/^4/, '')}`,// Fără codul de țară (07xxxxxxxx)
    `+${baseNumber.replace(/^4/, '')}`,// Cu + dar fără codul de țară (+07xxxxxxxx)
    `${baseNumber.replace(/^4/, '+4')}`,// Format cu + în fața codului de țară (+407xxxxxxxx alt format)
  ];
  
  console.log('\nTestăm următoarele formate:');
  formats.forEach((format, i) => console.log(`${i+1}. ${format}`));
  
  const results = [];
  
  for (const format of formats) {
    const result = await testPhoneFormat(format);
    results.push({ format, valid: result });
  }
  
  console.log('\n==== REZULTATE ====');
  results.forEach(result => {
    console.log(`${result.valid ? '✅' : '❌'} ${result.format}`);
  });
  
  const validFormats = results.filter(r => r.valid).map(r => r.format);
  
  console.log('\n==== CONCLUZIE ====');
  if (validFormats.length > 0) {
    console.log('✅ Formate valide detectate:', validFormats.length);
    console.log('Formate care funcționează:');
    validFormats.forEach(format => console.log(`- ${format}`));
    console.log('\nRecomandare: Utilizați aceste formate în aplicația web.');
  } else {
    console.log('❌ Niciun format valid găsit.');
    console.log('Posibile cauze:');
    console.log('- Numărul de telefon de test nu este înregistrat în WhatsApp');
    console.log('- API-ul nu este configurat corect');
    console.log('- ID-ul numărului de telefon sau token-ul API sunt incorecte');
  }
}

// Rulăm testele
runTests().catch(err => {
  console.error('Eroare neașteptată:', err);
});