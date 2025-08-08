import type { NextApiRequest, NextApiResponse } from 'next';
import { validateYappyAuth } from '@/lib/yappy-auth';
import { supabase } from '@/lib/supabase';

interface MovementDetailResponse {
  body?: {
    id: string;
    number: string;
    registration_date: string;
    payment_date: string;
    cut_off_date: string;
    type: string;
    role: string;
    category: string;
    charge: {
      amount: number;
      partial_amount: number;
      tip: number;
      tax: number;
      currency: string;
    };
    fee: {
      amount: number;
      currency: string;
    };
    description: string;
    bill_description: string;
    status: string;
    metadata: Array<any>;
    debitor: {
      alias: string;
      complete_name: string;
      alias_type: string;
      bank_name: string;
    };
    creditor: {
      alias: string;
      complete_name: string;
      alias_type: string;
      bank_name: string;
    };
  };
  status: {
    code: string;
    description: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<MovementDetailResponse>) {
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

    // Buscar la transacción por UUID
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .select('*')
      .eq('uuid', transactionId)
      .single();

    if (dbError || !payment) {
      console.error('Database error or payment not found:', dbError);
      return res.status(200).json({
        status: {
          code: 'YP-0001',
          description: 'Se ha realizado la ejecución del servicio correctamente, pero no se encontraron datos relacionados con la búsqueda'
        }
      });
    }

    // Transformar datos al formato esperado por Yappy
    const transactionDetail = {
      id: payment.uuid,
      number: payment.number,
      registration_date: payment.created_at,
      payment_date: payment.payment_date,
      cut_off_date: payment.cut_off_date,
      type: 'TXN-CHECKOUT',
      role: 'CREDIT',
      category: 'INTERBANK',
      charge: {
        amount: payment.amount,
        partial_amount: payment.partial_amount || payment.amount,
        tip: payment.tip || 0,
        tax: payment.tax || 0,
        currency: payment.currency || 'USD'
      },
      fee: {
        amount: payment.fee_amount || 0,
        currency: payment.fee_currency || 'USD'
      },
      description: payment.description,
      bill_description: payment.bill_description,
      status: payment.status,
      metadata: payment.metadata || [],
      debitor: {
        alias: payment.debitor_alias,
        complete_name: payment.debitor_complete_name,
        alias_type: payment.debitor_alias_type,
        bank_name: payment.debitor_bank_name
      },
      creditor: {
        alias: payment.creditor_alias,
        complete_name: payment.creditor_complete_name,
        alias_type: payment.creditor_alias_type,
        bank_name: payment.creditor_bank_name
      }
    };

    return res.status(200).json({
      body: transactionDetail,
      status: {
        code: 'YP-0000',
        description: 'Se ha realizado la ejecución del servicio correctamente'
      }
    });

  } catch (error: any) {
    console.error('Movement detail error:', error);
    return res.status(500).json({
      status: {
        code: 'YP-9999',
        description: 'Error, el servicio ha tardado en responder'
      }
    });
  }
}