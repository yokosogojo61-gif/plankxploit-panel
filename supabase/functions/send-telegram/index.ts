import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = "8362518805:AAFg8s-mUvTEkj5PGc1qyV3LeHWwUDQTv5I";
const TELEGRAM_CHAT_ID = "7607881795";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    
    let message = '';
    
    if (type === 'payment_confirmation') {
      message = `🔔 *KONFIRMASI PEMBAYARAN BARU*\n\n` +
        `📋 Transaction ID: \`${data.transaction_id}\`\n` +
        `👤 Nama: ${data.name}\n` +
        `📧 Email: ${data.email}\n` +
        `📦 Paket: *${data.package}*\n` +
        `💰 Nominal: Rp${data.amount?.toLocaleString('id-ID')}\n` +
        `💳 Metode: ${data.payment_method?.toUpperCase()}\n\n` +
        `⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();
    console.log('Telegram response:', result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
