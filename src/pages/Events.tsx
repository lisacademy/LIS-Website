import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { MapPin, Clock, Users, ExternalLink } from "lucide-react";
import { fetchEvents, type EventItem } from "@/lib/eventsDb";
import { getEventGalleryPath } from "@/lib/eventGalleries";

type EventCategory = "all" | "lisacon" | "tech-vc" | "lectures" | "other";

const EVENT_CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lisacon", label: "LISACON Series" },
  { id: "tech-vc", label: "Tech VC Conclaves" },
  { id: "lectures", label: "Distinguished Lectures" },
  { id: "other", label: "Other Events" },
];

function eventKey(event: EventItem) {
  return event.id || event.title;
}

function getEventCategory(event: EventItem): Exclude<EventCategory, "all"> {
  const title = event.title.toLowerCase();
  const type = event.type.toLowerCase();

  if (title.includes("tech vc") || type.includes("tech vc")) return "tech-vc";
  if (title.includes("distinguished lecture") || type.includes("distinguished lecture") || type.includes("lecture series")) return "lectures";
  if (title.includes("lisacon") || title.includes("lis academy conference") || type.includes("conference")) return "lisacon";
  return "other";
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function parseEventDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDate = trimmed.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  const candidate = isoDate || trimmed;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getCountdown(targetDate: Date) {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return "Happening now";

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function CountdownBadge({ date }: { date: Date }) {
  const [label, setLabel] = useState(() => getCountdown(date));

  useEffect(() => {
    const interval = window.setInterval(() => setLabel(getCountdown(date)), 60_000);
    return () => window.clearInterval(interval);
  }, [date]);

  return (
    <span className="shrink-0 rounded-lg border border-[#c9a84c]/35 bg-[#c9a84c]/10 px-3 py-1.5 text-xs font-semibold text-[#f0d080]">
      {label}
    </span>
  );
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<EventCategory>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents().then((data) => {
      setEvents(data);
      if (data.length > 0) setSelectedEventId(data[0].id || data[0].title);
    }).catch(() => {
      setEvents([]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .map((event) => ({ event, date: parseEventDate(event.date) }))
      .filter((item): item is { event: EventItem; date: Date } => Boolean(item.date) && item.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") return events;
    return events.filter((event) => getEventCategory(event) === activeCategory);
  }, [activeCategory, events]);

  useEffect(() => {
    if (filteredEvents.length === 0) return;
    if (!selectedEventId || !filteredEvents.some((event) => eventKey(event) === selectedEventId)) {
      setSelectedEventId(eventKey(filteredEvents[0]));
    }
  }, [filteredEvents, selectedEventId]);

  return (
    <PageLayout>
      <PageHeader
        tag=""
        title={
          <>
            Events
            <span className="block mt-4 text-3xl md:text-4xl lg:text-5xl font-medium text-[#c9a84c]">
              Conferences, Seminars and Special Lectures
            </span>
          </>
        }
        description="This page now reflects LIS Academy's published conference history and recurring professional formats through admin-managed event entries."
      />

      <section className="section-padding" style={{ background: "#091529" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="mb-6">
              <span className="mb-3 block text-sm font-semibold uppercase tracking-widest text-[#c9a84c]">
                Upcoming
              </span>
              <h2 className="font-serif text-2xl font-bold text-white">Activity Calendar</h2>
              <p className="mt-2 text-sm text-white/45">
                Events are mapped by actual date and ordered by what is still to occur.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(({ event, date }) => (
                  <button
                    key={event.id || event.title}
                    onClick={() => setSelectedEventId(event.id || event.title)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-[#c9a84c]/35 hover:bg-white/10"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-xs font-medium" style={{ color: "#c9a84c" }}>{event.type}</span>
                        <h3 className="font-semibold text-white text-sm">{event.title}</h3>
                        <p className="text-xs text-white/40">{event.date} - {event.location}</p>
                      </div>
                      <CountdownBadge date={date} />
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-white/40 py-6 text-sm">No upcoming dated events are mapped yet. Conference history and recurring formats are listed below.</p>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding bg-[#0d1b3e]">
        <div className="max-w-7xl mx-auto space-y-8">
          <FadeIn>
            <div>
              <span className="text-sm font-semibold tracking-widest uppercase mb-3 block" style={{ color: "#c9a84c" }}>
                {EVENT_CATEGORIES.find((category) => category.id === activeCategory)?.label || "All Events"}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">Past Events</h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex flex-wrap gap-3" role="tablist" aria-label="Event categories">
              {EVENT_CATEGORIES.map((category) => {
                const active = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(category.id)}
                    className={`min-h-11 rounded-lg border px-4 text-sm font-semibold transition-all ${
                      active
                        ? "border-[#c9a84c] bg-[#c9a84c] text-[#0d1b3e]"
                        : "border-white/15 bg-white/5 text-white/75 hover:border-[#c9a84c]/55 hover:text-white"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </FadeIn>

          {loading ? (
            <div className="rounded-[42px] bg-[#f7f3f2] p-8 text-base text-slate-600">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="rounded-[42px] bg-[#f7f3f2] p-8 text-base text-slate-600">No events have been published yet. Use the admin portal to add them.</div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-[42px] bg-[#f7f3f2] p-8 text-base text-slate-600">No events found in this category yet.</div>
          ) : filteredEvents.map((event, i) => (
            <FadeIn key={event.id || event.title} delay={i * 0.05}>
              <div
                className="rounded-[42px] bg-[#f7f3f2] p-4 md:p-6 transition-all hover:scale-[1.01] cursor-pointer"
                onClick={() => setSelectedEventId(eventKey(event))}
              >
                <div className="grid gap-6 md:grid-cols-[1.15fr,1fr,300px] md:items-center">
                  <div className="overflow-hidden rounded-[56px] bg-white shadow-sm">
                    <img
                      src={event.image_url || "/logo.png"}
                      alt={event.title}
                      className="h-[220px] w-full object-cover md:h-[360px]"
                    />
                  </div>

                  <div className="text-center px-2 md:px-4">
                    <div className="text-[clamp(22px,2.8vw,46px)] font-medium uppercase tracking-wide text-[#c04a10]">{event.title}</div>
                    <div className="mt-4 text-[clamp(34px,4vw,64px)] leading-none uppercase text-[#1f66d1]">{event.type}</div>
                    <div className="mt-6 text-[clamp(20px,2.6vw,40px)] uppercase text-[#111827]">{event.date}</div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-slate-600 text-base md:text-lg">
                      <MapPin size={18} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 justify-center">
                    <EventLinkButton href={event.brochure_url || event.registration_url} label="Conference Brochure" />
                    <EventLinkButton href={getEventGalleryPath(event)} label="Photo Gallery" />
                    <EventLinkButton href={event.report_url} label="Conference Report" />
                  </div>
                </div>

                {selectedEventId === eventKey(event) && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 grid gap-8 rounded-[30px] bg-white px-6 py-6 md:grid-cols-2"
                  >
                    <div>
                      <h4 className="font-semibold text-[#0d1b3e] text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock size={14} /> Agenda
                      </h4>
                      <ul className="space-y-2">
                        {event.agenda.map((item, idx) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "rgba(201,168,76,0.18)", color: "#c9a84c" }}>{idx + 1}</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0d1b3e] text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={14} /> Speakers
                      </h4>
                      <ul className="space-y-2">
                        {event.speakers.map((speaker) => (
                          <li key={speaker} className="text-sm text-slate-600">- {speaker}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

function EventLinkButton({ href, label }: { href?: string; label: string }) {
  const baseClass = "inline-flex min-h-[88px] items-center justify-center rounded-full border border-[#222] bg-white px-8 text-center text-[20px] md:text-[22px] text-[#171717] transition-all";
  if (!href) {
    return <div className={`${baseClass} opacity-50`}>{label}</div>;
  }

  const isExternal = /^https?:\/\//.test(href);

  return (
    <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined} className={`${baseClass} hover:-translate-y-0.5`}>
      <span className="inline-flex items-center gap-2">{label} <ExternalLink size={18} /></span>
    </a>
  );
}
