/**
 * Client-side hackathon scraping & auto-discover utilities.
 * Replaces the undeployed Supabase Edge Functions.
 */

// CORS proxy to fetch external pages from the browser
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

interface HackathonData {
  title: string;
  tagline: string;
  date: string;
  end_date: string;
  location: string;
  prize: string;
  max_participants: string;
  tags: string[];
  status: string;
  link: string;
  gradient?: string;
  icon?: string;
}

/**
 * Scrape a hackathon URL and extract metadata via CORS proxy + HTML parsing.
 */
export async function scrapeHackathonUrl(url: string): Promise<HackathonData> {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Failed to fetch URL (status ${res.status})`);
  
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Extract metadata from multiple sources: og tags, meta tags, JSON-LD, page content
  const getMeta = (name: string): string => {
    const el =
      doc.querySelector(`meta[property="og:${name}"]`) ||
      doc.querySelector(`meta[name="${name}"]`) ||
      doc.querySelector(`meta[name="twitter:${name}"]`);
    return el?.getAttribute("content") || "";
  };

  // Try to extract JSON-LD structured data
  let jsonLdData: any = {};
  const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach((script) => {
    try {
      const parsed = JSON.parse(script.textContent || "");
      if (parsed["@type"] === "Event" || parsed.name) {
        jsonLdData = parsed;
      }
    } catch {}
  });

  // Extract title
  const title =
    jsonLdData.name ||
    getMeta("title") ||
    doc.querySelector("h1")?.textContent?.trim() ||
    doc.querySelector("title")?.textContent?.trim() ||
    "";

  // Extract description/tagline
  const tagline =
    jsonLdData.description?.slice(0, 100) ||
    getMeta("description")?.slice(0, 100) ||
    "";

  // Extract dates
  const startDate = jsonLdData.startDate || "";
  const endDate = jsonLdData.endDate || "";

  // Extract location
  const location =
    jsonLdData.location?.name ||
    jsonLdData.location?.address?.addressLocality ||
    (typeof jsonLdData.location === "string" ? jsonLdData.location : "") ||
    "";

  // Determine if online
  const pageText = html.toLowerCase();
  const isOnline = pageText.includes("online") || pageText.includes("virtual") || pageText.includes("remote");
  const finalLocation = location || (isOnline ? "Online" : "");

  // Extract prize info from page text
  let prize = "";
  const prizeMatch = html.match(/(?:prize|prizes?|reward|bounty)[^<]*?[\$₹€][\d,]+[^<]*/i) ||
    html.match(/[\$₹€][\s]?[\d,]+[\s]?(?:k|K|lakh|lakhs|cr|crore|million)?/);
  if (prizeMatch) prize = prizeMatch[0].replace(/<[^>]*>/g, "").trim().slice(0, 50);

  // Extract participants
  let maxParticipants = "";
  const partMatch = html.match(/(\d[\d,]+)\s*(?:participants|hackers|teams|registrations)/i);
  if (partMatch) maxParticipants = partMatch[1].replace(/,/g, "");

  // Extract tags from keywords or page content
  const keywordsMeta = doc.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";
  const tags = keywordsMeta
    ? keywordsMeta.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6)
    : extractTagsFromText(title + " " + tagline);

  return {
    title: cleanText(title),
    tagline: cleanText(tagline),
    date: startDate || "",
    end_date: endDate || "",
    location: cleanText(finalLocation),
    prize: cleanText(prize),
    max_participants: maxParticipants,
    tags,
    status: "upcoming",
    link: url,
  };
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 200);
}

function extractTagsFromText(text: string): string[] {
  const tagKeywords = [
    "AI", "ML", "blockchain", "web3", "fintech", "healthtech", "edtech",
    "IoT", "cybersecurity", "cloud", "open source", "mobile", "AR", "VR",
    "robotics", "hardware", "sustainability", "social impact", "gaming",
    "data science", "devops", "fullstack", "frontend", "backend", "design",
  ];
  const lower = text.toLowerCase();
  return tagKeywords.filter((t) => lower.includes(t.toLowerCase())).slice(0, 6);
}

// ==================== AUTO-DISCOVER ====================

interface DiscoveredHackathon {
  title: string;
  tagline: string;
  date: string;
  location: string;
  prize: string;
  status: string;
  tags: string[];
  link: string;
  gradient: string;
  icon: string;
  participants?: number;
  max_participants?: number;
}

const GRADIENTS = [
  "from-primary to-purple-400",
  "from-blue-500 to-cyan-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-amber-400",
  "from-pink-500 to-rose-400",
  "from-violet-500 to-indigo-400",
  "from-red-500 to-orange-400",
  "from-teal-500 to-green-400",
];

const ICONS = ["globe", "rocket", "zap", "code", "trophy", "layers", "star", "cpu"];

/**
 * Auto-discover hackathons from multiple curated sources.
 * Fetches from Devpost, MLH, Unstop, and other public listing pages.
 */
export async function discoverHackathons(): Promise<DiscoveredHackathon[]> {
  const allHackathons: DiscoveredHackathon[] = [];

  // Fetch from multiple sources in parallel
  const results = await Promise.allSettled([
    fetchDevpostHackathons(),
    fetchMlhHackathons(),
    fetchUnstopHackathons(),
  ]);

  for (const result of results) {
    if (result.status === "fulfilled") {
      allHackathons.push(...result.value);
    } else {
      console.warn("[Auto-Discover] Source failed:", result.reason);
    }
  }

  // If all API sources fail, return curated/trending hackathons
  if (allHackathons.length === 0) {
    return getCuratedHackathons();
  }

  return allHackathons;
}

// --- DEVPOST ---
async function fetchDevpostHackathons(): Promise<DiscoveredHackathon[]> {
  try {
    const url = CORS_PROXY + encodeURIComponent("https://devpost.com/api/hackathons?status[]=upcoming&status[]=open");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Devpost API failed");
    const data = await res.json();
    
    return (data.hackathons || []).slice(0, 8).map((h: any, i: number) => ({
      title: h.title || "Untitled",
      tagline: h.tagline || h.submission_period || "",
      date: h.submission_period_dates?.split(" - ")?.[0] || "",
      location: h.displayed_location?.location || "Online",
      prize: h.prize_amount ? `$${h.prize_amount}` : "",
      status: "upcoming",
      tags: (h.themes || []).slice(0, 5).map((t: any) => t.name),
      link: h.url || "",
      gradient: GRADIENTS[i % GRADIENTS.length],
      icon: ICONS[i % ICONS.length],
      participants: h.registrations_count || 0,
      max_participants: h.max_team_size || 100,
    }));
  } catch (e) {
    console.warn("[Devpost] Failed:", e);
    return [];
  }
}

// --- MLH ---
async function fetchMlhHackathons(): Promise<DiscoveredHackathon[]> {
  try {
    const url = CORS_PROXY + encodeURIComponent("https://mlh.io/seasons/2025/events");
    const res = await fetch(url);
    if (!res.ok) throw new Error("MLH fetch failed");
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const events = doc.querySelectorAll(".event");
    const hackathons: DiscoveredHackathon[] = [];

    events.forEach((el, i) => {
      if (i >= 8) return;
      const name = el.querySelector(".event-name, h3")?.textContent?.trim() || "";
      const date = el.querySelector(".event-date, .date")?.textContent?.trim() || "";
      const loc = el.querySelector(".event-location, .location")?.textContent?.trim() || "Online";
      const link = el.querySelector("a")?.getAttribute("href") || "";

      if (name) {
        hackathons.push({
          title: name,
          tagline: `MLH ${date} Hackathon`,
          date,
          location: loc,
          prize: "",
          status: "upcoming",
          tags: ["MLH", "Student"],
          link: link.startsWith("http") ? link : `https://mlh.io${link}`,
          gradient: GRADIENTS[(i + 2) % GRADIENTS.length],
          icon: ICONS[(i + 2) % ICONS.length],
        });
      }
    });

    return hackathons;
  } catch (e) {
    console.warn("[MLH] Failed:", e);
    return [];
  }
}

// --- UNSTOP ---
async function fetchUnstopHackathons(): Promise<DiscoveredHackathon[]> {
  try {
    const url = CORS_PROXY + encodeURIComponent("https://unstop.com/api/public/opportunity/search-new?opportunity=hackathons&per_page=10&oppstatus=open");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Unstop API failed");
    const data = await res.json();

    return (data.data?.data || []).slice(0, 8).map((h: any, i: number) => ({
      title: h.title || h.name || "Untitled",
      tagline: h.organisation?.name ? `by ${h.organisation.name}` : "",
      date: h.start_date || "",
      location: h.region || "India",
      prize: h.prizes?.[0]?.cash_value ? `₹${h.prizes[0].cash_value}` : "",
      status: "upcoming",
      tags: (h.filters?.map((f: any) => f.name) || []).slice(0, 5),
      link: `https://unstop.com/${h.public_url || ""}`,
      gradient: GRADIENTS[(i + 4) % GRADIENTS.length],
      icon: ICONS[(i + 4) % ICONS.length],
      participants: h.registerCount || 0,
    }));
  } catch (e) {
    console.warn("[Unstop] Failed:", e);
    return [];
  }
}

// --- CURATED FALLBACK ---
function getCuratedHackathons(): DiscoveredHackathon[] {
  // Organized by category for all branches
  return [
    // Engineering / CS
    {
      title: "Smart India Hackathon 2026",
      tagline: "India's largest open innovation platform",
      date: "2026-08-01",
      location: "India (Nationwide)",
      prize: "₹1,00,000",
      status: "upcoming",
      tags: ["Innovation", "Government", "All Branches"],
      link: "https://www.sih.gov.in/",
      gradient: "from-orange-500 to-amber-400",
      icon: "globe",
    },
    {
      title: "Google Summer of Code 2026",
      tagline: "Contribute to open source with Google mentorship",
      date: "2026-03-01",
      location: "Online",
      prize: "$1,500 – $6,600",
      status: "upcoming",
      tags: ["Open Source", "Coding", "CS"],
      link: "https://summerofcode.withgoogle.com/",
      gradient: "from-blue-500 to-cyan-400",
      icon: "code",
    },
    {
      title: "HackMIT 2026",
      tagline: "MIT's annual hackathon for students worldwide",
      date: "2026-09-15",
      location: "MIT, Cambridge MA",
      prize: "$10,000+",
      status: "upcoming",
      tags: ["University", "Innovation", "CS"],
      link: "https://hackmit.org/",
      gradient: "from-red-500 to-orange-400",
      icon: "rocket",
    },
    // Robotics / Engineering
    {
      title: "FIRST Robotics Competition",
      tagline: "Build and compete with real robots",
      date: "2026-01-01",
      location: "Global",
      prize: "Scholarships",
      status: "upcoming",
      tags: ["Robotics", "Engineering", "Hardware"],
      link: "https://www.firstinspires.org/robotics/frc",
      gradient: "from-green-500 to-emerald-400",
      icon: "cpu",
    },
    {
      title: "RoboMaster University Championship",
      tagline: "DJI's international robotics competition",
      date: "2026-05-01",
      location: "Global / Finals in China",
      prize: "$100,000+",
      status: "upcoming",
      tags: ["Robotics", "AI", "Engineering"],
      link: "https://www.robomaster.com/",
      gradient: "from-violet-500 to-indigo-400",
      icon: "zap",
    },
    // Medical / Science
    {
      title: "MIT Hacking Medicine 2026",
      tagline: "Health innovation hackathon by MIT",
      date: "2026-04-01",
      location: "Online / Cambridge MA",
      prize: "Mentorship + Incubation",
      status: "upcoming",
      tags: ["Medical", "HealthTech", "Innovation"],
      link: "https://hackingmedicine.mit.edu/",
      gradient: "from-pink-500 to-rose-400",
      icon: "star",
    },
    {
      title: "NASA Space Apps Challenge",
      tagline: "Solve challenges using NASA's open data",
      date: "2026-10-01",
      location: "Global (200+ cities)",
      prize: "NASA Recognition",
      status: "upcoming",
      tags: ["Science", "Space", "Data Science"],
      link: "https://www.spaceappschallenge.org/",
      gradient: "from-indigo-500 to-purple-400",
      icon: "globe",
    },
    // Commerce / Business
    {
      title: "Hult Prize 2026",
      tagline: "World's largest student competition for social enterprise",
      date: "2026-03-01",
      location: "Global",
      prize: "$1,000,000",
      status: "upcoming",
      tags: ["Commerce", "Business", "Social Impact"],
      link: "https://www.hultprize.org/",
      gradient: "from-teal-500 to-green-400",
      icon: "trophy",
    },
    // Design / Arts
    {
      title: "Adobe Creative Jam",
      tagline: "Design sprint competition by Adobe",
      date: "2026-06-01",
      location: "Online",
      prize: "Adobe CC License + $$",
      status: "upcoming",
      tags: ["Design", "UI/UX", "Creative"],
      link: "https://www.behance.net/galleries/adobe",
      gradient: "from-purple-500 to-pink-400",
      icon: "layers",
    },
    // General / Multi-branch
    {
      title: "MLH Global Hack Week",
      tagline: "Week-long hacking event for students",
      date: "2026-02-01",
      location: "Online",
      prize: "Swag + Prizes",
      status: "upcoming",
      tags: ["Student", "MLH", "All Branches"],
      link: "https://ghw.mlh.io/",
      gradient: "from-primary to-purple-400",
      icon: "rocket",
    },
  ];
}
