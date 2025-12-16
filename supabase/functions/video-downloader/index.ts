import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, platform } = await req.json();
    
    // Use a public API for video downloading
    let downloadUrl = '';
    let thumbnail = '';
    let title = '';

    // For demo purposes - in production you'd use actual APIs
    // This is a simplified example
    if (platform === 'tiktok') {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.data) {
        downloadUrl = data.data.play;
        thumbnail = data.data.cover;
        title = data.data.title;
      }
    } else {
      // For other platforms, return a message
      return new Response(JSON.stringify({ 
        error: 'Platform ini dalam pengembangan',
        message: 'Saat ini hanya TikTok yang didukung penuh'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!downloadUrl) {
      throw new Error('Tidak dapat mengambil video');
    }

    return new Response(JSON.stringify({ 
      download_url: downloadUrl,
      thumbnail,
      title
    }), {
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
