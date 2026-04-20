import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verificar firma de MercadoPago
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    const dataId = req.query['data.id'];

    if (xSignature && process.env.MP_WEBHOOK_SECRET && process.env.MP_WEBHOOK_SECRET.length > 10) {
        const parts = xSignature.split(',');
        let ts, hash;
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key?.trim() === 'ts') ts = value?.trim();
            if (key?.trim() === 'v1') hash = value?.trim();
        });

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
        const computed = crypto
            .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
            .update(manifest)
            .digest('hex');

        if (computed !== hash) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    const { type, data } = req.body;

    // Manejar suscripción nueva o actualizada
    if (type === 'subscription_preapproval') {
        try {
            // Obtener detalles de la suscripción desde MP
            const mpRes = await fetch(
                `https://api.mercadopago.com/preapproval/${data.id}`,
                { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }}
            );
            const subscription = await mpRes.json();

            const isActive = subscription.status === 'authorized';

            // Guardar en Supabase usando service key
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
                        status: isActive ? 'active' : 'inactive',
                        monthly_fee: 9990,
                        next_billing_date: subscription.next_payment_date,
                        plan_type: 'independiente',
                        mp_subscription_id: subscription.id
                    })
                }
            );

        } catch (error) {
            console.error('Error procesando suscripción:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    // Manejar pago mensual autorizado
    if (type === 'subscription_authorized_payment') {
        try {
            const mpRes = await fetch(
                `https://api.mercadopago.com/authorized_payments/${data.id}`,
                { headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }}
            );
            const payment = await mpRes.json();

            // Actualizar fecha próximo cobro en Supabase
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

    // Siempre responder 200 para que MP no reintente
    return res.status(200).json({ received: true });
}
