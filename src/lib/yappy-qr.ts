import { generateYappyHash } from './yappy-auth';

interface YappyQRData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
}

/**
 * Genera una sesión válida de Yappy y obtiene el token
 */
export async function createYappySession(): Promise<string | null> {
  const apiKey = process.env.YAPPY_COMMERCE_API_KEY!;
  const secretKey = process.env.YAPPY_COMMERCE_SECRET_KEY!;
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Generar hash según documentación
  const authCode = generateYappyHash(apiKey, currentDate, secretKey);
  
  try {
    // Llamar al endpoint de login interno
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/v1/session/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'secret-key': secretKey,
        'authorization': `Bearer ${authCode}`
      },
      body: JSON.stringify({
        body: {
          code: authCode
        }
      })
    });

    const data = await response.json();
    
    if (data.status.code === 'YP-0000' && data.body?.token) {
      return data.body.token;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating Yappy session:', error);
    return null;
  }
}

/**
 * Obtiene los datos de método de cobro (groupId, deviceId) con sesión activa
 */
export async function getYappyCollectionMethod(sessionToken?: string): Promise<{groupId: string, deviceId: string, alias: string} | null> {
  try {
    const apiKey = process.env.YAPPY_COMMERCE_API_KEY!;
    const secretKey = process.env.YAPPY_COMMERCE_SECRET_KEY!;

    const headers: Record<string, string> = {
      'api-key': apiKey,
      'secret-key': secretKey,
    };

    // Incluir token de sesión si está disponible
    if (sessionToken) {
      headers['authorization'] = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/v1/collection-method`, {
      headers
    });

    const data = await response.json();
    
    if (data.status.code === 'YP-0000' && data.body?.collections) {
      // Buscar el método de integración YAPPY
      const yappyMethod = data.body.collections.find((c: any) => c.type === 'INTEGRACION_YAPPY');
      
      if (yappyMethod && yappyMethod.details) {
        const groupId = yappyMethod.details.find((d: any) => d.id === 'groupId')?.value;
        const deviceId = yappyMethod.details.find((d: any) => d.id === 'deviceId')?.value;
        
        if (groupId && deviceId) {
          return {
            groupId,
            deviceId,
            alias: yappyMethod.alias
          };
        }
      }
    }
    
    console.warn('Collection method response:', data);
    return null;
  } catch (error) {
    console.error('Error getting collection method:', error);
    return null;
  }
}

/**
 * Genera la URL de pago oficial de Yappy según documentación
 * Formato: https://yappy.com/payment?merchant=X&alias=Y&amount=Z&currency=USD&reference=R&description=D&groupId=G&deviceId=DV
 */
export function generateYappyPaymentURL(data: YappyQRData, collectionData: {groupId: string, deviceId: string, alias: string}): string {
  const apiKey = process.env.YAPPY_COMMERCE_API_KEY!;
  
  // URL base oficial de Yappy para pagos
  const baseURL = 'https://yappy.com/payment';
  
  const params = new URLSearchParams({
    merchant: apiKey,
    alias: collectionData.alias,
    amount: data.amount.toString(),
    currency: data.currency,
    reference: data.reference,
    description: encodeURIComponent(data.description),
    groupId: collectionData.groupId,
    deviceId: collectionData.deviceId
  });

  const paymentURL = `${baseURL}?${params.toString()}`;
  console.log('Generated official Yappy payment URL:', paymentURL);
  
  return paymentURL;
}

/**
 * Genera el flujo completo de creación de QR según documentación Yappy
 * 1. Crear sesión válida
 * 2. Obtener método de cobro con groupId/deviceId
 * 3. Generar URL oficial
 * 4. Convertir a QR
 */
export async function generateCompleteYappyQR(paymentData: YappyQRData): Promise<string | null> {
  try {
    console.log('Starting complete Yappy QR generation process...');
    
    // Paso 1: Crear sesión válida con Yappy
    const sessionToken = await createYappySession();
    if (!sessionToken) {
      console.error('Failed to create Yappy session');
      return null;
    }
    console.log('✓ Session created successfully');

    // Paso 2: Obtener método de cobro con groupId y deviceId
    const collectionMethod = await getYappyCollectionMethod(sessionToken);
    if (!collectionMethod) {
      console.error('Failed to get collection method');
      return null;
    }
    console.log('✓ Collection method obtained:', collectionMethod);

    // Paso 3: Generar URL oficial de Yappy
    const paymentURL = generateYappyPaymentURL(paymentData, collectionMethod);
    console.log('✓ Official payment URL generated:', paymentURL);

    return paymentURL;

  } catch (error) {
    console.error('Error in complete Yappy QR generation:', error);
    return null;
  }
}