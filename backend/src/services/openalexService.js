// Thin client over the OpenAlex "Works" API (https://docs.openalex.org/api-entities/works).
// OpenAlex is free, no key required; polite pool identifies via mailto parameter.

const BASE = 'https://api.openalex.org';

function mailtoParam() {
  const m = process.env.OPENALEX_MAILTO;
  return m ? `mailto=${encodeURIComponent(m)}` : '';
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return '';
  const positions = [];
  for (const [word, idxs] of Object.entries(invertedIndex)) {
    for (const i of idxs) positions.push([i, word]);
  }
  positions.sort((a, b) => a[0] - b[0]);
  return positions.map(([, w]) => w).join(' ');
}

function normalize(work) {
  const openalexId = work.id ? work.id.replace('https://openalex.org/', '') : null;
  return {
    openalexId,
    doi: work.doi ? work.doi.replace('https://doi.org/', '') : null,
    title: work.title || work.display_name || 'Untitled',
    authors: (work.authorships || []).map((a) => a.author?.display_name).filter(Boolean),
    abstract: reconstructAbstract(work.abstract_inverted_index),
    year: work.publication_year || null,
    venue:
      work.primary_location?.source?.display_name ||
      work.host_venue?.display_name ||
      '',
    citationsCount: work.cited_by_count || 0,
    concepts: (work.concepts || []).slice(0, 5).map((c) => c.display_name),
    referencedWorks: (work.referenced_works || []).map((u) =>
      u.replace('https://openalex.org/', '')
    ),
    url:
      work.primary_location?.landing_page_url ||
      work.doi ||
      (openalexId ? `https://openalex.org/${openalexId}` : ''),
  };
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': `PaperTrail/1.0 (${process.env.OPENALEX_MAILTO || 'anon'})` },
  });
  if (!res.ok) {
    const err = new Error(`OpenAlex error ${res.status}`);
    err.status = res.status === 429 ? 429 : 502;
    throw err;
  }
  return res.json();
}

export async function searchWorks({ q, page = 1, perPage = 10 }) {
  const params = [
    `search=${encodeURIComponent(q)}`,
    `page=${page}`,
    `per-page=${Math.min(perPage, 25)}`,
    'select=id,doi,title,display_name,authorships,abstract_inverted_index,publication_year,primary_location,host_venue,cited_by_count,concepts,referenced_works',
    mailtoParam(),
  ].filter(Boolean).join('&');

  const data = await fetchJSON(`${BASE}/works?${params}`);
  return {
    total: data.meta?.count ?? 0,
    page,
    perPage,
    results: (data.results || []).map(normalize),
  };
}

export async function getWorkById(openalexId) {
  const id = openalexId.replace(/^https?:\/\/openalex\.org\//, '');
  const data = await fetchJSON(`${BASE}/works/${id}?${mailtoParam()}`);
  return normalize(data);
}

export async function getWorksByIds(ids) {
  if (!ids.length) return [];
  const filter = `openalex_id:${ids.slice(0, 50).join('|')}`;
  const params = [
    `filter=${encodeURIComponent(filter)}`,
    'per-page=50',
    'select=id,doi,title,display_name,authorships,abstract_inverted_index,publication_year,primary_location,cited_by_count,concepts',
    mailtoParam(),
  ].filter(Boolean).join('&');

  const data = await fetchJSON(`${BASE}/works?${params}`);
  return (data.results || []).map(normalize);
}
