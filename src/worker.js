/**
 * Aoogle Cloudflare Worker Entry Point
 *
 * 1. Handles /api/websearch on Cloudflare edge (DuckDuckGo real-time AI tools discovery)
 * 2. Serves Vite static SPA assets (HTML, CSS, JS, SVG) for all other routes
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Live Web Search API Endpoint
    if (url.pathname === '/api/websearch') {
      const query = url.searchParams.get('q') || '';
      if (!query || query.trim().length < 2) {
        return new Response(JSON.stringify({ tools: [], sources: [] }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          },
        });
      }

      try {
        const searchUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query.trim() + ' ai tool');
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
        });

        const html = await response.text();
        const items = [];
        const regex = /<h2 class="result__title">[\s\S]*?<a rel="nofollow" class="result__a" href="([^"]+)">([\s\S]*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

        let match;
        while ((match = regex.exec(html)) !== null) {
          let rawUrl = match[1];
          let title = match[2]
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .trim();
          let snippet = match[3]
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&#x27;/g, "'")
            .replace(/&quot;/g, '"')
            .trim();

          let targetUrl = rawUrl;
          if (rawUrl.includes('ad_domain=')) {
            const domMatch = rawUrl.match(/ad_domain=([^&]+)/);
            if (domMatch) targetUrl = 'https://' + decodeURIComponent(domMatch[1]);
          } else {
            const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
            if (uddgMatch) {
              try {
                targetUrl = decodeURIComponent(uddgMatch[1]);
              } catch {}
            }
          }

          if (!targetUrl.startsWith('http')) continue;
          if (targetUrl.includes('duckduckgo.com')) continue;

          let cleanName = title.split(/\s*[-|–—:]\s*/)[0].trim();
          if (cleanName.length > 45) cleanName = cleanName.slice(0, 42) + '...';
          if (!cleanName) continue;

          items.push({
            title: cleanName,
            fullName: title,
            url: targetUrl,
            snippet,
            source: 'Live Web',
          });
        }

        return new Response(JSON.stringify({ tools: items, sources: ['Live Web Search'] }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message, tools: [], sources: [] }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Serve static SPA assets
    if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Aoogle Worker Active', { status: 200 });
  },
};
