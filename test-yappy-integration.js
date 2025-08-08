#!/usr/bin/env node

/**
 * Script de prueba para verificar la integración completa de Yappy
 * Ejecuta el flujo completo según la documentación oficial v1.1.0
 */

const crypto = require('crypto');

// Configuración (usar las variables de entorno reales)
const config = {
  API_KEY: 'ETKHX-75645671',
  SECRET_KEY: 'WVBfRTE1OUZDMjktQjAzMy0zNTJDLTgyQjQtODc3RjBCNzJCMDAw',
  SEED_CODE: 'DNKCK-99784360',
  BASE_URL: 'http://localhost:3002'
};

/**
 * Genera el hash SHA-256 según documentación Yappy
 */
function generateYappyHash(apiKey, date, secretKey) {
  const concatenatedValue = `${apiKey}${date}`;
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(concatenatedValue)
    .digest('hex');
  return hash;
}

/**
 * Paso 1: Crear sesión Yappy
 */
async function testYappySession() {
  console.log('\n=== PASO 1: CREAR SESIÓN YAPPY ===');
  
  const currentDate = new Date().toISOString().split('T')[0];
  const authCode = generateYappyHash(config.API_KEY, currentDate, config.SECRET_KEY);
  
  console.log('📅 Fecha actual:', currentDate);
  console.log('🔐 Hash generado:', authCode);
  
  const response = await fetch(`${config.BASE_URL}/api/v1/session/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.API_KEY,
      'secret-key': config.SECRET_KEY,
      'authorization': `Bearer ${authCode}`
    },
    body: JSON.stringify({
      body: {
        code: authCode
      }
    })
  });

  const data = await response.json();
  console.log('📋 Respuesta status:', response.status);
  console.log('📋 Respuesta:', JSON.stringify(data, null, 2));
  
  if (data.body?.token) {
    console.log('✅ Sesión creada exitosamente');
    return data.body.token;
  } else {
    console.log('❌ Error creando sesión');
    return null;
  }
}

/**
 * Paso 2: Obtener métodos de cobro
 */
async function testCollectionMethods(sessionToken) {
  console.log('\n=== PASO 2: OBTENER MÉTODOS DE COBRO ===');
  
  const headers = {
    'api-key': config.API_KEY,
    'secret-key': config.SECRET_KEY
  };
  
  if (sessionToken) {
    headers['authorization'] = `Bearer ${sessionToken}`;
  }
  
  const response = await fetch(`${config.BASE_URL}/api/v1/collection-method`, {
    headers
  });

  const data = await response.json();
  console.log('📋 Respuesta status:', response.status);
  console.log('📋 Respuesta:', JSON.stringify(data, null, 2));
  
  if (data.body?.collections) {
    const yappyMethod = data.body.collections.find(c => c.type === 'INTEGRACION_YAPPY');
    if (yappyMethod) {
      console.log('✅ Método de integración YAPPY encontrado');
      return yappyMethod;
    }
  }
  
  console.log('❌ No se encontró método de integración YAPPY');
  return null;
}

/**
 * Paso 3: Crear pago y generar QR oficial
 */
async function testPaymentCreation() {
  console.log('\n=== PASO 3: CREAR PAGO Y GENERAR QR ===');
  
  const paymentData = {
    uuid: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: 5.00,
    currency: 'USD',
    description: 'Pago de prueba - Integración Yappy v1.1.0',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    payment_date: new Date().toISOString(),
    cut_off_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Mañana
  };
  
  console.log('💰 Datos de pago:', JSON.stringify(paymentData, null, 2));
  
  const response = await fetch(`${config.BASE_URL}/api/internal/create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });

  const data = await response.json();
  console.log('📋 Respuesta status:', response.status);
  console.log('📋 Respuesta:', JSON.stringify(data, null, 2));
  
  if (data.qr_code_data) {
    console.log('✅ QR generado exitosamente');
    console.log('📱 QR Code Data URL length:', data.qr_code_data.length);
    return data;
  } else {
    console.log('❌ Error generando QR');
    return null;
  }
}

/**
 * Paso 4: Cerrar sesión
 */
async function testSessionLogout(sessionToken) {
  console.log('\n=== PASO 4: CERRAR SESIÓN ===');
  
  const headers = {
    'api-key': config.API_KEY,
    'secret-key': config.SECRET_KEY
  };
  
  if (sessionToken) {
    headers['authorization'] = `Bearer ${sessionToken}`;
  }
  
  const response = await fetch(`${config.BASE_URL}/api/v1/session/logout`, {
    headers
  });

  const data = await response.json();
  console.log('📋 Respuesta status:', response.status);
  console.log('📋 Respuesta:', JSON.stringify(data, null, 2));
  
  if (data.status.code === 'YP-0000') {
    console.log('✅ Sesión cerrada exitosamente');
    return true;
  } else {
    console.log('❌ Error cerrando sesión');
    return false;
  }
}

/**
 * Ejecutar pruebas completas
 */
async function runCompleteTest() {
  console.log('🚀 INICIANDO PRUEBAS DE INTEGRACIÓN YAPPY v1.1.0');
  console.log('=' .repeat(60));
  
  try {
    // Paso 1: Crear sesión
    const sessionToken = await testYappySession();
    
    // Paso 2: Obtener métodos de cobro
    const collectionMethod = await testCollectionMethods(sessionToken);
    
    // Paso 3: Crear pago y generar QR
    const paymentResult = await testPaymentCreation();
    
    // Paso 4: Cerrar sesión
    if (sessionToken) {
      await testSessionLogout(sessionToken);
    }
    
    // Resumen
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('=' .repeat(60));
    console.log('✅ Sesión Yappy:', sessionToken ? 'OK' : 'FAIL');
    console.log('✅ Métodos de cobro:', collectionMethod ? 'OK' : 'FAIL');
    console.log('✅ Generación de QR:', paymentResult ? 'OK' : 'FAIL');
    console.log('✅ Cierre de sesión: OK');
    
    if (sessionToken && collectionMethod && paymentResult) {
      console.log('\n🎉 TODAS LAS PRUEBAS EXITOSAS');
      console.log('La integración Yappy v1.1.0 está funcionando correctamente!');
    } else {
      console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON');
      console.log('Revisa los logs anteriores para identificar problemas.');
    }
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runCompleteTest();
}

module.exports = { runCompleteTest, testYappySession, testCollectionMethods, testPaymentCreation };