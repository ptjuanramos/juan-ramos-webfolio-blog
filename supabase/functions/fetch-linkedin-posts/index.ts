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
    
    if (!code) {
      // Return OAuth URL for authentication
      const redirectUri = `${url.origin}/supabase/functions/v1/fetch-linkedin-posts`;
      const scope = 'profile openid email w_member_social r_liteprofile r_emailaddress';
      const state = 'linkedin_auth';
      
      const oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `scope=${encodeURIComponent(scope)}`;

      return new Response(JSON.stringify({ 
        authUrl: oauthUrl,
        message: 'Please authenticate with LinkedIn first' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Exchange code for access token
    const redirectUri = `${url.origin}/supabase/functions/v1/fetch-linkedin-posts`;
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    console.log('LinkedIn profile:', profile);

    // Try to get posts using the newer API
    const postsResponse = await fetch(
      'https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:' + profile.sub + ')&count=10',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    let posts = [];
    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      console.log('LinkedIn posts response:', postsData);
      
      posts = postsData.elements?.map((post: any) => {
        const specificContent = post.specificContent?.['com.linkedin.ugc.ShareContent'];
        const text = specificContent?.shareCommentary?.text || 'LinkedIn Post';
        const createdTime = new Date(post.created?.time || Date.now());
        
        return {
          id: post.id || Math.random().toString(),
          title: text.split('\n')[0].substring(0, 100) || 'LinkedIn Post',
          excerpt: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
          date: createdTime.toISOString().split('T')[0],
          platform: 'linkedin',
          url: `https://www.linkedin.com/feed/update/${post.id?.replace('urn:li:ugcPost:', '')}`,
          tags: ['LinkedIn', 'Professional'],
          readTime: '2 min read'
        };
      }) || [];
    } else {
      console.log('Posts fetch failed:', postsResponse.status, await postsResponse.text());
    }

    console.log(`Fetched ${posts.length} LinkedIn posts`);

    return new Response(JSON.stringify({ posts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in LinkedIn function:', error);
    return new Response(
      JSON.stringify({ error: error.message, posts: [] }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});