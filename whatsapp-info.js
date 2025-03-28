// Script pentru verificarea informațiilor contului WhatsApp Business
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Preluarea variabilelor de mediu
const apiToken = process.env.WHATSAPP_API_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '606093835919104';

async function getBusinessInfo() {
  if (!apiToken) {
    console.error('EROARE: Token-ul API WhatsApp lipsește din variabilele de mediu');
    return;
  }

  console.log('==== INFORMAȚII CONT WHATSAPP BUSINESS ====');
  
  try {
    // Verificare cont
    console.log('\n[1] Verificare cont Meta:');
    const meResponse = await fetch('https://graph.facebook.com/v17.0/me', {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ Token API valid!');
      console.log('  Nume cont:', meData.name);
      console.log('  ID cont:', meData.id);
    } else {
      console.error('❌ Token API invalid');
      const errorData = await meResponse.json();
      console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
      return;
    }
    
    // Verificare ID număr de telefon
    console.log('\n[2] Verificare Phone Number ID:');
    const phoneIdResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    
    if (phoneIdResponse.ok) {
      const phoneIdData = await phoneIdResponse.json();
      console.log('✅ Phone Number ID valid!');
      console.log('  Detalii:', JSON.stringify(phoneIdData, null, 2));
    } else {
      console.error('❌ Phone Number ID invalid');
      const errorData = await phoneIdResponse.json();
      console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
    }
    
    // Verificare template-uri
    console.log('\n[3] Verificare template-uri disponibile:');
    try {
      // Utilizăm ID-ul contului pentru a verifica template-urile
      const accountId = meData.id;
      
      const templatesResponse = await fetch(`https://graph.facebook.com/v17.0/${accountId}/message_templates`, {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        console.log(`✅ Template-uri disponibile: ${templatesData.data?.length || 0}`);
        
        if (templatesData.data?.length > 0) {
          console.log('  Lista template-uri:');
          templatesData.data.forEach((template, i) => {
            console.log(`  ${i+1}. ${template.name} (Status: ${template.status})`);
          });
        } else {
          console.log('  Nu există template-uri configurate.');
        }
      } else {
        console.error('❌ Eroare la verificarea template-urilor');
        const errorData = await templatesResponse.json();
        console.error('  Detalii eroare:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error('❌ Eroare la verificarea template-urilor:', error.message);
    }
    
    console.log('\n==== VERIFICARE COMPLETĂ ====');
    console.log('Informații cont și configurare WhatsApp Business API verificate.');
    console.log('Puteți utiliza aceste informații pentru configurarea aplicației.');
    
  } catch (error) {
    console.error('Eroare neașteptată:', error.message);
  }
}

// Rulăm verificarea
getBusinessInfo().catch(err => {
  console.error('Eroare neașteptată în timpul verificării:', err);
});