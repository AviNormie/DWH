// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://www.delhiwalahalwai.com/', // replace with your domain
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin', '/api/*', '/test'], // optional: exclude sensitive or dev routes/
};
