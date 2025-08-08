import type { NextApiRequest, NextApiResponse } from 'next';
import { validateYappyAuth } from '@/lib/yappy-auth';
import { supabase } from '@/lib/supabase';

interface LogoutResponse {
  status: {
    code: string;
    description: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LogoutResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: {
        code: 'YP-0002',
        description: 'Error, ha ocurrido un error en procesar los datos. Contacte al administrador'
      }
    });
  }

  // Validar autenticación básica
  if (!validateYappyAuth(req, false)) {
    return res.status(401).json({
      status: {
        code: 'YP-0008',
        description: 'Error, cabeceras obligatorias faltantes en la peticion'
      }
    });
  }

  try {
    // Cerrar sesión si se proporciona token
    const authorization = req.headers['authorization'];
    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      
      // Actualizar estado de la sesión en la base de datos
      const { error: updateError } = await supabase
        .from('yappy_sessions')
        .update({ 
          state: 'CLOSED',
          closed_at: new Date().toISOString()
        })
        .eq('token', token)
        .eq('state', 'OPEN');

      if (updateError) {
        console.error('Error closing session:', updateError);
        return res.status(500).json({
          status: {
            code: 'YP-9999',
            description: 'Error, el servicio ha tardado en responder'
          }
        });
      }
    }

    return res.status(200).json({
      status: {
        code: 'YP-0000',
        description: 'Se ha realizado la ejecución del servicio correctamente'
      }
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      status: {
        code: 'YP-9999',
        description: 'Error, el servicio ha tardado en responder'
      }
    });
  }
}