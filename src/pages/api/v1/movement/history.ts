import type { NextApiRequest, NextApiResponse } from 'next';
import { validateYappyAuth } from '@/lib/yappy-auth';
import { supabase } from '@/lib/supabase';

interface MovementHistoryRequest {
  body: {
    pagination: {
      start_date: string;
      end_date: string;
      payment_date?: string;
      merchant_date?: string;
      has_next_page?: boolean;
      limit: number;
      token?: string;
    };
    filter?: Array<{
      id: string;
      value: string;
    }>;
  };
}

interface MovementHistoryResponse {
  body?: {
    pagination: {
      start_date: string;
      end_date: string;
      payment_date?: string;
      merchant_date?: string;
      has_next_page: boolean;
      limit: number;
      token?: string;
    };
    transactions: Array<any>;
  };
  status: {
    code: string;
    description: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<MovementHistoryResponse>) {
  if (req.method !== 'POST') {
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
    const { body }: MovementHistoryRequest = req.body;

    if (!body || !body.pagination) {
      return res.status(400).json({
        status: {
          code: 'YP-0010',
          description: 'Error, uno o mas campos del cuerpo de la peticion no cumplen con los valores enumerados'
        }
      });
    }

    const { pagination, filter } = body;

    // Validar límite
    if (pagination.limit > 100 || pagination.limit < 1) {
      return res.status(400).json({
        status: {
          code: 'YP-0040',
          description: 'Error, el límite de consulta está fuera del rango permitido'
        }
      });
    }

    // Construir query base
    let query = supabase
      .from('payments')
      .select('*')
      .gte('created_at', pagination.start_date)
      .lte('created_at', pagination.end_date)
      .order('created_at', { ascending: false })
      .limit(pagination.limit);

    // Aplicar filtros si existen
    if (filter && filter.length > 0) {
      filter.forEach(filterItem => {
        switch (filterItem.id) {
          case 'ROLE':
            // Filtrar por rol (CREDIT/DEBIT)
            break;
          case 'COLLECTION_ALIAS':
            const aliases = filterItem.value.split('|');
            if (aliases.length > 25) {
              return res.status(400).json({
                status: {
                  code: 'YP-0039',
                  description: 'Error, la cantidad de alias excede el máximo permitido'
                }
              });
            }
            // Aplicar filtro de alias
            break;
        }
      });
    }

    const { data: payments, error: dbError } = await query;

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        status: {
          code: 'YP-9999',
          description: 'Error, el servicio ha tardado en responder'
        }
      });
    }

    // Transformar datos al formato esperado por Yappy
    const transactions = (payments || []).map(payment => ({
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
    }));

    // Si no hay transacciones
    if (transactions.length === 0) {
      return res.status(200).json({
        status: {
          code: 'YP-0001',
          description: 'Se ha realizado la ejecución del servicio correctamente, pero no se encontraron datos relacionados con la búsqueda'
        }
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      body: {
        pagination: {
          ...pagination,
          has_next_page: transactions.length === pagination.limit,
          token: generateNextPageToken()
        },
        transactions
      },
      status: {
        code: 'YP-0000',
        description: 'Se ha realizado la ejecución del servicio correctamente'
      }
    });

  } catch (error: any) {
    console.error('Movement history error:', error);
    return res.status(500).json({
      status: {
        code: 'YP-9999',
        description: 'Error, el servicio ha tardado en responder'
      }
    });
  }
}

function generateNextPageToken(): string {
  return Buffer.from(JSON.stringify({
    timestamp: Date.now(),
    random: Math.random().toString(36)
  })).toString('base64');
}