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
    const linkedinToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');
    
    if (!linkedinToken) {
      throw new Error('LinkedIn access token not configured');
    }

    // Fetch user profile first to get the person ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${linkedinToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    const personId = profileData.id;

    // Fetch posts (shares) by the user
    const postsResponse = await fetch(
      `https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:${personId}&count=10&sortBy=CREATED_TIME`,
      {
        headers: {
          'Authorization': `Bearer ${linkedinToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!postsResponse.ok) {
      throw new Error(`LinkedIn posts API error: ${postsResponse.status}`);
    }

    const postsData = await postsResponse.json();
    
    // Transform LinkedIn posts to match our expected format
    const transformedPosts = postsData.elements?.map((post: any) => {
      const text = post.text?.text || '';
      const createdTime = new Date(post.created?.time || Date.now());
      
      return {
        id: post.id || Math.random().toString(),
        title: text.split('\n')[0].substring(0, 100) || 'LinkedIn Post',
        excerpt: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        date: createdTime.toISOString().split('T')[0],
        platform: 'linkedin',
        url: `https://www.linkedin.com/feed/update/${post.id}`,
        tags: ['LinkedIn', 'Professional'],
        readTime: '2 min read'
      };
    }) || [];

    console.log(`Fetched ${transformedPosts.length} LinkedIn posts`);

    return new Response(JSON.stringify({ posts: transformedPosts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return new Response(
      JSON.stringify({ error: error.message, posts: [] }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});