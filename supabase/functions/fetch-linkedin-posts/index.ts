import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    
    console.log('LinkedIn Client ID exists:', !!clientId);
    console.log('LinkedIn Client ID length:', clientId?.length || 0);
    console.log('LinkedIn Client Secret exists:', !!clientSecret);
    console.log('LinkedIn Client Secret length:', clientSecret?.length || 0);
    
    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials not configured');
    }

    // Step 1: Get access token using client credentials flow
    console.log('Getting LinkedIn access token...');
    
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', tokenResponse.status, errorText);
      throw new Error(`LinkedIn token request failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);
    
    if (!tokenData.access_token) {
      throw new Error('No access token received from LinkedIn');
    }

    const accessToken = tokenData.access_token;

    // Step 2: Try to get organization info (since client credentials flow is for organizations)
    console.log('Fetching organization info...');
    
    const orgResponse = await fetch('https://api.linkedin.com/v2/organizations?q=administeredBy&projection=(elements*(id,name,localizedName))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!orgResponse.ok) {
      const errorText = await orgResponse.text();
      console.error('Organization request failed:', orgResponse.status, errorText);
      
      // Try alternative approach - get posts from a specific profile ID
      // Note: Client credentials flow has limited access, mainly for organization data
      return new Response(JSON.stringify({ 
        posts: [],
        message: 'LinkedIn Client Credentials flow has limited access. Consider using personal access token or OAuth flow for user posts.',
        error: `Organization API failed: ${orgResponse.status}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orgData = await orgResponse.json();
    console.log('Organization data:', orgData);

    // For now, return empty posts with status info
    // Client credentials flow is primarily for organization content, not personal posts
    return new Response(JSON.stringify({ 
      posts: [],
      message: 'Connected to LinkedIn API successfully. Client credentials flow is limited to organization content.',
      organizations: orgData.elements || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in LinkedIn function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        posts: [],
        message: 'LinkedIn API access failed. Client credentials flow may not support personal posts.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});