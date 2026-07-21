// Shared style tokens for the artist site. Museum-minimal: white, near-black,
// serif headings, mono captions. Deliberately quiet.

export const c = {
  paper: '#ffffff',
  ink: '#111111',
  faint: '#6b6b6b',
  line: '#e4e4e4',
  hover: '#000000',
};

// Modern luxury monotype (à la Celine / The Row / Saint Laurent): ONE clean
// grotesk — Inter — used everywhere. Large + heavy + tight for headlines, large
// + light + tracked for the wordmark, small + tracked for nav / labels /
// captions, regular for body copy. Single typeface throughout.
const INTER = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
export const serif = INTER;
export const mono = INTER;
export const body = INTER;

export const caption = {
  fontFamily: mono,
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: c.faint,
};

// Where to find / collect the work. Used by the socials wall (About) and the
// corporate footer. Only entries with an `href` are shown — fill the empty ones
// with the real handle links to surface them everywhere at once.
export const SOCIALS = [
  { label: 'Instagram', handle: '@annalouisesimpson', href: 'https://instagram.com/annalouisesimpson' },
  { label: 'X', handle: '@missalsimpson', href: 'https://x.com/missalsimpson' },
  { label: 'TikTok', handle: '@missalsimpson', href: 'https://www.tiktok.com/@missalsimpson' },
  { label: 'SuperRare', handle: 'superrare.com/missalsimpson', href: 'https://superrare.com/missalsimpson' },
  { label: 'Foundation', handle: '@missalsimpson', href: '' },
  { label: 'OpenSea', handle: 'missalsimpson', href: '' },
  { label: 'Email', handle: 'studio@missalsimpson.com', href: 'mailto:studio@missalsimpson.com' },
];
