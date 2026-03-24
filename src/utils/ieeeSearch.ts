/**
 * Client-side IEEE / Springer conference and research paper discovery helpers.
 */

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export interface IEEEConferenceData {
  title: string;
  description: string;
  conference_type: string;
  date: string;
  end_date: string;
  location: string;
  hyperlink: string;
}

export interface IEEEResearchPaperData {
  title: string;
  abstract: string;
  publication_date: string;
  authors: string;
  publisher: string;
  doi: string;
  paper_url: string;
  source: string;
  paper_type: string;
  citations: number;
}

const CONFERENCE_KEYWORDS = ["conference", "symposium", "workshop", "summit", "congress"];
const PAPER_TYPE_KEYWORDS = ["survey", "review", "case study", "short paper", "poster"];

const clean = (text: string, limit = 300): string =>
  text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, limit);

const getMetaContent = (doc: Document, names: string[]): string => {
  for (const name of names) {
    const node =
      doc.querySelector(`meta[name=\"${name}\"]`) ||
      doc.querySelector(`meta[property=\"${name}\"]`) ||
      doc.querySelector(`meta[name=\"citation_${name}\"]`) ||
      doc.querySelector(`meta[property=\"citation_${name}\"]`);
    const value = node?.getAttribute("content");
    if (value) return value;
  }
  return "";
};

const guessConferenceType = (title: string, description: string): string => {
  const hay = `${title} ${description}`.toLowerCase();
  if (hay.includes("symposium")) return "symposium";
  if (hay.includes("workshop")) return "workshop";
  if (hay.includes("summit")) return "summit";
  if (hay.includes("webinar")) return "webinar";
  return "conference";
};

const guessPaperType = (title: string, abstract: string): string => {
  const hay = `${title} ${abstract}`.toLowerCase();
  for (const key of PAPER_TYPE_KEYWORDS) {
    if (hay.includes(key)) return key;
  }
  return "conference-paper";
};

const extractFirstDate = (text: string): string => {
  const normalized = text.replace(/\s+/g, " ");
  const m = normalized.match(/\b(?:\d{1,2}[\/-])?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i);
  return m ? clean(m[0], 40) : "";
};

export async function scrapeConferenceUrl(url: string): Promise<IEEEConferenceData> {
  const res = await fetch(CORS_PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error(`Failed to fetch URL (status ${res.status})`);

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  let jsonLd: any = {};
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const parsed = JSON.parse(script.textContent || "{}");
      if (parsed?.["@type"] === "Event" || parsed?.name) jsonLd = parsed;
    } catch {
      // ignore invalid JSON-LD
    }
  });

  const title =
    jsonLd.name ||
    getMetaContent(doc, ["citation_title", "og:title", "twitter:title", "title"]) ||
    doc.querySelector("h1")?.textContent ||
    doc.title ||
    "";

  const description =
    jsonLd.description ||
    getMetaContent(doc, ["description", "og:description", "twitter:description"]) ||
    "";

  const location =
    jsonLd?.location?.name ||
    jsonLd?.location?.address?.addressLocality ||
    getMetaContent(doc, ["location", "geo.placename"]) ||
    "";

  const date =
    jsonLd.startDate ||
    getMetaContent(doc, ["event:start_date", "citation_publication_date", "date"]) ||
    extractFirstDate(html) ||
    "";

  const end_date = jsonLd.endDate || getMetaContent(doc, ["event:end_date"]) || "";

  return {
    title: clean(title, 180),
    description: clean(description, 420),
    conference_type: guessConferenceType(title, description),
    date: clean(date, 60),
    end_date: clean(end_date, 60),
    location: clean(location, 120),
    hyperlink: url,
  };
}

export async function discoverIEEEAndSpringerConferences(): Promise<IEEEConferenceData[]> {
  const sources = [
    "http://www.wikicfp.com/cfp/call?conference=ieee",
    "http://www.wikicfp.com/cfp/call?conference=springer",
  ];

  const collected: IEEEConferenceData[] = [];

  await Promise.all(
    sources.map(async (src) => {
      try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(src));
        if (!res.ok) return;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        const links = Array.from(doc.querySelectorAll("a"));
        for (const a of links) {
          const title = clean(a.textContent || "", 180);
          const href = a.getAttribute("href") || "";
          if (!title || title.length < 18) continue;

          const lower = title.toLowerCase();
          const isConference = CONFERENCE_KEYWORDS.some((k) => lower.includes(k));
          const isIEEEOrSpringer = lower.includes("ieee") || lower.includes("springer") || src.includes("springer") || src.includes("ieee");
          if (!isConference || !isIEEEOrSpringer) continue;

          const rowText = clean((a.closest("tr")?.textContent || "") + " " + (a.parentElement?.textContent || ""), 500);
          const date = extractFirstDate(rowText);
          const locationMatch = rowText.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s?[A-Z][a-z]+\b/);
          const location = locationMatch ? clean(locationMatch[0], 80) : "";

          collected.push({
            title,
            description: clean(rowText.replace(title, ""), 300),
            conference_type: guessConferenceType(title, rowText),
            date,
            end_date: "",
            location,
            hyperlink: href.startsWith("http") ? href : `http://www.wikicfp.com${href}`,
          });
        }
      } catch {
        // best-effort discovery
      }
    })
  );

  const dedup = new Map<string, IEEEConferenceData>();
  collected.forEach((c) => {
    const key = `${c.title.toLowerCase()}|${c.date.toLowerCase()}`;
    if (!dedup.has(key)) dedup.set(key, c);
  });

  const discovered = Array.from(dedup.values()).slice(0, 15);
  if (discovered.length > 0) return discovered;

  return [
    {
      title: "IEEE International Conference on Communication Systems",
      description: "Curated fallback conference listing (replace/edit after review).",
      conference_type: "conference",
      date: "",
      end_date: "",
      location: "",
      hyperlink: "https://ieeexplore.ieee.org/",
    },
    {
      title: "Springer Conference on Intelligent Systems",
      description: "Curated fallback conference listing (replace/edit after review).",
      conference_type: "conference",
      date: "",
      end_date: "",
      location: "",
      hyperlink: "https://link.springer.com/",
    },
  ];
}

export async function scrapeResearchPaperUrl(url: string): Promise<IEEEResearchPaperData> {
  const res = await fetch(CORS_PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error(`Failed to fetch URL (status ${res.status})`);

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const title =
    getMetaContent(doc, ["citation_title", "dc.title", "og:title", "twitter:title", "title"]) ||
    doc.querySelector("h1")?.textContent ||
    doc.title ||
    "";

  const abstract =
    getMetaContent(doc, ["citation_abstract", "description", "og:description", "dc.description"]) ||
    "";

  const publisher = getMetaContent(doc, ["citation_publisher", "dc.publisher", "publisher"]) ||
    (url.includes("springer") ? "Springer" : url.includes("ieee") ? "IEEE" : "");

  const doi =
    getMetaContent(doc, ["citation_doi", "dc.identifier", "doi"]) ||
    (html.match(/10\.\d{4,9}\/[\-._;()/:A-Z0-9]+/i)?.[0] || "");

  const authorNodes = doc.querySelectorAll('meta[name="citation_author"], meta[name="dc.creator"]');
  const authors = Array.from(authorNodes)
    .map((n) => n.getAttribute("content") || "")
    .filter(Boolean)
    .slice(0, 8)
    .join(", ");

  const publication_date =
    getMetaContent(doc, ["citation_publication_date", "dc.date", "date"]) ||
    extractFirstDate(html) ||
    "";

  const source = url.includes("springer") ? "springer" : url.includes("ieee") ? "ieee" : "web";

  return {
    title: clean(title, 220),
    abstract: clean(abstract, 1200),
    publication_date: clean(publication_date, 60),
    authors: clean(authors, 350),
    publisher: clean(publisher, 80),
    doi: clean(doi, 180),
    paper_url: url,
    source,
    paper_type: guessPaperType(title, abstract),
    citations: 0,
  };
}

export async function discoverResearchPapers(query = "IEEE OR Springer conference paper"): Promise<IEEEResearchPaperData[]> {
  const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=has_doi:true,from_publication_date:2024-01-01&per-page=15`;
  const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=15`;

  const [openAlexRes, crossrefRes] = await Promise.allSettled([fetch(openAlexUrl), fetch(crossrefUrl)]);

  const papers: IEEEResearchPaperData[] = [];

  if (openAlexRes.status === "fulfilled" && openAlexRes.value.ok) {
    const data = await openAlexRes.value.json();
    (data?.results || []).forEach((item: any) => {
      const title = clean((item.title || ""), 220);
      if (!title) return;
      const sourceName = (item?.primary_location?.source?.display_name || "").toLowerCase();
      const source = sourceName.includes("springer") ? "springer" : sourceName.includes("ieee") ? "ieee" : "openalex";

      papers.push({
        title,
        abstract: clean(item.abstract_inverted_index ? Object.keys(item.abstract_inverted_index).join(" ") : "", 1200),
        publication_date: item.publication_date || "",
        authors: (item.authorships || []).slice(0, 6).map((a: any) => a.author?.display_name).filter(Boolean).join(", "),
        publisher: item?.primary_location?.source?.display_name || "",
        doi: (item.doi || "").replace("https://doi.org/", ""),
        paper_url: item?.primary_location?.landing_page_url || item?.id || "",
        source,
        paper_type: guessPaperType(title, ""),
        citations: Number(item.cited_by_count || 0),
      });
    });
  }

  if (crossrefRes.status === "fulfilled" && crossrefRes.value.ok) {
    const data = await crossrefRes.value.json();
    (data?.message?.items || []).forEach((item: any) => {
      const title = clean(item?.title?.[0] || "", 220);
      if (!title) return;
      const publisher = clean(item.publisher || "", 100);
      const plower = publisher.toLowerCase();
      const source = plower.includes("springer") ? "springer" : plower.includes("ieee") ? "ieee" : "crossref";

      papers.push({
        title,
        abstract: clean(item.abstract || "", 1200),
        publication_date: item?.issued?.["date-parts"]?.[0]?.join("-") || "",
        authors: (item.author || []).slice(0, 6).map((a: any) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean).join(", "),
        publisher,
        doi: clean(item.DOI || "", 180),
        paper_url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : ""),
        source,
        paper_type: guessPaperType(title, item.abstract || ""),
        citations: Number(item["is-referenced-by-count"] || 0),
      });
    });
  }

  const dedup = new Map<string, IEEEResearchPaperData>();
  papers.forEach((p) => {
    const key = (p.doi || p.title).toLowerCase();
    if (!dedup.has(key)) dedup.set(key, p);
  });

  return Array.from(dedup.values()).slice(0, 20);
}
