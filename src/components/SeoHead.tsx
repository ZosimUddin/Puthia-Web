import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export const SeoHead = ({ title, description, url, image }: SeoHeadProps) => {
  const siteName = 'পুঠিয়া ডায়েরি';
  const fullTitle = `${title} | ${siteName}`;
  const canonicalUrl = url || 'https://ais-dev-slqtn6q7j5aq7ktex6nw4z-97912170438.asia-east1.run.app/';
  const imageUrl = image || 'https://images.unsplash.com/photo-1590050752117-23a9d7fc240e?auto=format&fit=crop&q=80&w=1200&h=630';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content="website" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
