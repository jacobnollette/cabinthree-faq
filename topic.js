const TOPIC_MAP = {
  'audio-video': { title: 'Audio Video', file: 'FAQ/Audio Video.md' },
  bedrooms: { title: 'Bedrooms', file: 'FAQ/Bedrooms.md' },
  binoculars: { title: 'Binoculars', file: 'FAQ/Binoculars.md' },
  climate: { title: 'Climate', file: 'FAQ/Climate.md' },
  deck: { title: 'Deck & Grill', file: 'FAQ/Deck.md' },
  'dock-boating-beach': { title: 'Dock, Boating, and Beach Toys', file: 'FAQ/Dock, Boating, and Beach toys.md' },
  ev: { title: 'EV', file: 'FAQ/EV.md' },
  fire: { title: 'Fire', file: 'FAQ/Fire.md' },
  garbage: { title: 'Garbage', file: 'FAQ/Garbage.md' },
  'home-automation': { title: 'Home Automation', file: 'FAQ/Home Automation.md' },
  kitchen: { title: 'Kitchen', file: 'FAQ/Kitchen.md' },
  laundry: { title: 'Laundry', file: 'FAQ/Laundry.md' },
  restaurants: { title: 'Around Town', file: 'FAQ/Around Town.md' },
  'septic-drains': { title: 'Septic and Drains', file: 'FAQ/Septic and drains.md' },
  technology: { title: 'Technology', file: 'FAQ/Technology.md' },
  vacuum: { title: 'Vacuum', file: 'FAQ/Vacuum.md' },
  'walkie-talkies': { title: 'Walkie Talkies', file: 'FAQ/Walkie Talkies.md' },
  weather: { title: 'Weather', file: 'FAQ/Weather.md' }
};

// Old topic slugs from before the 2026 consolidation keep working
const TOPIC_ALIASES = {
  'home-assistant': 'home-automation',
  lighting: 'home-automation',
  'internet-wifi': 'technology',
  'printer-scanner': 'technology',
  work: 'technology',
  grills: 'deck',
  'tv-video-audio': 'audio-video'
};

const SHORTS_URL_RE = /^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/;

// Markdown image syntax pointing at a YouTube Short becomes an inline player:
//   ![Title](https://www.youtube.com/shorts/VIDEO_ID)
// Regular [text](url) links are left untouched. See CLAUDE.md.
function upgradeShortsEmbeds(root) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    const label = img.getAttribute('alt') || '';
    const match = src.match(SHORTS_URL_RE);

    if (!match) {
      // Any other YouTube URL in image syntax degrades to a plain link
      // instead of a broken <img>. The site only embeds Shorts.
      if (/youtube\.com|youtu\.be/.test(src)) {
        const link = document.createElement('a');
        link.href = src;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = label || src;
        img.replaceWith(link);
      }
      return;
    }

    const figure = document.createElement('figure');
    figure.className = 'shorts-player';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${match[1]}?playsinline=1`;
    iframe.title = label || 'YouTube Short';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    figure.appendChild(iframe);

    if (label) {
      const caption = document.createElement('figcaption');
      caption.textContent = label;
      figure.appendChild(caption);
    }

    img.replaceWith(figure);
  });
}

const ISSUE_TAG_RE = /^\s*\[!ISSUE\]\s*/;
const ISSUE_CONTACT_EMAIL = 'jacob@jacobnollette.com';
const REPO_URL = 'https://github.com/jacobnollette/cabinthree-faq';

// Blockquotes that open with [!ISSUE] become "known issue" callouts:
//   > [!ISSUE]
//   > One of the water pitchers' lights doesn't turn on.
// Each callout gets a warning badge and a footer inviting readers to email
// Jacob or open a pull request if they know the fix. See CLAUDE.md.
function upgradeIssueCallouts(root, topicTitle) {
  root.querySelectorAll('blockquote').forEach((quote) => {
    const firstPara = quote.querySelector('p');
    if (!firstPara || !ISSUE_TAG_RE.test(firstPara.textContent)) {
      return;
    }

    const firstText = firstPara.firstChild;
    if (firstText && firstText.nodeType === Node.TEXT_NODE) {
      firstText.textContent = firstText.textContent.replace(ISSUE_TAG_RE, '');
    }
    if (!firstPara.textContent.trim() && !firstPara.querySelector('*')) {
      firstPara.remove();
    }

    const aside = document.createElement('aside');
    aside.className = 'issue-callout';

    const badge = document.createElement('p');
    badge.className = 'issue-badge';
    badge.textContent = '⚠️ Known issue — unsolved';
    aside.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'issue-body';
    while (quote.firstChild) {
      body.appendChild(quote.firstChild);
    }
    aside.appendChild(body);

    const subject = encodeURIComponent(`Cabin Three FAQ fix: ${topicTitle}`);
    const actions = document.createElement('p');
    actions.className = 'issue-actions';
    actions.innerHTML =
      'Know the fix? ' +
      `<a href="mailto:${ISSUE_CONTACT_EMAIL}?subject=${subject}">Email Jacob</a>` +
      ' or ' +
      `<a href="${REPO_URL}" target="_blank" rel="noopener">open a pull request</a>.`;
    aside.appendChild(actions);

    quote.replaceWith(aside);
  });
}

const params = new URLSearchParams(window.location.search);
const requestedSlug = params.get('topic') || 'technology';
const slug = TOPIC_ALIASES[requestedSlug] || requestedSlug;
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
        upgradeShortsEmbeds(contentEl);
        upgradeIssueCallouts(contentEl, topic.title);
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
