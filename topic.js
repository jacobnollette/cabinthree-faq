const TOPIC_MAP = {
  'home-assistant': { title: '@ Home Assistant', file: 'FAQ/@ Home Assistant.md' },
  bedrooms: { title: 'Bedrooms', file: 'FAQ/Bedrooms.md' },
  binoculars: { title: 'Binoculars', file: 'FAQ/Binoculars.md' },
  climate: { title: 'Climate', file: 'FAQ/Climate.md' },
  deck: { title: 'Deck', file: 'FAQ/Deck.md' },
  'dock-boating-beach': { title: 'Dock, Boating, and Beach Toys', file: 'FAQ/Dock, Boating, and Beach toys.md' },
  ev: { title: 'EV', file: 'FAQ/EV.md' },
  fire: { title: 'Fire', file: 'FAQ/Fire.md' },
  garbage: { title: 'Garbage', file: 'FAQ/Garbage.md' },
  grills: { title: 'Grills', file: 'FAQ/Grills.md' },
  'internet-wifi': { title: 'Internet - WIFI', file: 'FAQ/Internet - WIFI.md' },
  kitchen: { title: 'Kitchen', file: 'FAQ/Kitchen.md' },
  laundry: { title: 'Laundry', file: 'FAQ/Laundry.md' },
  lighting: { title: 'Lighting', file: 'FAQ/Lighting.md' },
  'printer-scanner': { title: 'Printer - Scanner', file: 'FAQ/Printer - Scanner.md' },
  'septic-drains': { title: 'Septic and Drains', file: 'FAQ/Septic and drains.md' },
  'tv-video-audio': { title: 'TV - Video - Audio', file: 'FAQ/TV - Video - Audio.md' },
  vaccuum: { title: 'Vaccuum', file: 'FAQ/Vaccuum.md' },
  weather: { title: 'Weather', file: 'FAQ/Weather.md' },
  work: { title: 'Work', file: 'FAQ/Work.md' }
};

const params = new URLSearchParams(window.location.search);
const slug = params.get('topic') || 'internet-wifi';
const topic = TOPIC_MAP[slug];
const titleEl = document.querySelector('#topic-title');
const contentEl = document.querySelector('#topic-content');
const yearEl = document.querySelector('#year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (!topic) {
  if (titleEl) {
    titleEl.textContent = 'Topic Not Found';
  }
  if (contentEl) {
    contentEl.innerHTML = '<p>This topic does not exist. Go back and choose a valid topic card.</p>';
  }
} else {
  if (titleEl) {
    titleEl.textContent = topic.title;
  }

  fetch(topic.file)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${topic.file}`);
      }
      return response.text();
    })
    .then((markdown) => {
      if (!contentEl) {
        return;
      }
      if (window.marked) {
        contentEl.innerHTML = window.marked.parse(markdown);
      } else {
        contentEl.textContent = markdown;
      }
    })
    .catch(() => {
      if (contentEl) {
        contentEl.innerHTML = '<p>Unable to load this topic right now.</p>';
      }
    });
}
