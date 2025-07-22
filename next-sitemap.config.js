/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.delhiwalahalwai.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/admin/*',
    '/account',
    '/checkout',
    '/cart',
    '/my-orders',
  ],
};

module.exports = config;
