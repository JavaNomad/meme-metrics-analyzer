import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY')
const MAILCHIMP_LIST_ID = '9af4508fe2' // Updated with the provided Mailchimp audience ID
const MAILCHIMP_DC = MAILCHIMP_API_KEY?.split('-')[1] // Data center from API key

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    const response = await fetch(
      `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`anystring:${MAILCHIMP_API_KEY}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
        }),
      }
    )

    const data = await response.json()
    console.log('Mailchimp API response:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in add-to-mailchimp function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})