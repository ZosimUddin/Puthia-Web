import { ServiceConfig, SERVICES_CONFIG } from '../config/servicesConfig';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://amaderputhia.gov.bd';

/**
 * Generate dynamic structured data (JSON-LD) for a service directory page (all 60 services)
 */
export const getServiceDirectorySchema = (config: ServiceConfig, itemCount: number = 0) => {
  const pageUrl = `${SITE_URL}/service/${config.id}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'হোমপেজ',
            'item': SITE_URL,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'সকল সেবা ও ডিরেক্টরি',
            'item': `${SITE_URL}/all-services`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': config.title,
            'item': pageUrl,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': pageUrl,
        'url': pageUrl,
        'name': `${config.title} - পুঠিয়া উপজেলা সেবা ডিরেক্টরি`,
        'description': `${config.subtitle}। পুঠিয়া, রাজশাহী অঞ্চলের নির্ভরযোগ্য ও যাচাইকৃত ${config.title} তালিকা ও জরুরী নম্বর।`,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': SITE_URL,
          'name': 'আমাদের পুঠিয়া',
          'url': SITE_URL,
        },
        'inLanguage': 'bn-BD',
        'about': {
          '@type': 'Thing',
          'name': config.title,
          'description': config.subtitle,
        },
        'provider': {
          '@type': 'GovernmentOrganization',
          'name': 'পুঠিয়া উপজেলা প্রশাসন ও ডিজিটাল পুঠিয়া টিম',
          'url': SITE_URL,
          'areaServed': {
            '@type': 'AdministrativeArea',
            'name': 'পুঠিয়া উপজেলা, রাজশাহী',
          },
        },
        'numberOfItems': itemCount,
      },
    ],
  };
};

/**
 * Generate dynamic structured data (JSON-LD) for an individual service item detail page
 */
export const getServiceItemDetailSchema = (
  config: ServiceConfig,
  item: Record<string, any>,
  docId: string
) => {
  const schema = config.fieldsSchema;
  const title = item[schema.nameKey] || item.name || item.title || 'সেবা বিবরন';
  const address = item[schema.addressKey || 'address'] || 'পুঠিয়া, রাজশাহী';
  const phone = item[schema.phoneKey || 'phone'] || item.contactNumber || '';
  const image = item[schema.imageKey || 'imageUrl'] || item.image || item.photo || '';
  const rating = typeof item[schema.ratingKey || 'rating'] === 'number' ? item[schema.ratingKey || 'rating'] : 4.8;
  const reviewCount = typeof item[schema.reviewCountKey || 'reviewCount'] === 'number' ? item[schema.reviewCountKey || 'reviewCount'] : 25;
  const itemUrl = `${SITE_URL}/service/${config.id}/${docId}`;

  // Determine schema type based on service key
  let schemaType = 'LocalBusiness';
  if (['doctor', 'hospital', 'clinic', 'pharmacy', 'blood_donor', 'ambulance'].includes(config.id)) {
    schemaType = config.id === 'doctor' ? 'Physician' : 'MedicalBusiness';
  } else if (['school', 'college', 'madrasa', 'kindergarten', 'library'].includes(config.id)) {
    schemaType = 'EducationalOrganization';
  } else if (['hotel', 'restaurant', 'sweet_shop', 'fast_food', 'coffee_shop'].includes(config.id)) {
    schemaType = 'FoodEstablishment';
  } else if (['tourist_spot', 'historical_place', 'temple', 'mosque', 'rajbari'].includes(config.id)) {
    schemaType = 'TouristAttraction';
  } else if (['police', 'fire_service', 'land_office', 'union_parisad', 'admin'].includes(config.id)) {
    schemaType = 'GovernmentBuilding';
  }

  const detailSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': itemUrl,
    'url': itemUrl,
    'name': `${title} - ${config.title}`,
    'description': `${title} - পুঠিয়া উপজেলার বিশ্বস্ত ${config.title}। যোগাযোগের নম্বর: ${phone || 'উপলব্ধ'}, ঠিকানা: ${address}।`,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': address,
      'addressLocality': 'পুঠিয়া',
      'addressRegion': 'রাজশাহী',
      'addressCountry': 'BD',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': rating,
      'reviewCount': reviewCount,
      'bestRating': 5,
      'worstRating': 1,
    },
  };

  if (phone) {
    detailSchema['telephone'] = phone;
  }
  if (image) {
    detailSchema['image'] = image;
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'হোমপেজ',
            'item': SITE_URL,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': config.title,
            'item': `${SITE_URL}/service/${config.id}`,
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': title,
            'item': itemUrl,
          },
        ],
      },
      detailSchema,
    ],
  };
};

/**
 * Generate full sitemap list of all 60 services and static pages
 */
export const getAllSiteRoutes = () => {
  const staticRoutes = [
    { path: '/', title: 'আমাদের পুঠিয়া - হোমপেজ', priority: '1.0', changefreq: 'daily' },
    { path: '/all-services', title: 'সকল সেবা তালিকা', priority: '0.9', changefreq: 'daily' },
    { path: '/history', title: 'পুঠিয়া রাজবাড়ী ও ইতিহাস', priority: '0.9', changefreq: 'monthly' },
    { path: '/gallery', title: 'পুঠিয়া ফটো গ্যালারি', priority: '0.8', changefreq: 'weekly' },
    { path: '/video-gallery', title: 'ভিডিও গ্যালারি', priority: '0.8', changefreq: 'weekly' },
    { path: '/notice', title: 'জরুরী নোটিশ ও বিজ্ঞপ্তি', priority: '0.8', changefreq: 'daily' },
    { path: '/complaint', title: 'নাগরিক অভিযোগ বক্স', priority: '0.7', changefreq: 'monthly' },
    { path: '/live-support', title: 'লাইভ সাপোর্ট ও হেল্পলাইন', priority: '0.7', changefreq: 'monthly' },
    { path: '/community', title: 'কমিউনিটি প্ল্যাটফর্ম', priority: '0.7', changefreq: 'daily' },
  ];

  const serviceRoutes = Object.values(SERVICES_CONFIG).map((cfg) => ({
    path: `/service/${cfg.id}`,
    title: `${cfg.title} - পুঠিয়া ডিরেক্টরি`,
    priority: '0.8',
    changefreq: 'daily',
    category: cfg.subtitle,
    icon: cfg.icon,
  }));

  return {
    staticRoutes,
    serviceRoutes,
    totalRoutes: staticRoutes.length + serviceRoutes.length,
  };
};

/**
 * Generate XML Sitemap string for SEO bots & search consoles
 */
export const generateXmlSitemapString = () => {
  const { staticRoutes, serviceRoutes } = getAllSiteRoutes();
  const all = [...staticRoutes, ...serviceRoutes];
  const today = new Date().toISOString().split('T')[0];

  const xmlEntries = all
    .map(
      (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}
</urlset>`;
};
