import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ExternalLink, Image as ImageIcon, MapPin, Users } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { fetchEvents, type EventItem } from "@/lib/eventsDb";
import {
  eventGalleries,
  getEventGalleryImages,
  getEventGalleryLabel,
  getEventGalleryPath,
  getEventGallerySlug,
  getEventGallerySourceUrl,
  getGalleryBySlug,
  slugifyEventTitle,
} from "@/lib/eventGalleries";

export default function EventGallery() {
  const { slug, eventSlug } = useParams();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const group = getGalleryBySlug(slug) || eventGalleries[0];
  const groupEvents = useMemo(
    () => events.filter((event) => getEventGallerySlug(event) === group.slug),
    [events, group.slug],
  );

  const selectedEvent = useMemo(() => {
    if (groupEvents.length === 0) return null;
    if (!eventSlug) return groupEvents[0];
    return groupEvents.find((event) => slugifyEventTitle(event.title) === eventSlug) || groupEvents[0];
  }, [eventSlug, groupEvents]);

  const images = selectedEvent ? getEventGalleryImages(selectedEvent) : group.images;
  const sourceUrl = selectedEvent ? getEventGallerySourceUrl(selectedEvent) : group.sourceUrl;
  const title = selectedEvent ? getEventGalleryLabel(selectedEvent) : group.title;

  return (
    <PageLayout>
      <PageHeader
        tag="Photo Gallery"
        title={title}
        description={
          selectedEvent
            ? `${selectedEvent.date} - ${selectedEvent.location}`
            : `${group.images.length} images extracted from the published LISACON event pages.`
        }
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/events"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-all hover:border-[#c9a84c]/50 hover:bg-white/15"
          >
            <ArrowLeft size={16} />
            Events
          </Link>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-4 text-sm font-semibold text-[#f2d982] transition-all hover:bg-[#c9a84c]/20"
          >
            Source
            <ExternalLink size={16} />
          </a>
        </div>
      </PageHeader>

      <section className="section-padding bg-[#091529]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-wrap gap-3">
            {eventGalleries.map((item) => {
              const firstEvent = events.find((event) => getEventGallerySlug(event) === item.slug);
              const active = item.slug === group.slug;
              return (
                <Link
                  key={item.slug}
                  to={firstEvent ? getEventGalleryPath(firstEvent) : `/events/gallery/${item.slug}`}
                  className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-semibold transition-all ${
                    active
                      ? "border-[#c9a84c] bg-[#c9a84c] text-[#0d1b3e]"
                      : "border-white/15 bg-white/5 text-white/75 hover:border-[#c9a84c]/55 hover:text-white"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          {groupEvents.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#c9a84c]">
                {group.title} Submenu
              </div>
              <div className="flex flex-wrap gap-2">
                {groupEvents.map((event) => {
                  const active = selectedEvent?.title === event.title;
                  return (
                    <Link
                      key={event.id || event.title}
                      to={getEventGalleryPath(event)}
                      className={`inline-flex min-h-10 items-center rounded-md border px-3 text-xs font-semibold transition-all ${
                        active
                          ? "border-white bg-white text-[#0d1b3e]"
                          : "border-white/10 bg-[#0d1b3e] text-white/70 hover:border-white/35 hover:text-white"
                      }`}
                    >
                      {getEventGalleryLabel(event)}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-lg bg-white p-8 text-slate-600">Loading gallery...</div>
          ) : selectedEvent ? (
            <EventText event={selectedEvent} imageCount={images.length} />
          ) : (
            <div className="rounded-lg bg-white p-8 text-slate-600">No event details found for this gallery yet.</div>
          )}

          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-[#c9a84c]">Photos</span>
                <h2 className="mt-2 font-serif text-3xl font-bold text-white">Event Gallery</h2>
              </div>
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70">
                {images.length} images
              </span>
            </div>

            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {images.map((image, index) => (
                <a
                  key={image}
                  href={image}
                  target="_blank"
                  rel="noreferrer"
                  className="group mb-5 block break-inside-avoid overflow-hidden rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="relative">
                    <img
                      src={image}
                      alt={`${title} image ${index + 1}`}
                      loading="lazy"
                      className="w-full bg-[#0d1b3e] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute left-3 top-3 inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-black/55 px-2 text-xs font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <ImageIcon size={16} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function EventText({ event, imageCount }: { event: EventItem; imageCount: number }) {
  return (
    <div className="grid gap-5 rounded-lg bg-[#f7f3f2] p-5 md:grid-cols-[1.1fr,0.9fr] md:p-7">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#c04a10]">{event.type}</span>
        <h2 className="mt-2 font-serif text-3xl font-bold text-[#0d1b3e]">{getEventGalleryLabel(event)}</h2>
        <p className="mt-4 text-base leading-7 text-slate-700">{event.description}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <CalendarDays size={16} />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <MapPin size={16} />
            {event.location}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2">
            <ImageIcon size={16} />
            {imageCount} photos
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#0d1b3e]">
            <Users size={15} />
            Speakers / Organizers
          </h3>
          <ul className="space-y-2">
            {event.speakers.map((speaker) => (
              <li key={speaker} className="text-sm text-slate-600">- {speaker}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-white p-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#0d1b3e]">Agenda</h3>
          <ul className="space-y-2">
            {event.agenda.map((item, index) => (
              <li key={item} className="flex gap-2 text-sm text-slate-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#c9a84c]/20 text-[10px] font-bold text-[#9a7625]">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
