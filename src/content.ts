// Single source of truth for every word and fact on the page.
// Sourced verbatim from rubicsrealty.com, /beaumonte.html and /media.html (fetched 21 Nov 2026).
// Do not add anything that is not on those pages.

export const brand = {
  name: 'Rubics Realty',
  tagline: "where design meets your heart's desire",
  logo: '/logo.png',
  intro: [
    'Rubics Realty is a design-first real estate brand reimagining what it means to live well. Each of our residences is shaped by proportion, clarity, and architectural precision.',
    'We build not just homes, but living experiences that respond to your pace, your space, and your principles.',
    'Explore a world where landmark architecture, global design influences, and eco-conscious development come together to define the next generation of luxury homes.',
  ],
};

export const stats = [
  { value: '20+', unit: 'MILLION', label: 'SQ. FT. IN DEVELOPMENT' },
  { value: '400+', unit: '', label: 'WORKFORCE' },
  { value: '10,000+', unit: '', label: 'FAMILIES UPLIFTED' },
];

export const vision = {
  title: 'WHERE VISION MEETS FORM',
  body: [
    'Each Rubics development begins with a fundamental belief: architecture should reflect an attention to the minutest detail, an eye for scale, and a conviction that great design is always ahead of its time.',
    'Marching with this tenet, every site we touch becomes a platform for new possibilities, driven by bold design, global influence, and radical clarity in form.',
  ],
};

export const beaumonte = {
  name: 'BeauMonté',
  tower: 'Tower C',
  eyebrow: 'Rubics Realty · Sion Circle, Mumbai · Tower C',
  tagline: 'Where life rises above all.',
  philosophyTitle: ['A home you don’t walk into.', 'One you arrive at.'],
  philosophy:
    'BeauMonté Tower C rises forty-one floors above Sion Circle — one of Mumbai’s oldest, most connected neighbourhoods. Seven residences to a floor. Balconies that look past a skyline you already know, toward one you’ve only driven toward.',
  quote: '"This is not an address you find. This is an address you arrive at."',
  fromMakersOf: 'From Makers of Three Sixty West',
  tower41: { value: '41', label: 'Storeys Elevation', sub: 'Above Sion Circle' },
  theTower: [
    '41 storeys — among the tallest in Sion',
    '7 residences per floor. Privacy treated as principle, not perk',
    'Large 2 BHK, 3 BHK & Jodi options',
    'Architecture by P&T Consultants Pte. Ltd. & Sanjay Puri Architects',
  ],
  theExperience: [
    'Largest land parcel in the vicinity — 2.7 acres of recreational space',
    '5 levels of podium parking',
    '5 high speed elevators',
    'Level 6 E-Deck — elevated amenity experience',
  ],
  theLifestyle: [
    'Tower-exclusive — guest room, fitness centre',
    '50-metre lap pool',
    '1 km jogging track',
    '50+ reasons to stay in',
  ],
  specs: [
    { label: 'Habitable Floors', value: '41' },
    { label: 'E-Deck', value: 'Level 6' },
    { label: 'Podium Parking Levels', value: '5' },
    { label: 'Basements', value: '1 + Ground Level' },
    { label: 'Residences per Floor', value: '7' },
    { label: 'Elevators', value: '5' },
    { label: 'Recreational Land Parcel', value: '2.7 Acres' },
    { label: 'Configurations', value: '2 & 3 BHKs along with Jodi options' },
  ],
  residences: {
    title: ['Seven to a floor.', 'No exceptions.'],
    points: ['Large 2 & 3 BHK residences.', '4 BHK jodi residences.', '7 exclusive residences per floor.'],
  },
  location: {
    title: ['Sion Circle.', 'Where the City Finds Its Heart.'],
    lead: 'Some neighbourhoods sit on a map. Others hold the map together.',
    quote: '"This is where the city comes together."',
    tags: ['Heart of Mumbai', 'Highway Access', 'Metro Connected', 'Near Airport', 'Sea Link Views'],
    keyConnections: [
      { place: 'Eastern Express Highway', time: '3 mins' },
      { place: 'BKC', time: '16 mins' },
      { place: 'Atal Setu', time: '15 mins' },
      { place: 'CSIA International Airport', time: '20 mins' },
      { place: 'Sion Railway Station', time: '5 mins' },
      { place: 'Wadala Monorail Station', time: '5 mins' },
    ],
    note: 'Travel times are subject to traffic conditions.',
  },
  views: {
    eyebrow: 'Seclusion. Community. Well-Being.',
    title: 'Privacy is the new view.',
    lead: 'A window at BeauMonté isn’t a frame. It’s an argument — that you live above the traffic, not beside it.',
    west: 'The Arabian Sea, working through its palette — the gold of six, the silver of noon, the violet of dusk. The Bandra–Worli Sea Link, tracing its long, quiet arc toward the other half of Mumbai.',
    north:
      'The city, unfolded. The monorail threading between buildings like a slow line of handwriting. Roads, rooftops, towers — all of it, at a distance that finally lets you notice it.',
    above:
      'At forty-one floors, weather arrives at your window before it arrives at the street. On the best days, clouds don’t pass by. They pass through.',
    closing: ['Above the city.', 'The skies await.'],
  },
  amenities: {
    eyebrow: 'A Life, Well Composed',
    title: 'Fifty+ reasons to stay in.',
    total: { value: '50+', label: 'Total Amenities' },
    aquatique: ['50 Metre Lap Pool', 'Kids Pool Area', 'Pool Deck Area', 'Cabana Seating'],
    groups: ['The Club', 'The Aquatique', 'The Junior Club', 'The Service Court', 'The Grove', 'The Healing House', 'The Sanctuary'],
  },
  partners: [
    { role: 'Architectural Partner', name: 'P&T Consultants Pte. Ltd. & Sanjay Puri Architects' },
    { role: 'Contracting Partner', name: 'Argentec Ltd' },
    { role: 'Landscape Partner', name: 'Site Concept' },
  ],
  contact: {
    phone: '1800 209 6363',
    email: 'sales@rubics.co',
    salesOffice: 'Sales Office: Sion East, Mumbai 400022',
  },
  rera: {
    label: 'MahaRERA Registration',
    number: 'Tower C: P51900050715',
    id: 'P51900050715',
    url: 'https://maharera.maharashtra.gov.in/',
  },
  url: 'https://rubicsrealty.com/beaumonte.html',
};

// Facts the 3D model is built around. Level 0 = ground, 1–5 = podium parking,
// 6 = E-Deck, 7–47 = the 41 habitable floors.
export const towerFacts = {
  podiumParkingLevels: 5,
  eDeckLevel: 6,
  habitableFloors: 41,
  firstHabitableLevel: 7,
  topLevel: 47,
};

export function floorInfo(level: number) {
  if (level === towerFacts.eDeckLevel) {
    return {
      title: 'Level 6 amenity deck',
      lines: ['Level 6 E-Deck — elevated amenity experience', '50-metre lap pool'],
      view: null as string | null,
    };
  }
  const habitable = level - towerFacts.firstHabitableLevel + 1;
  return {
    title: `Level ${level}`,
    lines: [
      `Habitable floor ${habitable} of ${towerFacts.habitableFloors}`,
      '7 exclusive residences per floor.',
      'Large 2 & 3 BHK residences.',
      '4 BHK jodi residences.',
    ],
    view: habitable >= 35 ? beaumonte.views.above : beaumonte.views.west,
  };
}

export const projects = [
  {
    id: 'beaumonte',
    name: 'BEAUMONTÉ',
    location: 'SION',
    body: [
      'Towering above the city’s central pulse, BeauMonté redefines vertical living with panoramic views, expansive residences, and the quiet exclusivity of gated elevation.',
      'A rare blend of serenity and stature, BeauMonté is designed for those who live with perspective.',
    ],
    cta: { label: 'Know More', href: 'https://rubicsrealty.com/beaumonte.html' },
    status: null as string | null,
  },
  {
    id: 'lalbaug',
    name: 'LALBAUG',
    location: 'MUMBAI',
    body: [
      'Rising soon in one of Mumbai’s most iconic and auspicious neighbourhoods.',
      'With curated views, sculpted spaces, and understated elegance, it’s designed for those who think beyond square feet.',
      'A future landmark, built to compel.',
    ],
    cta: { label: 'Enquire Now', href: '#enquiry' },
    status: 'Rising soon',
  },
];

export const legacy = {
  title: 'LED BY LEGACY',
  subtitle: 'from the makers of three sixty west...',
  body: [
    'Rubics brings together designers, planners, engineers, and visionaries united by a singular idea: timelessness is built, not imagined.',
    'Our team operates at the intersection of ambition and precision.',
    "That's how we build. That's who we are.",
  ],
  team: [
    {
      name: 'Suhan Shetty',
      role: 'Founder & Managing Director, Rubics Realty',
      photo: '/team/suhan.jpg',
      bio: [
        'Suhan Shetty is a design-driven real estate leader shaping a new language of living in India. With over two decades in large-scale urban development, his work spans premium high-rise residences, hospitality, aviation, and media.',
        'He has helmed marquee projects including Three Sixty West and Sion Beaumonte in Mumbai, and is currently driving The Ritz Carlton’s development in the city. Under his leadership, Rubics oversees more than 20 million square feet of built and ongoing real estate.',
        'Educated at Leysin American School in Switzerland, his perspective was shaped by European cities where proportion, rhythm, and context define urban design. He brings this sensibility to Indian real estate, blending global design intelligence with purpose-led development.',
        'Beyond luxury residences, Mr. Shetty has advanced projects under Maharashtra’s Slum Rehabilitation Act (SRA), championing design-conscious housing that prioritises dignity and livability. His vision balances global sophistication with local responsibility, positioning Rubics as a benchmark for clarity, precision, and intent in real estate.',
      ],
    },
    {
      name: 'Ravneet Gill',
      role: 'Chief Executive Officer, Rubics Realty',
      photo: '/team/ravneet.webp',
      bio: [
        'With over two decades of leadership across India’s real estate landscape, Mr. Ravneet Gill has been instrumental in shaping landmark developments that balance vision, design, and performance.',
        'He began his career at Citigroup, followed by senior leadership roles at EMAAR, Indiabulls Real Estate and TDI Group where he led large-scale development, business expansion, and strategic transformation.',
        'As Chief Executive Officer at Rubics Realty, he draws upon years of experience in managing P&L, growth strategy, and development execution across diverse asset classes.',
        'Mr. Gill holds an MMS degree from K.J. Somaiya Institute of Management and a B.Com degree from H.R. College. He is also a member of RICS and a member of the Executive Committee of CREDAI.',
      ],
    },
    {
      name: 'Sahana Shetty',
      role: 'Director of Interiors & Spatial Strategy, Rubics Realty',
      photo: '/team/sahana.webp',
      bio: [
        'Design is an emotional dialogue between a space and its inhabitants, and as the Director of Interiors & Spatial Strategy at Rubics Realty, Sahana Shetty orchestrates this dialogue with a rare blend of European refinement and Asian dynamism.',
        'Sahana’s design vocabulary is shaped by a decade of global immersion. Her formative years in Switzerland (Leysin) instilled a deep appreciation for structure and nature, while her collegiate years in Singapore (NAFA, LASALLE) and London (London Metropolitan University) refined her technical mastery in interior and exhibition design.',
        'At Rubics, Sahana creates spaces that are not merely viewed but deeply felt, transforming houses into homes that radiate joy.',
      ],
    },
  ],
};

export const about = {
  title: 'ABOUT RUBICS REALTY',
  body: [
    'Rubics Realty was built with one belief - homes should reflect the life within them. Not trends or tinton facades, but clarity, rhythm, and quiet intent.',
    'Founded by Suhan Shetty, Rubics draws on decades of development experience and a design-first sensibility shaped by global cities.',
    'From blueprint to build, every decision here is guided by a purpose to make living feel more considered.',
  ],
  tabs: [
    {
      id: 'life',
      label: 'Life at Rubics',
      title: 'LIFE AT RUBICS',
      paragraphs: [
        'Life at Rubics is designed to elevate your lifestyle from the moment you step in.',
        'Through spaces shaped for family, friends and community, every part of your day feels renewed.',
        'There is ease in how you move, warmth in how you live, and comfort in how you unwind.',
        'This is living shaped to uplift you.',
        'A lifestyle made richer in every way.',
      ],
    },
    {
      id: 'philosophy',
      label: 'Design Philosophy',
      title: 'DESIGN PHILOSOPHY',
      paragraphs: [
        "At Rubics, architecture is not the result. It's the origin. Every project begins with an idea that's thoughtful and forward-thinking.",
        'Our spaces breathe. Transitions are intentional. Materials respond to light, air, and time. What you see is elegance. What you feel is precision.',
        'This is how every elite residence tower becomes a bespoke expression of the Rubics Lifestyle.',
      ],
    },
    {
      id: 'vision',
      label: 'Our Vision',
      title: 'OUR VISION',
      paragraphs: [
        'To foster a new era of development where architecture is thoughtful, context is respected, and living is redefined.',
        'We build luxury homes that are intelligent, flexible, and clear in identity, spaces that enrich their cities and shape the future of residential real estate.',
      ],
    },
    {
      id: 'message',
      label: "Founder's Message",
      title: 'MESSAGE',
      quote: ["WE DON'T FOLLOW GLOBAL BENCHMARKS.", 'WE CREATE THE NEXT ONES.'],
      attribution: 'Suhan Shetty, Founder & Managing Director, Rubics Realty',
      photo: '/team/suhan.jpg',
      paragraphs: [] as string[],
    },
    {
      id: 'mission',
      label: 'Our Mission',
      title: 'OUR MISSION',
      paragraphs: [
        'Rubics is defined by the discipline of elevated living.',
        'Thoughtful design leads every decision.',
        'Every home reflects the taste, pace, and purpose of an informed generation.',
        'Ecological responsibility is a mindset, not a checkbox.',
        'We build with intent and deliver with integrity.',
        'Every line drawn, every material chosen, every square foot planned, it all serves a purpose.',
      ],
    },
    {
      id: 'sustainability',
      label: 'Sustainability & Lifestyle',
      title: 'SUSTAINABILITY',
      paragraphs: [] as string[],
      items: [
        {
          title: 'Every design begins with context.',
          body: 'While most developments today begin with land & lofty promises, we build with an understanding of the place – it’s climate, culture, and character. Because what stands here, truly belongs here.',
        },
        {
          title: 'Efficiency begins with the blueprint.',
          body: 'Some retrofit solutions. We build them in. Every plan is drawn with foresight so that airflow, light, and energy move as seamlessly as the people who live within.',
        },
        {
          title: 'Nothing is "Standard".',
          body: 'Templates are for those who build by habit. We build by thought. From hinges to headspace, every detail is a decision.',
        },
        { title: 'What we avoid matters too.', body: 'Low-waste planning often begins with knowing what not to build.' },
        {
          title: 'We think in life cycles.',
          body: 'Timelines don’t guide us. Lifespans do. Every choice we make is measured in longevity, usefulness, and the purpose it serves.',
        },
        {
          title: 'Responsibility lies in the invisible.',
          body: 'It’s not the marble you walk on. It’s the membrane underneath. What isn’t seen still shapes how a building breathes, lasts, and lives.',
        },
      ],
      lifestyleTitle: 'LIFESTYLE',
      lifestyle: [
        {
          title: 'Community, Reimagined',
          body: 'Life at Rubics brings people together in ways that genuinely uplift how you live. It’s a private community that adds comfort, connection and a sense of belonging to your everyday life.',
        },
        {
          title: 'Wellness, Rejuvenated',
          body: 'Wellness at Rubics creates a space that cares for your holistic wellbeing and enhances your lifestyle through calm, restorative environments. Light, proportion, and materials work quietly to bring balance to your routine.',
        },
        {
          title: 'Living, Redefined',
          body: 'Living at Rubics is effortless, routines feel smoother, and moments gain more meaning. It’s a new way of living shaped around you.',
        },
      ],
    },
  ],
};

const MEDIA_BASE = 'https://rubicsrealty.com/media-detail.html?post=';

export const media = {
  title: 'MEDIA',
  subtitle: 'Discover Our Media Articles',
  allUrl: 'https://rubicsrealty.com/media.html',
  items: [
    {
      date: 'November 17, 2026',
      source: 'Moneycontrol',
      title: 'Rubics Realty Launches BeauMonté Tower C, Setting a New Benchmark for Premium Living in Sion',
      description:
        "Rubics Realty, a progressive Mumbai-based developer credited with transforming the city's luxury housing landscape, has launched BeauMonté Tower C",
      url: MEDIA_BASE + 'rubics-realty-launches-beaumonte-tower-c-setting-a-new-benchmark-for-premium-living-in-sion-moneycontrol',
    },
    {
      date: 'October 01, 2026',
      source: 'District News',
      title: 'Sion: Rooted in Mumbai, Connected to Its Future',
      description: 'Mumbai has always been a city where location determines the rhythm of daily life. But as its centres of work',
      url: MEDIA_BASE + 'sion-rooted-in-mumbai-connected-to-its-future',
    },
    {
      date: 'August 14, 2026',
      source: 'IANS',
      title: 'Rubics Group Comes On Board as Official Sponsor of Mumbay FC for Durand Cup 2026',
      description:
        'This partnership reflects Rubics Group’s ongoing commitment to emerging talent, community building and creating platforms for ambition',
      url: MEDIA_BASE + 'rubics-group-comes-on-board-as-official-sponsor-of-mumbay-fc-for-durand-cup-2026-ians',
    },
    {
      date: 'August 08, 2026',
      source: 'Prop News Time',
      title: "How infrastructure upgrades are redefining Sion's residential appeal",
      description: "Mumbai's established residential neighbourhoods are increasingly benefiting from infrastructure-led urban renewal",
      url: MEDIA_BASE + 'how-infrastructure-upgrades-are-redefining-sions-residential-appeal',
    },
    {
      date: 'July 30, 2026',
      source: 'Mid Day',
      title:
        "Sion's Rapid Infrastructure Growth: Shaping a Better Lifestyle for Residents By Suhan Shetty, Founder of Rubics Group",
      description:
        'Discover how new infrastructure projects, improved connectivity, and strong social amenities are making Sion one of Mumbai`s fastest-growing residential hubs.',
      url: MEDIA_BASE + 'sions-rapid-infrastructure-growth-shaping-a-better-lifestyle-for-residents-by-suhan-shetty-founder-of-rubics-group',
    },
    {
      date: 'May 20, 2026',
      source: 'IANS',
      title:
        'Rubics Realty announces an ambitious pipeline of two luxury projects in heritage Mumbai neighbourhoods as well as an expansive hospitality venture for 2026-27',
      description: 'The phased launch calendar will see Rubics Realty launching three residential projects in Sion, Dadar and Worli',
      url:
        MEDIA_BASE +
        'rubics-realty-announces-an-ambitious-pipeline-of-two-luxury-projects-in-heritage-mumbai-neighbourhoods-as-well-as-an-expansive-hospitality-venture-for-2026-27-ians',
    },
  ],
};

export const enquiry = {
  title: 'Please enter your details',
  submit: 'Submit',
  success: 'Thank you for contacting us. We have received your details and will get back to you shortly.',
  projects: ['BeauMonté Tower C', 'Lalbaug'],
};

export const footer = {
  company: 'RUBICS REALTY',
  email: 'reach@rubics.co',
  phone: '+91 22-66665214',
  phoneLabel: 'Landline Number',
  address: 'B-wing, 9th Floor , Lodha Signet, Senapati Bapat Marg, Worli, Lower Parel, Mumbai-400 013',
  poweredBy: 'Powered by Rubics Corporation',
  copyright: 'Copyright © 2026',
  social: [
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61581511226864' },
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/rubicsrealty' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/rubics-realty/' },
    { id: 'x', label: 'X', href: 'https://x.com/realtyrubics?s=21' },
  ],
  projectDisclaimer:
    'The plans, specifications, elevations, conceptual designs, visuals, images, dimensions, photographs, furniture, fixtures, amenities, and facilities depicted are strictly for representation purposes only and are subject to requisite approvals from competent authorities. This does not constitute an offer or contract of any nature. All brand names and trademarks are reserved. *T&C Apply.',
};

export type LegalDoc = { title: string; intro: string; sections: { heading: string; body?: string; list?: { lead: string; text: string }[] }[] };

export const privacyPolicy: LegalDoc = {
  title: 'Privacy Policy',
  intro:
    'This Privacy Policy sets out how Rubics Realty collects, uses, discloses and protects personal information obtained from users ("Users") of this website ("Site"). By accessing or using the Site, Users acknowledge that they have read and understood this Privacy Policy.',
  sections: [
    {
      heading: 'Web Browser Cookies',
      body: 'The Site may use "cookies" and similar technologies to enhance User experience and to support certain functions of the Site. Users may configure their web browser to refuse cookies or to alert them when cookies are being sent. However, if cookies are disabled, some parts of the Site may not function properly or may become unavailable.',
    },
    {
      heading: 'Personal Information We May Collect',
      body: 'Rubics Realty may collect personal information that Users voluntarily provide. Rubics Realty may also collect non-personal information such as browser type, device information, IP address, and usage data in aggregated form.',
    },
    {
      heading: 'How We Use Collected Information',
      body: "Rubics Realty may collect, store and use Users' information for the following purposes:",
      list: [
        { lead: 'To improve customer service:', text: 'Information provided by Users helps us respond more efficiently to inquiries, customer service requests and support needs.' },
        { lead: 'To personalize User experience:', text: 'We may use information in the aggregate to understand how Users as a group use the services and resources provided on the Site.' },
        { lead: 'To improve our Site, products and services:', text: 'We may use feedback and usage information to refine our Site, offerings, and user interface.' },
        { lead: 'To administer promotions, contests, surveys or other features:', text: 'We may use information to manage and operate any promotional or engagement activities made available via the Site.' },
        { lead: 'To send information that Users agree to receive:', text: 'We may send Users information about projects, events, offers, or other topics we believe may be of interest, where Users have consented or where otherwise permitted by law.' },
        { lead: 'To send periodic communications:', text: 'We may use email addresses or other contact details to respond to inquiries, questions and requests, and, where applicable, to send newsletters, updates, marketing or service-related communications.' },
      ],
    },
    {
      heading: 'Opt-Out / Unsubscribe',
      body: 'If at any time a User wishes to stop receiving marketing or promotional emails or messages, the User may unsubscribe by using the instructions provided in such communication (where available) or by contacting us through the contact details provided on the Site. Even after opting out of marketing communications, Rubics Realty may still send non-marketing communications, such as responses to specific queries or legally required notices.',
    },
    {
      heading: "How We Protect Users' Information",
      body: 'We adopt commercially reasonable technical and organisational measures for data collection, storage and processing, and for security safeguards, in order to protect personal information against unauthorized access, alteration, disclosure or destruction. Data exchanged between the Site and Users may occur over Secure Socket Layer (SSL) or similar encrypted channels, and may be protected with appropriate digital certificates or equivalent security technologies. While we endeavour to protect personal information, no method of transmission over the Internet or method of electronic storage is fully secure, and we cannot guarantee absolute security.',
    },
    {
      heading: 'Retention of Information',
      body: 'We may retain personal information for as long as necessary to fulfil the purposes for which it was collected, to comply with legal, regulatory or contractual obligations, or for legitimate business purposes, after which it may be deleted, anonymised or archived in accordance with applicable law and our internal policies.',
    },
    {
      heading: 'Changes to This Privacy Policy',
      body: 'Rubics Realty reserves the right to update or modify this Privacy Policy at any time. When we do so, we may revise the "last updated" date at the beginning or end of this document. Users are encouraged to review this page periodically to stay informed about how we process and protect personal information. Continued use of the Site after any changes to this Privacy Policy shall constitute deemed acceptance of those changes.',
    },
  ],
};

export const disclaimer: LegalDoc = {
  title: 'Disclaimer',
  intro:
    'All information, materials, images, plans, layouts, specifications, amenities and other content on this website (collectively, the "Information") are for general informational purposes only and may be modified or updated at any time without prior notice. Rubics Realty does not represent or warrant, expressly or impliedly, the completeness, accuracy, reliability, suitability or availability of the Information for any purpose.',
  sections: [
    {
      heading: 'No Offer or Contract',
      body: 'Nothing on this website constitutes or shall be construed as an offer, invitation to offer, or solicitation for the sale, purchase or lease of any unit, premises or other interest in any project. Any transaction with Rubics Realty shall be governed exclusively by the relevant definitive agreements, applicable laws and regulations, and the sanctioned plans and approvals of the competent authorities, which shall prevail in case of inconsistency with any Information displayed here.',
    },
    {
      heading: 'Illustrative Content',
      body: 'All images and visuals, including computer-generated images, renderings, artistic impressions, stock photographs, and depictions of furniture and fixtures, are purely indicative and intended only to convey the general appearance and ambience of the development. They may differ from the actual project or unit as completed. All dimensions and areas, where provided, are approximate and subject to permissible variation at the time of construction and completion.',
    },
    {
      heading: 'No Liability',
      body: 'To the maximum extent permitted by applicable law, Rubics Realty and its affiliates, directors, officers, employees, agents and representatives shall not be liable for any direct, indirect, incidental, consequential, special or punitive loss, damage or injury arising out of or in connection with (i) any use of or reliance on the Information, or (ii) any error, omission, interruption, delay, failure or technical issue relating to this website or any linked third-party website.',
    },
    {
      heading: 'Intellectual Property',
      body: 'Unless expressly stated otherwise, all content on this website, including text, graphics, logos, designs, layouts and the overall look and feel, constitutes the intellectual property of Rubics Realty or its licensors and is protected by applicable law. No content may be copied, reproduced, republished, uploaded, posted, transmitted or distributed in any form without the prior written consent of Rubics Realty, other than for strictly personal, non-commercial use.',
    },
    {
      heading: 'Governing Law and Jurisdiction',
      body: 'Any dispute arising out of or in connection with this website or any use of or reliance on the Information shall be governed by and construed in accordance with the laws in force in the jurisdiction in which the relevant project is situated, and shall be subject to the exclusive jurisdiction of the competent courts of that jurisdiction, save as otherwise mandatorily required by applicable law.',
    },
  ],
};

export const nav = [
  { id: 'projects', label: 'Projects' },
  { id: 'legacy', label: 'Led By Legacy' },
  { id: 'about', label: 'About Rubics' },
  { id: 'media', label: 'Media' },
  { id: 'enquiry', label: 'Enquire' },
];
