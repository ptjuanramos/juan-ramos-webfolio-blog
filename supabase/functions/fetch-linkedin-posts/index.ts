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
    
    if (!clientId || !clientSecret) {
      throw new Error('LinkedIn credentials not configured');
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const action = url.searchParams.get('action');

    // If no code provided, return authorization URL
    if (!code) {
      const redirectUri = `${url.origin}/functions/v1/fetch-linkedin-posts`;
      const scope = 'r_liteprofile%20r_member_social';
      const state = crypto.randomUUID();
      
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
      
      console.log('Generated auth URL:', authUrl);
      
      return new Response(JSON.stringify({ 
        authUrl,
        message: 'LinkedIn authorization required. Please visit the auth URL to authorize.',
        posts: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange authorization code for access token
    console.log('Exchanging authorization code for access token...');
    const redirectUri = `${url.origin}/functions/v1/fetch-linkedin-posts`;
    
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      throw new Error(`LinkedIn token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');
    
    if (!tokenData.access_token) {
      throw new Error('No access token received from LinkedIn');
    }

    const accessToken = tokenData.access_token;

    // Get user profile first
    console.log('Fetching user profile...');
    const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile request failed:', profileResponse.status, errorText);
      throw new Error(`LinkedIn profile request failed: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    console.log('Profile data received');

    // Get user posts using their URN
    console.log('Fetching user posts...');
    const userUrn = `urn:li:person:${profileData.id}`;
    const postsResponse = await fetch(`https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(userUrn)}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text();
      console.error('Posts request failed:', postsResponse.status, errorText);
      throw new Error(`LinkedIn posts request failed: ${postsResponse.status}`);
    }

    const postsData = await postsResponse.json();
    console.log('Posts data received, count:', postsData.elements?.length || 0);

    // Transform LinkedIn posts to our format
    const posts = (postsData.elements || []).map((post: any) => ({
      id: post.id,
      title: post.text?.text?.substring(0, 100) + '...' || 'LinkedIn Post',
      excerpt: post.text?.text || 'No content available',
      date: new Date(post.created?.time || Date.now()).toISOString().split('T')[0],
      platform: 'linkedin' as const,
      url: `https://www.linkedin.com/feed/update/${post.id}`,
      tags: ['LinkedIn'],
      readTime: '2 min read'
    }));

    return new Response(JSON.stringify({ 
      posts,
      message: `Successfully fetched ${posts.length} LinkedIn posts`,
      profile: profileData
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