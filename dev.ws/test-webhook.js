#!/usr/bin/env node

/**
 * Script de prueba para el webhook de WhatsApp
 * Simula el envío de eventos desde Meta a tu webhook local
 */

const axios = require('axios');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3002/whatsapp/webhook';
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'mi_token_secreto_abril_2024';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Test de verificación del webhook (GET)
async function testWebhookVerification() {
  log('\n🔍 Test 1: Verificación del Webhook (GET)', 'blue');
  log('─'.repeat(50), 'blue');

  try {
    const response = await axios.get(WEBHOOK_URL, {
      params: {
        'hub.mode': 'subscribe',
        'hub.verify_token': VERIFY_TOKEN,
        'hub.challenge': 'TEST_CHALLENGE_123',
      },
    });

    if (response.data === 'TEST_CHALLENGE_123') {
      log('✅ Verificación exitosa', 'green');
      log(`   Respuesta: ${response.data}`, 'green');
    } else {
      log('❌ Verificación fallida', 'red');
      log(`   Se esperaba: TEST_CHALLENGE_123`, 'red');
      log(`   Se recibió: ${response.data}`, 'red');
    }
  } catch (error) {
    log('❌ Error en la verificación:', 'red');
    log(`   ${error.message}`, 'red');
  }
}

// 2. Test de mensaje de texto entrante
async function testIncomingTextMessage() {
  log('\n📱 Test 2: Mensaje de Texto Entrante', 'blue');
  log('─'.repeat(50), 'blue');

  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15551234567',
                phone_number_id: 'PHONE_NUMBER_ID',
              },
              contacts: [
                {
                  profile: {
                    name: 'Juan Pérez Test',
                  },
                  wa_id: '5491112345678',
                },
              ],
              messages: [
                {
                  from: '5491112345678',
                  id: `wamid.TEST_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: {
                    body: '¡Hola! Este es un mensaje de prueba del webhook',
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log('✅ Mensaje enviado correctamente', 'green');
    log(`   Status: ${response.status}`, 'green');
    log(`   Respuesta: ${JSON.stringify(response.data)}`, 'green');
  } catch (error) {
    log('❌ Error al enviar mensaje:', 'red');
    log(`   ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
    }
  }
}

// 3. Test de mensaje con imagen
async function testIncomingImageMessage() {
  log('\n🖼️  Test 3: Mensaje con Imagen', 'blue');
  log('─'.repeat(50), 'blue');

  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15551234567',
                phone_number_id: 'PHONE_NUMBER_ID',
              },
              contacts: [
                {
                  profile: {
                    name: 'María García Test',
                  },
                  wa_id: '5491187654321',
                },
              ],
              messages: [
                {
                  from: '5491187654321',
                  id: `wamid.IMAGE_TEST_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'image',
                  image: {
                    id: 'IMAGE_ID_123456',
                    mime_type: 'image/jpeg',
                    sha256: 'abc123sha256hash',
                    caption: 'Imagen de prueba',
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log('✅ Imagen enviada correctamente', 'green');
    log(`   Status: ${response.status}`, 'green');
  } catch (error) {
    log('❌ Error al enviar imagen:', 'red');
    log(`   ${error.message}`, 'red');
  }
}

// 4. Test de cambio de estado (mensaje entregado)
async function testMessageStatusUpdate() {
  log('\n📬 Test 4: Cambio de Estado de Mensaje', 'blue');
  log('─'.repeat(50), 'blue');

  const payload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15551234567',
                phone_number_id: 'PHONE_NUMBER_ID',
              },
              statuses: [
                {
                  id: 'wamid.STATUS_TEST_123',
                  recipient_id: '5491112345678',
                  status: 'delivered',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  conversation: {
                    id: 'CONVERSATION_ID',
                    origin: {
                      type: 'service',
                    },
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log('✅ Estado actualizado correctamente', 'green');
    log(`   Status: ${response.status}`, 'green');
  } catch (error) {
    log('❌ Error al actualizar estado:', 'red');
    log(`   ${error.message}`, 'red');
  }
}

// 5. Test de consulta de mensajes
async function testGetMessages() {
  log('\n📋 Test 5: Consultar Mensajes Almacenados', 'blue');
  log('─'.repeat(50), 'blue');

  try {
    const response = await axios.get(`${WEBHOOK_URL.replace('/webhook', '')}/incoming-messages?page=1&limit=10`);

    log('✅ Mensajes obtenidos correctamente', 'green');
    log(`   Total: ${response.data.total}`, 'green');
    log(`   Mensajes en esta página: ${response.data.data.length}`, 'green');

    if (response.data.data.length > 0) {
      log('\n   Últimos mensajes:', 'yellow');
      response.data.data.slice(0, 3).forEach((msg, idx) => {
        log(`   ${idx + 1}. De: ${msg.phone_from} (${msg.contact_name || 'Sin nombre'})`, 'yellow');
        log(`      Tipo: ${msg.message_type}`, 'yellow');
        if (msg.message_text) {
          log(`      Texto: "${msg.message_text.substring(0, 50)}${msg.message_text.length > 50 ? '...' : ''}"`, 'yellow');
        }
      });
    }
  } catch (error) {
    log('❌ Error al consultar mensajes:', 'red');
    log(`   ${error.message}`, 'red');
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════╗', 'blue');
  log('║   TEST SUITE - WEBHOOK DE WHATSAPP          ║', 'blue');
  log('╚═══════════════════════════════════════════════╝', 'blue');
  log(`\nWebhook URL: ${WEBHOOK_URL}`, 'yellow');
  log(`Verify Token: ${VERIFY_TOKEN}\n`, 'yellow');

  await testWebhookVerification();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await testIncomingTextMessage();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await testIncomingImageMessage();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await testMessageStatusUpdate();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await testGetMessages();

  log('\n╔═══════════════════════════════════════════════╗', 'blue');
  log('║            TESTS COMPLETADOS                 ║', 'blue');
  log('╚═══════════════════════════════════════════════╝\n', 'blue');
}

// Ejecutar
runAllTests().catch((error) => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
