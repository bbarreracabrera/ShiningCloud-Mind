import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verificar firma HMAC si MP_WEBHOOK_SECRET está configurada
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret && secret.length > 10) {
        const xSignature = req.headers['x-signature'];
        const xRequestId = req.headers['x-request-id'];
        const dataId = req.query?.['data.id'] || req.body?.data?.id;

        if (!xSignature) {
            console.warn('Webhook sin x-signature, rechazando');
            return res.status(401).json({ error: 'Missing signature' });
        }

        const parts = xSignature.split(',');
        let ts, hash;
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key?.trim() === 'ts') ts = value?.trim();
            if (key?.trim() === 'v1') hash = value?.trim();
        });

        if (!ts || !hash) {
            return res.status(401).json({ error: 'Invalid signature format' });
        }

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

        const computedHash = crypto
            .createHmac('sha256', secret)
            .update(manifest)
            .digest('hex');

        if (computedHash !== hash) {
            console.warn('Firma HMAC inválida', {
                received: hash.substring(0, 10),
                expected: computedHash.substring(0, 10)
            });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('Firma HMAC válida ✓');
    } else {
        console.warn('MP_WEBHOOK_SECRET no configurado, validación HMAC saltada');
    }

    const { type, data } = req.body;

    // Validación básica del payload
    if (!data?.id || !type) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    console.log('Webhook recibido:', { type, dataId: data.id });

    if (type === 'subscription_preapproval') {
        try {
            const mpRes = await fetch(
                `https://api.mercadopago.com/preapproval/${data.id}`,
                { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }}
            );
            const subscription = await mpRes.json();

            console.log('Suscripción MP:', subscription);

            await fetch(
                `${process.env.SUPABASE_URL}/rest/v1/saas_subscriptions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': process.env.SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify({
                        clinic_email: subscription.payer_email,
                        clinic_name: subscription.payer_email,
                        status: subscription.status === 'authorized'
                            ? 'active' : 'inactive',
                        monthly_fee: 9990,
                        next_billing_date: subscription.next_payment_date,
                        plan_type: 'independiente',
                        mp_subscription_id: subscription.id
                    })
                }
            );

            console.log('Suscripción guardada en Supabase OK');

        } catch (error) {
            console.error('Error procesando suscripción:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    if (type === 'subscription_authorized_payment') {
        try {
            const mpRes = await fetch(
                `https://api.mercadopago.com/authorized_payments/${data.id}`,
                { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }}
            );
            const payment = await mpRes.json();

            await fetch(
                `${process.env.SUPABASE_URL}/rest/v1/saas_subscriptions?mp_subscription_id=eq.${payment.preapproval_id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': process.env.SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
                    },
                    body: JSON.stringify({
                        status: 'active',
                        next_billing_date: payment.next_payment_date
                    })
                }
            );

        } catch (error) {
            console.error('Error procesando pago:', error);
        }
    }

    if (type === 'payment') {
        try {
            const mpRes = await fetch(
                `https://api.mercadopago.com/v1/payments/${data.id}`,
                { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }}
            );
            const payment = await mpRes.json();

            if (payment.status !== 'approved') {
                return res.status(200).json({ received: true });
            }

            const apptId = payment.external_reference;
            if (!apptId || !apptId.startsWith('appt_')) {
                return res.status(200).json({ received: true });
            }

            await fetch(
                `${process.env.SUPABASE_URL}/rest/v1/appointments?id=eq.${apptId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': process.env.SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
                    },
                    body: JSON.stringify({
                        status: 'agendado',
                        payment_id: String(payment.id),
                        payment_amount: payment.transaction_amount
                    })
                }
            );

            console.log('Cita confirmada por pago:', apptId);
        } catch (error) {
            console.error('Error procesando pago de cita:', error);
        }
    }

    return res.status(200).json({ received: true });
}
