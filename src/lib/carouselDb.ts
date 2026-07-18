import { getSection, setSection } from "./contentDb";

export type CarouselMediaType = "image" | "video";

export interface CarouselSlide {
  id: string;
  media_type: CarouselMediaType;
  /** For image slides: the image. For video slides: an optional poster frame shown while the video loads. */
  image_url: string;
  /** For video slides: the MP4/WebM URL. Empty for image slides. */
  video_url: string;
  title: string;
  sort_order: number;
}

function parseSlides(value: string | undefined): CarouselSlide[] {
  try {
    const parsed = JSON.parse(value || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((slide, index) => {
      const videoUrl = String(slide.video_url || "");
      const rawType = String(slide.media_type || "");
      // Back-compat: older slides had no media_type. Treat them as images
      // unless they carry a video_url.
      const media_type: CarouselMediaType =
        rawType === "video" || (!rawType && videoUrl.trim()) ? "video" : "image";
      return {
        id: String(slide.id || crypto.randomUUID()),
        media_type,
        image_url: String(slide.image_url || ""),
        video_url: videoUrl,
        title: String(slide.title || ""),
        sort_order: Number(slide.sort_order ?? index * 10),
      };
    });
  } catch {
    return [];
  }
}

/** A slide is usable if the field its media type depends on is filled in. */
function hasMedia(slide: CarouselSlide): boolean {
  return slide.media_type === "video"
    ? slide.video_url.trim() !== ""
    : slide.image_url.trim() !== "";
}

export async function fetchCarouselSlides(): Promise<CarouselSlide[]> {
  const section = await getSection("carousel");
  return parseSlides(section.slides_json)
    .filter(hasMedia)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveCarouselSlides(slides: CarouselSlide[]): Promise<CarouselSlide[]> {
  await setSection("carousel", { slides_json: JSON.stringify(slides) });
  return slides;
}
