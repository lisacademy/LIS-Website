import { apiRequest, getAdminToken } from "./api";

export type ContentSection =
  | "hero"
  | "about"
  | "contact"
  | "social"
  | "topbar"
  | "donate"
  | "programs"
  | "research"
  | "products"
  | "marquee"
  | "blog"
  | "carousel"
  | "governance";

export interface ContentItem {
  section: ContentSection;
  key: string;
  value: string;
  updated_at?: string;
}

const defaults: ContentItem[] = [
  { section: "marquee", key: "text", value: "ðŸ“… Upcoming: National LIS Conference 2026 â€” Registration Open Now! &nbsp;&nbsp;|&nbsp;&nbsp; ðŸŽ“ Workshop on Digital Library Management â€” June 15, Bengaluru &nbsp;&nbsp;|&nbsp;&nbsp; ðŸ“¢ New Batch of LIS Certification Program Starting July 2026 â€” Enroll Today!" },
  { section: "marquee", key: "enabled", value: "true" },
  { section: "blog", key: "posts_json", value: "[]" },
  { section: "carousel", key: "slides_json", value: "[]" },
  { section: "hero", key: "headline", value: "Learn. Inspire. Serve." },
  { section: "hero", key: "subtitle", value: "A professional Public Charitable Trust advancing the Library & Information Science profession through world-class training, technology implementation, and research across India." },
  { section: "about", key: "description", value: "LIS Academy is India's Premier Library & Information Science Platform." },
  { section: "contact", key: "email", value: "lisacademyorg@gmail.com" },
  { section: "contact", key: "phone", value: "+91 9449679737" },
  { section: "contact", key: "address", value: "7/29, Vijayalakshmi Complex, 1st Main Road, Gokul, Bengaluru - 560054" },
  { section: "social", key: "facebook", value: "https://facebook.com/lisacademy" },
  { section: "social", key: "twitter", value: "https://twitter.com/lisacademy" },
  { section: "social", key: "linkedin", value: "https://linkedin.com/company/lisacademy" },
  { section: "social", key: "youtube", value: "https://youtube.com/@lisacademy" },
  { section: "social", key: "instagram", value: "https://instagram.com/lisacademy" },
  { section: "topbar", key: "tagline", value: "LEARN | INSPIRE | SERVE" },
  { section: "donate", key: "headline", value: "Support LIS Academy" },
  { section: "donate", key: "intro", value: "Your contribution helps LIS Academy expand professional development, research, and community initiatives for library and information science." },
  { section: "donate", key: "note", value: "Contributions are accepted in multiples of Rs. 100. Please choose an amount and continue to the payment gateway." },
];

const cache = new Map<string, Record<string, string>>();

function adminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toSection(items: ContentItem[], section: ContentSection): Record<string, string> {
  const merged = defaults
    .filter((item) => item.section === section)
    .reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

  items
    .filter((item) => item.section === section)
    .forEach((item) => {
      merged[item.key] = item.value;
    });

  return merged;
}

export function getDefaultSection(section: ContentSection): Record<string, string> {
  return toSection(defaults, section);
}

export async function getSection(section: ContentSection): Promise<Record<string, string>> {
  try {
    const response = await apiRequest<{ content: ContentItem[] }>(`/api/content?section=${encodeURIComponent(section)}`);
    const data = toSection(response.content, section);
    cache.set(section, data);
    return data;
  } catch {
    return cache.get(section) || getDefaultSection(section);
  }
}

export async function setSection(section: ContentSection, data: Record<string, string>): Promise<Record<string, string>> {
  const response = await apiRequest<{ content: ContentItem[] }>(`/api/admin/content/${section}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify({ data }),
  });
  const saved = toSection(response.content, section);
  cache.set(section, saved);
  return saved;
}

export async function getContent(section: ContentSection, key: string): Promise<string> {
  const data = await getSection(section);
  return data[key] || "";
}


