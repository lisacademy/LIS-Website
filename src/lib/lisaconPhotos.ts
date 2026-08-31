import type { EventItem } from "./eventsDb";

/**
 * Photographs from the LISACON conference archive, optimised for the web and
 * served from `public/events/`. Each entry carries a wide rendition (1600px,
 * used by the hero carousel and the gallery grid) and a thumbnail (480px, used
 * by the strip on the events listing).
 */
export interface LisaconPhoto {
  src: string;
  thumb: string;
  caption: string;
}

export interface LisaconEdition {
  /** 1 for the 1st LISACON, 2 for the 2nd, and so on. */
  edition: number;
  label: string;
  photos: LisaconPhoto[];
}

function edition(
  slug: string,
  entries: Array<[name: string, caption: string]>,
): LisaconPhoto[] {
  return entries.map(([name, caption]) => ({
    src: `/events/${slug}/${name}.jpg`,
    thumb: `/events/${slug}/thumbs/${name}.jpg`,
    caption,
  }));
}

export const lisaconEditions: LisaconEdition[] = [
  {
    edition: 1,
    label: "1st LIS Academy Conference, Bengaluru (2017)",
    photos: edition("lisacon-1", [
      ["01-lamp-lighting", "Inaugural lamp lighting by the dignitaries"],
      ["02-dais", "Dignitaries on the dais at the inaugural session"],
      ["03-entrance-procession", "Traditional welcome procession at the venue entrance"],
      ["04-stage", "Conference stage at Mahadeva Desai Auditorium, Gandhi Bhavan"],
      ["05-delegates", "Delegates at a technical session"],
      ["06-keynote", "Keynote address in progress"],
    ]),
  },
  {
    edition: 2,
    label: "2nd LIS Academy National Conference, Belagavi (2019)",
    photos: edition("lisacon-2", [
      ["01-book-release", "Release of the conference proceedings"],
      ["02-group-photo", "Official group photograph of the delegates"],
      ["03-lamp-lighting", "Inaugural lamp lighting"],
      ["04-felicitation", "Felicitation of a senior LIS professional"],
      ["05-delegates", "Delegates in the conference hall"],
    ]),
  },
  {
    edition: 3,
    // The 3rd edition was held online, so the archive holds the programme
    // artwork rather than photographs.
    label: "3rd LISACON National Virtual Conference (2020)",
    photos: edition("lisacon-3", [
      ["01-inaugural-programme", "Inaugural and valedictory function programme"],
      ["02-theme-1-digital-age", "Theme 1 - Reinventing Library Services in the Digital Age"],
      ["03-theme-2-collection-development", "Theme 2 - New Paradigms in Collection Development"],
      ["04-theme-3-library-technologies", "Theme 3 - Leveraging Library Technologies"],
      ["05-theme-4-data-metrics-ranking", "Theme 4 - Data, Metrics, and Ranking: Role of Librarians"],
      ["06-theme-5-research-ethics", "Theme 5 - Role of Libraries in Inculcating Research Ethics"],
      ["07-theme-6-library-diplomacy", "Theme 6 - Library Diplomacy"],
    ]),
  },
  {
    edition: 4,
    label: "4th LIS Academy Conference on Open Scholarship and Libraries",
    photos: edition("lisacon-4", [
      ["01-lamp-lighting", "Inaugural lamp lighting"],
      ["02-inauguration", "Inauguration and book release"],
      ["03-dais", "Dignitaries on the dais"],
      ["04-address", "Address to the delegates"],
      ["05-conference-poster", "Conference poster - Open Scholarship and Libraries"],
      // Artwork from the 3rd edition, placed here at the Academy's request.
      // The caption stays accurate to what the poster itself shows.
      ["06-lisacon-2020-poster", "LISACON 2020 conference poster - Reinventing Excellence in Librarianship"],
    ]),
  },
];

const editionsByNumber = new Map(lisaconEditions.map((item) => [item.edition, item]));

/**
 * Reads the edition number off an event title such as "3rd LISACON" or
 * "2nd LIS Academy Conference on Innovations in Libraries". Returns null for
 * events that are not part of the conference series.
 */
export function getLisaconEdition(event: EventItem): LisaconEdition | null {
  const title = event.title.toLowerCase();
  if (!title.includes("lisacon") && !title.includes("lis academy conference")) return null;

  const ordinal = title.match(/^(\d+)(?:st|nd|rd|th)\b/);
  if (!ordinal) return null;

  return editionsByNumber.get(Number(ordinal[1])) ?? null;
}

export function getLisaconPhotos(event: EventItem): LisaconPhoto[] {
  return getLisaconEdition(event)?.photos ?? [];
}

/** Every archive photograph, ordered by edition. */
export const allLisaconPhotos: LisaconPhoto[] = lisaconEditions.flatMap((item) => item.photos);

/**
 * The wide, uncluttered shots that read well behind the hero carousel's slow
 * zoom. The poster artwork is deliberately left out -- it is dense text that
 * turns illegible once cropped and scaled.
 */
export const lisaconHeroPhotos: string[] = [
  "/events/lisacon-2/01-book-release.jpg",
  "/events/lisacon-1/01-lamp-lighting.jpg",
  "/events/lisacon-4/01-lamp-lighting.jpg",
  "/events/lisacon-1/03-entrance-procession.jpg",
  "/events/lisacon-2/02-group-photo.jpg",
];
