import RulerTool from "@/components/RulerTool";

// JSON-LD structured data for FAQ rich snippets
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why is my online ruler inaccurate by default?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most browsers report a default resolution of 96 PPI (pixels per inch), which does not match most modern screens. Without proper calibration, rulers can be off by 10–30%. RealOnlineRuler solves this by letting you visually calibrate using a credit card, coin, or paper — objects with standardized sizes.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calibrate my screen ruler to show actual size?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Click the 'Calibrate' button and select a reference object you have on hand (e.g., a credit card is 85.6 mm wide). Place the real object on your screen and drag the slider until the on-screen shape matches perfectly. This calculates your true PPI and is saved for future visits.",
      },
    },
    {
      "@type": "Question",
      name: "Does this virtual ruler work on mobile phones?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! RealOnlineRuler is fully responsive and touch-optimized. It works on iPhones, Android phones, iPads, and tablets. The drag-to-measure cursors support touch gestures. For best results on mobile, calibrate using a coin that fits comfortably on your phone screen.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between metric (cm/mm) and imperial (inches) online rulers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Metric rulers use centimeters and millimeters (1 cm = 10 mm). Imperial rulers use inches and fractions (1 inch = 25.4 mm). RealOnlineRuler supports both systems simultaneously — toggle between cm, mm, and inches instantly. All three readings are always displayed.",
      },
    },
    {
      "@type": "Question",
      name: "Is my privacy protected when using this online ruler?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. RealOnlineRuler processes everything 100% in your browser. We do not access your camera, upload images, or track your measurements. Your calibration data is saved locally on your device using localStorage — it never leaves your computer.",
      },
    },
    {
      "@type": "Question",
      name: "Can I measure vertically and use this as a virtual measuring tape?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Click the orientation toggle to switch between horizontal and vertical rulers. You can also enable the 2D Grid mode to measure both width and height simultaneously, turning your screen into a precise graph-paper grid — like a virtual measuring tape.",
      },
    },
  ],
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Real Online Ruler";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${siteUrl}/#webapplication`,
  name: siteName,
  url: siteUrl,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  description:
    "Free online ruler in actual size. Measure objects in centimeters (cm), millimeters (mm), and inches with a calibrated virtual ruler. Works on any screen.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires JavaScript. Works in all modern browsers.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  description:
    "Free online ruler tool for accurate screen measurements in cm, mm, and inches.",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
  ],
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background gradient orbs */}
      <div className="bg-gradient-orb bg-gradient-orb-1" />
      <div className="bg-gradient-orb bg-gradient-orb-2" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <RulerTool />
    </div>
  );
}
