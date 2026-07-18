// Shared topic registry: the single source of truth for slugs, titles, and
// markdown files. Used by topic.js (page rendering) and search.js (search).

const TOPIC_MAP = {
  'around-town': { title: 'Around Town', file: 'FAQ/Around Town.md' },
  changelog: { title: 'Changelog', file: 'CHANGELOG.md' },
  install: { title: 'Make This an App', file: 'install.md' },
  bedrooms: { title: 'Bedrooms, Sheets & Towels', file: 'FAQ/Bedrooms.md' },
  binoculars: { title: 'Binoculars', file: 'FAQ/Binoculars.md' },
  climate: { title: 'Climate', file: 'FAQ/Climate.md' },
  coffee: { title: 'Coffee & Tea', file: 'FAQ/Coffee.md' },
  deck: { title: 'Deck & Umbrellas', file: 'FAQ/Deck and Umbrellas.md' },
  'dock-boating-beach': { title: 'Dock, Boating & Beach Toys', file: 'FAQ/Dock, Boating, and Beach toys.md' },
  ev: { title: 'EV', file: 'FAQ/EV.md' },
  fire: { title: 'Fire', file: 'FAQ/Fire.md' },
  garbage: { title: 'Garbage', file: 'FAQ/Garbage.md' },
  'health-care': { title: 'Health Care', file: 'FAQ/Health Care.md' },
  kitchen: { title: 'Kitchen, Cooking & Grilling', file: 'FAQ/Kitchen and Grilling.md' },
  laundry: { title: 'Laundry', file: 'FAQ/Laundry.md' },
  'septic-drains': { title: 'Septic & Drains', file: 'FAQ/Septic and drains.md' },
  technology: { title: 'Technology', file: 'FAQ/Technology.md' },
  vacuum: { title: 'Vacuum', file: 'FAQ/Vacuum.md' },
  'walkie-talkies': { title: 'Walkie Talkies', file: 'FAQ/Walkie Talkies.md' },
  weather: { title: 'Weather', file: 'FAQ/Weather.md' }
};

// Old topic slugs from before the 2026 consolidation keep working
const TOPIC_ALIASES = {
  'home-assistant': 'technology',
  lighting: 'technology',
  'home-automation': 'technology',
  'internet-wifi': 'technology',
  'printer-scanner': 'technology',
  work: 'technology',
  grills: 'kitchen',
  'tv-video-audio': 'technology',
  'audio-video': 'technology',
  restaurants: 'around-town'
};
