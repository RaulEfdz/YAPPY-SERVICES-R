import type { NextApiRequest, NextApiResponse } from 'next';
import { validateYappyAuth, generateSessionToken, generateYappyHash } from '@/lib/yappy-auth';
import { supabase } from '@/lib/supabase';

interface SessionRequestBody {
  body: {
    code: string;
  };
}

interface SessionResponse {
  body?: {
    token: string;
    state: string;
    open_at: string;
  };
  status: {
    code: string;
    description: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SessionResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: {
        code: 'YP-0002',
        description: 'Error, ha ocurrido un error en procesar los datos. Contacte al administrador'
      }
    });
  }

  // Validar autenticación según especificación YAML con validación de hash
  if (!validateYappyAuth(req, true)) {
    return res.status(401).json({
      status: {
        code: 'YP-0008',
        description: 'Error, cabeceras obligatorias faltantes en la peticion'
      }
    });
  }

  try {
    const { body }: SessionRequestBody = req.body;

    if (!body || !body.code) {
      return res.status(400).json({
        status: {
          code: 'YP-0010',
          description: 'Error, uno o mas campos del cuerpo de la peticion no cumplen con los valores enumerados'
        }
      });
    }

    // Validar el código hash enviado por Yappy coincida con el generado
    const receivedCode = body.code;
    const apiKey = process.env.YAPPY_COMMERCE_API_KEY!;
    const secretKey = process.env.YAPPY_COMMERCE_SECRET_KEY!;
    const currentDate = new Date().toISOString().split('T')[0];
    const expectedCode = generateYappyHash(apiKey, currentDate, secretKey);
    
    console.log('Received session code:', receivedCode);
    console.log('Expected session code:', expectedCode);

    if (receivedCode !== expectedCode) {
      return res.status(401).json({
        status: {
          code: 'YP-0009',
          description: 'Error, el código de autenticación no es válido'
        }
      });
    }

    // Generar token de sesión
    const sessionToken = generateSessionToken();
    const openAt = new Date().toISOString();

    // Guardar sesión en la base de datos
    const { error: dbError } = await supabase
      .from('yappy_sessions')
      .insert({
        token: sessionToken,
        code: receivedCode,
        state: 'OPEN',
        open_at: openAt,
        created_at: openAt
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        status: {
          code: 'YP-9999',
          description: 'Error, el servicio ha tardado en responder'
        }
      });
    }

    // Respuesta exitosa según especificación
    return res.status(200).json({
      body: {
        token: sessionToken,
        state: 'OPEN',
        open_at: openAt
      },
      status: {
        code: 'YP-0000',
        description: 'Se ha realizado la ejecución del servicio correctamente'
      }
    });

  } catch (error: any) {
    console.error('Session login error:', error);
    return res.status(500).json({
      status: {
        code: 'YP-9999',
        description: 'Error, el servicio ha tardado en responder'
      }
    });
  }
}