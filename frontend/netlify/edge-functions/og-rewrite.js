// Netlify Edge Function: rewrite OG meta tags for porcelainandroid.com
// Twitter/Facebook bots don't execute JS, so we must rewrite HTML server-side.
// Static files (robots.txt, sitemap.xml, llms.txt) are handled via netlify.toml redirects.

export default async (request, context) => {
  const url = new URL(request.url);

  // Only rewrite for porcelainandroid.com
  if (url.hostname !== 'porcelainandroid.com') {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  // Only rewrite HTML responses
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // Replace Diamond Drones meta tags with Porcelain Android ones
  html = html
    .replace(
      /<title>.*?<\/title>/,
      '<title>PORCELAIN ANDROID\u2122 \u2014 Digital Art by Miss AL Simpson</title>'
    )
    .replace(
      /<meta name="description"[^>]*>/,
      '<meta name="description" content="PORCELAIN ANDROID\u2122 \u2014 The Manga Machine. An immersive cryptoart world by Miss AL Simpson." />'
    )
    .replace(
      /<meta property="og:title"[^>]*>/,
      '<meta property="og:title" content="PORCELAIN ANDROID\u2122 \u2014 Digital Art by Miss AL Simpson" />'
    )
    .replace(
      /<meta property="og:description"[^>]*>/,
      '<meta property="og:description" content="The Manga Machine. An immersive cryptoart world by Miss AL Simpson." />'
    )
    .replace(
      /<meta property="og:url"[^>]*>/,
      `<meta property="og:url" content="https://porcelainandroid.com${url.pathname}" />`
    )
    .replace(
      /<meta property="og:image" content="[^"]*"[^>]*>/,
      '<meta property="og:image" content="https://porcelainandroid.com/og-porcelain.png" />'
    )
    .replace(
      /<meta property="og:site_name"[^>]*>/,
      '<meta property="og:site_name" content="PORCELAIN ANDROID\u2122" />'
    )
    .replace(
      /<meta name="twitter:title"[^>]*>/,
      '<meta name="twitter:title" content="PORCELAIN ANDROID\u2122 \u2014 Digital Art by Miss AL Simpson" />'
    )
    .replace(
      /<meta name="twitter:description"[^>]*>/,
      '<meta name="twitter:description" content="The Manga Machine. An immersive cryptoart world by Miss AL Simpson." />'
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"[^>]*>/,
      '<meta name="twitter:image" content="https://porcelainandroid.com/og-porcelain.png" />'
    )
    .replace(
      /<meta name="twitter:site"[^>]*>/,
      '<meta name="twitter:site" content="@PorcelAndroid" />'
    )
    .replace(
      /<link rel="canonical"[^>]*>/,
      `<link rel="canonical" href="https://porcelainandroid.com${url.pathname}" />`
    )
    .replace(
      /"name": "DIAMOND DRONES™"/,
      '"name": "PORCELAIN ANDROID™"'
    )
    .replace(
      /"url": "https:\/\/diamonddrones\.world"/,
      '"url": "https://porcelainandroid.com"'
    )
    .replace(
      /"description": "A digital diamond house by Miss AL Simpson\. 1000 Diamond Drones, 120 Drone Blondes, and an 11-track album on Ethereum\."/,
      '"description": "The Manga Machine. An immersive cryptoart world by Miss AL Simpson."'
    );

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
};

export const config = {
  path: "/*",
};
