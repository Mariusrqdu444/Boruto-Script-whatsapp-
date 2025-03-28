// Script pentru obținerea informațiilor despre contul WhatsApp Business
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Preluarea variabilelor de mediu
const apiToken = process.env.WHATSAPP_API_TOKEN;

async function getBusinessInfo() {
  console.log('=== Informații Cont WhatsApp Business API ===');
  console.log(`Token API disponibil: ${!!apiToken}`);
  console.log('-------------------------------------------');
  
  if (!apiToken) {
    console.error('EROARE: Token-ul API WhatsApp lipsește din variabilele de mediu');
    return false;
  }
  
  try {
    // 1. Obținem informații de bază despre cont
    console.log('1. Verificăm informații de bază despre cont...');
    const accountInfoUrl = `https://graph.facebook.com/v17.0/me`;
    const accountInfoResponse = await fetch(accountInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const accountInfo = await accountInfoResponse.json();
    console.log(`Cod de răspuns: ${accountInfoResponse.status}`);
    console.log('Răspuns API (cont):', JSON.stringify(accountInfo, null, 2));
    
    if (!accountInfoResponse.ok) {
      console.error('❌ Nu am putut obține informații despre cont!');
      return false;
    }
    
    // 2. Încercăm să obținem aplicațiile asociate
    console.log('\n2. Verificăm aplicațiile asociate cu contul...');
    const appsUrl = `https://graph.facebook.com/v17.0/${accountInfo.id}/apps`;
    const appsResponse = await fetch(appsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const appsInfo = await appsResponse.json();
    console.log(`Cod de răspuns: ${appsResponse.status}`);
    console.log('Răspuns API (aplicații):', JSON.stringify(appsInfo, null, 2));
    
    // 3. Încercăm să obținem WA Business Accounts
    console.log('\n3. Verificăm conturile WhatsApp Business...');
    const wabaUrl = `https://graph.facebook.com/v17.0/${accountInfo.id}/whatsapp_business_accounts`;
    const wabaResponse = await fetch(wabaUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const wabaInfo = await wabaResponse.json();
    console.log(`Cod de răspuns: ${wabaResponse.status}`);
    console.log('Răspuns API (WABA):', JSON.stringify(wabaInfo, null, 2));
    
    // Dacă avem WABA, încercăm să obținem numerele de telefon asociate
    if (wabaResponse.ok && wabaInfo.data && wabaInfo.data.length > 0) {
      const wabaId = wabaInfo.data[0].id;
      console.log(`\nWABA ID găsit: ${wabaId}`);
      
      console.log('\n4. Verificăm numerele de telefon asociate cu WABA...');
      const phoneNumbersUrl = `https://graph.facebook.com/v17.0/${wabaId}/phone_numbers`;
      const phoneNumbersResponse = await fetch(phoneNumbersUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const phoneNumbersInfo = await phoneNumbersResponse.json();
      console.log(`Cod de răspuns: ${phoneNumbersResponse.status}`);
      console.log('Răspuns API (numere telefon):', JSON.stringify(phoneNumbersInfo, null, 2));
      
      if (phoneNumbersResponse.ok && phoneNumbersInfo.data && phoneNumbersInfo.data.length > 0) {
        console.log('\nNumere de telefon găsite:');
        phoneNumbersInfo.data.forEach((phone, index) => {
          console.log(`${index + 1}. ${phone.display_phone_number} (ID: ${phone.id})`);
        });
      }
    }
    
    console.log('\n=== CONCLUZIE ===');
    console.log('✅ Verificarea informațiilor a fost completată.');
    console.log('Utilizați ID-urile din răspunsuri pentru a trimite mesaje.');
    
    return true;
  } catch (error) {
    console.error('❌ EROARE la obținerea informațiilor:', error.message);
    return false;
  }
}

// Rulăm scriptul
getBusinessInfo().catch(err => {
  console.error('Eroare neașteptată:', err);
});