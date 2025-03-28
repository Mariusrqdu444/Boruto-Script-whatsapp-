// Script avansat pentru testarea și depanarea API-ului WhatsApp
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Preluarea variabilelor de mediu
const apiToken = process.env.WHATSAPP_API_TOKEN;
const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
const phoneNumberId = '606093835919104'; // Utilizăm valoarea corectă hardcodata pentru ID-ul de telefon

// ID-ul Business API
const businessAccountId = '102189479486060'; // Completați cu ID-ul dumneavoastră de business account

async function testWhatsAppAPI() {
  if (!apiToken) {
    console.error('EROARE: Token-ul API WhatsApp lipsește din variabilele de mediu');
    return;
  }

  console.log('==== TESTARE AVANSATĂ WHATSAPP BUSINESS API ====');
  
  // Test 1: Verificare token API
  console.log('\n[TEST 1] Verificare token API...');
  try {
    const meResponse = await fetch('https://graph.facebook.com/v17.0/me', {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Token API valid');
      console.log('  Cont asociat:', meData.name);
      console.log('  ID cont:', meData.id);
    } else {
      console.error('❌ Token API invalid');
      const errorData = await meResponse.json();
      console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Eroare la verificarea token-ului:', error.message);
  }
  
  // Test 2: Verificare Phone Number ID
  console.log('\n[TEST 2] Verificare Phone Number ID...');
  try {
    const phoneIdResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    if (phoneIdResponse.ok) {
      const phoneIdData = await phoneIdResponse.json();
      console.log('✅ Phone Number ID valid');
      console.log('  Detalii:', JSON.stringify(phoneIdData, null, 2));
    } else {
      console.error('❌ Phone Number ID invalid');
      const errorData = await phoneIdResponse.json();
      console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Eroare la verificarea Phone Number ID:', error.message);
  }
  
  // Test 3: Verificare Business Account
  console.log('\n[TEST 3] Verificare Business Account...');
  try {
    // Lista conturilor business și telefoanelor asociate
    const businessResponse = await fetch(`https://graph.facebook.com/v17.0/${businessAccountId}/phone_numbers`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      console.log('✅ Business Account valid');
      console.log('  Numere asociate:', businessData.data.length);
      
      for (const phone of businessData.data) {
        console.log('  - Număr:', phone.display_phone_number);
        console.log('    ID:', phone.id);
        console.log('    Status:', phone.verified_name || 'Neverificat');
      }
    } else {
      console.error('❌ Eroare la verificarea Business Account');
      const errorData = await businessResponse.json();
      console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Eroare la verificarea Business Account:', error.message);
  }
  
  // Test 4: Trimitere mesaj de test (format alternativ)
  console.log('\n[TEST 4] Trimitere mesaj de test (format alternativ)...');
  
  // Număr de test (MODIFICAȚI CU NUMĂRUL DVS!)
  const testNumber = '407xxxxxxxx'; // Înlocuiți cu un număr real de test
  
  // Variante de formatare a numărului de telefon pentru test
  const phoneVariants = [
    testNumber,
    `+${testNumber}`,
    testNumber.replace(/^(\d{2})/, '+$1'),
    testNumber.replace(/^(\d{2})/, '00$1')
  ];
  
  console.log('Variante de formatare testate:');
  phoneVariants.forEach((variant, i) => console.log(`  ${i+1}. ${variant}`));
  
  for (const [i, phoneVariant] of phoneVariants.entries()) {
    console.log(`\n[TEST 4.${i+1}] Testare cu formatul: ${phoneVariant}`);
    
    try {
      const sendResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneVariant,
          type: 'text',
          text: { body: `Test WhatsApp API [Variant ${i+1}: ${phoneVariant}]` }
        })
      });
      
      const sendData = await sendResponse.json();
      
      if (sendResponse.ok) {
        console.log('✅ Mesaj trimis cu succes!');
        console.log('  ID mesaj:', sendData.messages?.[0]?.id);
      } else {
        console.error('❌ Eroare la trimiterea mesajului');
        console.error('  Cod de răspuns:', sendResponse.status);
        console.error('  Detalii eroare:', JSON.stringify(sendData, null, 2));
      }
    } catch (error) {
      console.error('❌ Excepție la trimiterea mesajului:', error.message);
    }
  }
  
  // Test 5: Verificare template-uri
  console.log('\n[TEST 5] Verificare template-uri disponibile...');
  try {
    const templatesResponse = await fetch(`https://graph.facebook.com/v17.0/${businessAccountId}/message_templates`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    if (templatesResponse.ok) {
      const templatesData = await templatesResponse.json();
      console.log('✅ Template-uri disponibile:', templatesData.data.length);
      
      if (templatesData.data.length > 0) {
        console.log('  Template-uri:');
        templatesData.data.forEach((template, i) => {
          console.log(`  ${i+1}. ${template.name} (Status: ${template.status})`);
        });
      }
    } else {
      console.error('❌ Eroare la verificarea template-urilor');
      const errorData = await templatesResponse.json();
      console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('❌ Eroare la verificarea template-urilor:', error.message);
  }
  
  console.log('\n==== TESTARE FINALIZATĂ ====');
  console.log('Pentru mai multe detalii, consultați documentația WhatsApp Business API:');
  console.log('https://developers.facebook.com/docs/whatsapp/cloud-api');
}

// Rulăm testele
testWhatsAppAPI().catch(err => {
  console.error('Eroare neașteptată în timpul testării:', err);
});