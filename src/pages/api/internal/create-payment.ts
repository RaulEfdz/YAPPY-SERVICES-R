import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { Payment } from '@/generated/prisma';
import { generateCompleteYappyQR } from '@/lib/yappy-qr';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const paymentData = req.body;

    // Guardar en Supabase
    const { data: paymentRecord, error: supabaseError } = await supabase
      .from('payments')
      .insert({
        id: uuidv4(),
        uuid: paymentData.uuid,
        amount: paymentData.amount,
        description: paymentData.description,
        status: paymentData.status,
        currency: paymentData.currency,
        created_at: paymentData.created_at,
        updated_at: new Date().toISOString(),
        payment_date: paymentData.payment_date,
        cut_off_date: paymentData.cut_off_date,
        // Datos adicionales para cumplir con el schema
        debitor_alias: '+50761234567',
        debitor_complete_name: 'Juan Pérez',
        debitor_alias_type: 'P',
        debitor_bank_name: 'Banco General',
        creditor_alias: 'merchant-yappy',
        creditor_complete_name: 'Merchant Yappy API',
        creditor_alias_type: 'E',
        creditor_bank_name: 'Banco General'
      })
      .select() // Add .select() to return the inserted record
      .single(); // Add .single() to ensure a single object is returned

    if (supabaseError) {
      console.error('Supabase Error:', supabaseError);
      return res.status(500).json({ 
        error: 'Error saving payment to database', 
        details: supabaseError.message 
      });
    }

    if (!paymentRecord) {
      console.error('Supabase Error: Payment record not returned after insert.');
      return res.status(500).json({ 
        error: 'Error saving payment to database', 
        details: 'Payment record not returned after insert.' 
      });
    }

    // Type assertion to ensure paymentRecord is treated as Payment
    const payment: Payment = paymentRecord;

    // Generate QR code with official Yappy payment URL following the documented process
    let qrCodeDataUrl: string;
    
    try {
      console.log('=== STARTING YAPPY QR GENERATION PROCESS ===');
      
      // Generar URL oficial de Yappy siguiendo el flujo completo documentado
      const officialPaymentURL = await generateCompleteYappyQR({
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description || '',
        reference: payment.uuid
      });
      
      let finalPaymentUrl: string;
      
      if (officialPaymentURL) {
        finalPaymentUrl = officialPaymentURL;
        console.log('✅ SUCCESS: Using official Yappy payment URL');
      } else {
        // Fallback a página local si falla la integración
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        finalPaymentUrl = `${baseUrl}/pay/${payment.uuid}?amount=${payment.amount}&currency=${payment.currency}&description=${encodeURIComponent(payment.description || '')}`;
        console.warn('⚠️  FALLBACK: Using local payment URL:', finalPaymentUrl);
      }

      // Generar QR code con la URL final
      qrCodeDataUrl = await QRCode.toDataURL(finalPaymentUrl);
      console.log('✅ QR Code generated successfully');
      
    } catch (qrError) {
      console.error('❌ Error generating Yappy QR:', qrError);
      // Fallback en caso de error
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const fallbackUrl = `${baseUrl}/pay/${payment.uuid}?amount=${payment.amount}&currency=${payment.currency}&description=${encodeURIComponent(payment.description || '')}`;
      qrCodeDataUrl = await QRCode.toDataURL(fallbackUrl);
      console.log('✅ Fallback QR Code generated');
    }

    // Update the payment record with the QR code data
    const { data: updatedPaymentRecord, error: updateError } = await supabase
      .from('payments')
      .update({ qr_code_data: qrCodeDataUrl })
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      return res.status(500).json({ 
        error: 'Error updating payment with QR code', 
        details: updateError.message 
      });
    }

    return res.status(200).json(updatedPaymentRecord);
  } catch (error: any) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
}
