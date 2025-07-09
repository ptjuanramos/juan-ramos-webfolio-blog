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
    const mediumRssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@ptjuanramos';
    
    const response = await fetch(mediumRssUrl);
    
    if (!response.ok) {
      throw new Error(`RSS2JSON API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('RSS2JSON API returned error status');
    }

    // Transform Medium posts to match our expected format
    const transformedPosts = data.items?.map((item: any) => {
      // Extract reading time from content or estimate
      const contentLength = item.content?.length || item.description?.length || 0;
      const estimatedReadTime = Math.max(1, Math.ceil(contentLength / 1000));
      
      // Clean up description/excerpt
      const description = item.description || '';
      const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 200);
      
      return {
        id: item.guid || Math.random().toString(),
        title: item.title || 'Medium Article',
        excerpt: cleanDescription + (cleanDescription.length === 200 ? '...' : ''),
        date: new Date(item.pubDate).toISOString().split('T')[0],
        platform: 'medium',
        url: item.link,
        tags: item.categories || ['Medium', 'Article'],
        readTime: `${estimatedReadTime} min read`
      };
    }) || [];

    console.log(`Fetched ${transformedPosts.length} Medium posts`);

    return new Response(JSON.stringify({ posts: transformedPosts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return new Response(
      JSON.stringify({ error: error.message, posts: [] }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});