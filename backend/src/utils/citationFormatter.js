// ============================================================
//  Citation formatter  (APA 7, MLA 9, Harvard)
// ------------------------------------------------------------
//  Pure, deterministic string formatting — no AI needed.
//  Titles/journals are wrapped in *asterisks* to mark italics;
//  the frontend renders them italic and strips them on copy.
// ============================================================

// ---- Author parsing & formatting ---------------------------
export function parseAuthors(raw) {
  if (!raw) return [];
  return raw
    .split(/[\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((str) => {
      if (str.includes(',')) {
        const [last, ...rest] = str.split(',');
        return { last: last.trim(), first: rest.join(',').trim() };
      }
      const parts = str.split(/\s+/);
      const last = parts.pop();
      return { last, first: parts.join(' ') };
    });
}

function initials(first) {
  return first
    .split(/[\s.-]+/)
    .filter(Boolean)
    .map((n) => `${n[0].toUpperCase()}.`)
    .join(' ');
}

function authorsAPA(a) {
  const fmt = (x) => `${x.last}, ${initials(x.first)}`.trim();
  if (a.length === 0) return '';
  if (a.length === 1) return fmt(a[0]);
  const all = a.map(fmt);
  return `${all.slice(0, -1).join(', ')}, & ${all[all.length - 1]}`;
}

function authorsMLA(a) {
  const lead = (x) => `${x.last}, ${x.first}`.trim();
  const norm = (x) => `${x.first} ${x.last}`.trim();
  if (a.length === 0) return '';
  if (a.length === 1) return lead(a[0]);
  if (a.length === 2) return `${lead(a[0])}, and ${norm(a[1])}`;
  return `${lead(a[0])}, et al.`;
}

function authorsHarvard(a) {
  const fmt = (x) => `${x.last}, ${initials(x.first)}`.trim();
  if (a.length === 0) return '';
  if (a.length === 1) return fmt(a[0]);
  if (a.length === 2) return `${fmt(a[0])} and ${fmt(a[1])}`;
  return `${a.slice(0, -1).map(fmt).join(', ')} and ${fmt(a[a.length - 1])}`;
}

// ---- Helpers -----------------------------------------------
const clean = (s) => (s || '').trim();
// Join parts, skipping empties, without leaving double spaces/punctuation.
const j = (...parts) => parts.filter(Boolean).join('');

// ---- Builders per style ------------------------------------
function apa(type, f, authors) {
  const A = authorsAPA(authors);
  const lead = A ? `${A} ` : '';
  const year = f.year ? `(${clean(f.year)}). ` : '';
  if (type === 'book') {
    const ed = f.edition ? ` (${clean(f.edition)} ed.)` : '';
    return j(lead, year, `*${clean(f.title)}*`, ed, '. ', clean(f.publisher), '.');
  }
  if (type === 'journal') {
    const vol = clean(f.volume);
    const iss = f.issue ? `(${clean(f.issue)})` : '';
    const pages = f.pages ? `, ${clean(f.pages)}` : '';
    const doi = f.doi ? ` https://doi.org/${clean(f.doi)}` : '';
    return j(lead, year, `${clean(f.title)}. `, `*${clean(f.journal)}*`, `, ${vol}${iss}${pages}.`, doi);
  }
  // website
  const site = f.siteName ? `${clean(f.siteName)}. ` : '';
  const url = clean(f.url);
  return j(lead, year, `*${clean(f.title)}*. `, site, url);
}

function mla(type, f, authors) {
  const A = authorsMLA(authors);
  const lead = A ? `${A}. ` : '';
  if (type === 'book') {
    const ed = f.edition ? `${clean(f.edition)} ed., ` : '';
    return j(lead, `*${clean(f.title)}*. `, ed, clean(f.publisher), ', ', clean(f.year), '.');
  }
  if (type === 'journal') {
    const iss = f.issue ? `no. ${clean(f.issue)}, ` : '';
    const pages = f.pages ? `, pp. ${clean(f.pages)}` : '';
    return j(lead, `"${clean(f.title)}." `, `*${clean(f.journal)}*`, `, vol. ${clean(f.volume)}, `, iss, clean(f.year), pages, '.');
  }
  // website
  const acc = f.accessed ? ` Accessed ${clean(f.accessed)}.` : '';
  return j(lead, `"${clean(f.title)}." `, `*${clean(f.siteName)}*`, ', ', clean(f.year), ', ', clean(f.url), '.', acc);
}

function harvard(type, f, authors) {
  const A = authorsHarvard(authors);
  const lead = A ? `${A} ` : '';
  const year = f.year ? `(${clean(f.year)}) ` : '';
  if (type === 'book') {
    const ed = f.edition ? ` ${clean(f.edition)} edn.` : '';
    const place = f.place ? `${clean(f.place)}: ` : '';
    return j(lead, year, `*${clean(f.title)}*.`, ed, ' ', place, clean(f.publisher), '.');
  }
  if (type === 'journal') {
    const iss = f.issue ? `(${clean(f.issue)})` : '';
    const pages = f.pages ? `, pp. ${clean(f.pages)}` : '';
    return j(lead, year, `'${clean(f.title)}', `, `*${clean(f.journal)}*`, `, ${clean(f.volume)}${iss}${pages}.`);
  }
  // website
  const acc = f.accessed ? ` (Accessed: ${clean(f.accessed)})` : '';
  return j(lead, year, `*${clean(f.title)}*. `, `Available at: ${clean(f.url)}`, acc, '.');
}

const STYLES = { apa: apa, mla: mla, harvard: harvard };

export function formatCitation({ sourceType, style, fields }) {
  const builder = STYLES[style] || apa;
  const type = ['book', 'journal', 'website'].includes(sourceType) ? sourceType : 'book';
  const authors = parseAuthors(fields.authors);
  return builder(type, fields, authors);
}
