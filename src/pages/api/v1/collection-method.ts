import type { NextApiRequest, NextApiResponse } from 'next';
import { validateYappyAuth, validateSessionToken } from '@/lib/yappy-auth';
import { supabase } from '@/lib/supabase';

interface CollectionMethodResponse {
  body?: {
    collections: Array<{
      alias: string;
      type: string;
      details?: Array<{
        id: string;
        value: string;
      }>;
    }>;
  };
  status: {
    code: string;
    description: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CollectionMethodResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: {
        code: 'YP-0002',
        description: 'Error, ha ocurrido un error en procesar los datos. Contacte al administrador'
      }
    });
  }

  // Validar autenticación básica (API Key + Secret Key)
  if (!validateYappyAuth(req, false)) {
    return res.status(401).json({
      status: {
        code: 'YP-0008',
        description: 'Error, cabeceras obligatorias faltantes en la peticion'
      }
    });
  }

  // Validar token de sesión si se proporciona
  const authorization = req.headers['authorization'];
  if (authorization) {
    const token = authorization.replace('Bearer ', '');
    
    // Verificar que el token exista en la base de datos y esté activo
    const { data: sessionData, error: sessionError } = await supabase
      .from('yappy_sessions')
      .select('*')
      .eq('token', token)
      .eq('state', 'OPEN')
      .single();
    
    if (sessionError || !sessionData) {
      return res.status(401).json({
        status: {
          code: 'YP-0011',
          description: 'Error, token de sesión inválido o expirado'
        }
      });
    }
  }

  try {
    // Métodos de cobro configurados para este comercio según documentación
    const collections = [
      {
        alias: 'test01',
        type: 'DIRECTORIO'
      },
      {
        alias: 'boton01',
        type: 'BOTON_DE_PAGO',
        details: [
          {
            id: 'url',
            value: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout`
          }
        ]
      },
      {
        alias: 'integration01',
        type: 'INTEGRACION_YAPPY',
        details: [
          {
            id: 'groupId',
            value: 'group01'
          },
          {
            id: 'deviceId',
            value: 'caja01'
          }
        ]
      },
      {
        alias: 'pos01',
        type: 'PUNTO_DE_VENTA',
        details: [
          {
            id: 'terminalId',
            value: '123456'
          }
        ]
      }
    ];

    return res.status(200).json({
      body: {
        collections
      },
      status: {
        code: 'YP-0000',
        description: 'Se ha realizado la ejecución del servicio correctamente'
      }
    });

  } catch (error: any) {
    console.error('Collection method error:', error);
    return res.status(500).json({
      status: {
        code: 'YP-9999',
        description: 'Error, el servicio ha tardado en responder'
      }
    });
  }
}