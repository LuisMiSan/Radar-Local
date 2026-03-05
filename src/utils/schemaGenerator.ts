export const generateLocalBusinessSchema = (lead: any) => {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": lead.business,
    "description": lead.report?.lead_magnet_hook?.subheadline || `Professional services provided by ${lead.business}`,
    "url": "https://www.example.com", 
    "telephone": "+1-555-000-0000", 
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Business Rd",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "00000",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.0000",
      "longitude": "0.0000"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "$$"
  }, null, 2);
};
