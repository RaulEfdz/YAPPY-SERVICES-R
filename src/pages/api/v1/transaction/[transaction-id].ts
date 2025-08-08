import type { NextApiRequest, NextApiResponse } from 'next';
import { validateYappyAuth } from '@/lib/yappy-auth';
import { supabase } from '@/lib/supabase';

interface TransactionResponse {
  status: {
    code: string;
    description: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TransactionResponse>) {
  if (req.method !== 'PUT') {
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

  // Validar token de sesión
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
    const { 'transaction-id': transactionId } = req.query;

    if (!transactionId || typeof transactionId !== 'string') {
      return res.status(400).json({
        status: {
          code: 'YP-0010',
          description: 'Error, uno o mas campos del cuerpo de la peticion no cumplen con los valores enumerados'
        }
      });
    }

    // Buscar la transacción
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .select('*')
      .eq('uuid', transactionId)
      .single();

    if (dbError || !payment) {
      console.error('Database error or payment not found:', dbError);
      return res.status(400).json({
        status: {
          code: 'YP-0013',
          description: 'Error, ha ocurrido un error en la ejecucion de la reversa.'
        }
      });
    }

    // Validar estado de la transacción
    if (payment.status === 'FAILED') {
      return res.status(400).json({
        status: {
          code: 'YP-0015',
          description: 'La transaccion que se intenta reversar posee un estado fallido. No se requieren acciones adicionales.'
        }
      });
    }

    if (payment.status === 'REVERSED') {
      return res.status(400).json({
        status: {
          code: 'YP-0016',
          description: 'La transaccion que se intenta reversar posee un estado reversado. No se requieren acciones adicionales.'
        }
      });
    }

    // Verificar si la transacción ya fue liquidada
    const currentDate = new Date();
    const cutOffDate = new Date(payment.cut_off_date);
    
    if (currentDate > cutOffDate) {
      return res.status(400).json({
        status: {
          code: 'YP-0014',
          description: 'Error, la reversa no puede ser procesada porque ya se liquido.'
        }
      });
    }

    // Procesar la reversa
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'REVERSED',
        updated_at: new Date().toISOString()
      })
      .eq('uuid', transactionId);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return res.status(500).json({
        status: {
          code: 'YP-0013',
          description: 'Error, ha ocurrido un error en la ejecucion de la reversa.'
        }
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      status: {
        code: 'YP-0000',
        description: 'Se ha realizado la ejecución del servicio correctamente'
      }
    });

  } catch (error: any) {
    console.error('Transaction reversal error:', error);
    return res.status(500).json({
      status: {
        code: 'YP-0013',
        description: 'Error, ha ocurrido un error en la ejecucion de la reversa.'
      }
    });
  }
}