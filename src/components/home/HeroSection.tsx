import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { fetchEvents } from "@/lib/eventsDb";
import { fetchCarouselSlides } from "@/lib/carouselDb";
import { ChevronLeft, ChevronRight } from "lucide-react";

type HeroMedia = { type: "image" | "video"; src: string; poster?: string };

const defaultEventImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop",
];

const defaultMedia: HeroMedia[] = defaultEventImages.map((src) => ({ type: "image", src }));

// Image slides hold for this long before advancing; video slides advance when they end.
const IMAGE_DURATION_MS = 5000;

export default function HeroSection() {
  const [media, setMedia] = useState<HeroMedia[]>(defaultMedia);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Callback ref: only track the mounted (entering) video. Ignoring the null
  // call means an exiting slide unmounting during a crossfade won't clobber the
  // reference to the video that's now active.
  const setVideoRef = (node: HTMLVideoElement | null) => {
    if (node) videoRef.current = node;
  };

  useEffect(() => {
    fetchCarouselSlides().then((slides) => {
      if (slides.length > 0) {
        setMedia(
          slides.map((slide) =>
            slide.media_type === "video"
              ? { type: "video", src: slide.video_url, poster: slide.image_url || undefined }
              : { type: "image", src: slide.image_url },
          ),
        );
        return;
      }

      return fetchEvents().then((events) => {
        const images = events
          .map((event) => event.image_url)
          .filter((url): url is string => Boolean(url));
        if (images.length > 0) {
          const finalImages = [...images].slice(0, 5);
          while (finalImages.length < 5) {
            finalImages.push(defaultEventImages[finalImages.length % defaultEventImages.length]);
          }
          setMedia(finalImages.map((src) => ({ type: "image", src })));
        }
      });
    }).catch(console.error);
  }, []);

  // Keep the index in range if the media list changes length.
  useEffect(() => {
    setCurrentIndex((prev) => (prev >= media.length ? 0 : prev));
  }, [media.length]);

  const navigate = (delta: number) => {
    setCurrentIndex(
      (prev) => (prev + delta + media.length) % media.length,
    );
  };

  const current = media[currentIndex];
  const single = media.length === 1;

  // Auto-advance for image slides only; videos advance via their onEnded handler.
  useEffect(() => {
    if (paused || !current || current.type !== "image") return;
    const timeout = setTimeout(() => navigate(1), IMAGE_DURATION_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, paused, current, media.length]);

  // Pause/resume the active video when the visitor hovers the hero.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || current?.type !== "video") return;
    if (paused) video.pause();
    else void video.play().catch(() => {});
  }, [paused, current]);

  return (
    <section
      className="relative flex h-[58vw] min-h-[210px] max-h-[360px] items-center justify-center overflow-hidden bg-[#0d1b3e] md:h-auto md:min-h-[calc(100vh-108px)] md:max-h-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Media crossfade layer — new slide fades in over the old (no gap),
          and images slowly zoom/pan so the carousel reads like moving footage. */}
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0 }}
        >
          {current?.type === "video" ? (
            <video
              ref={setVideoRef}
              src={current.src}
              poster={current.poster}
              autoPlay
              muted
              playsInline
              preload="auto"
              loop={single}
              onEnded={() => {
                if (!single) navigate(1);
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.img
              src={current?.src}
              alt={`Slide ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1.18 }}
              transition={{ duration: (IMAGE_DURATION_MS + 1600) / 1000, ease: "linear" }}
              // Alternate the anchor so the slow zoom appears to pan toward a
              // different corner each slide, adding to the live-camera feel.
              style={{ transformOrigin: currentIndex % 2 === 0 ? "50% 50%" : "20% 30%" }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,14,36,0.3) 0%, rgba(5,14,36,0.6) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Left arrow */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 md:left-5 md:h-12 md:w-12"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} className="text-white" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => navigate(1)}
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 md:right-5 md:h-12 md:w-12"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
        aria-label="Next slide"
      >
        <ChevronRight size={22} className="text-white" />
      </button>

      {/* Slide dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-10">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 32 : 8,
              height: 8,
              background:
                i === currentIndex
                  ? "linear-gradient(90deg, #c9a84c, #f0d080)"
                  : "rgba(255,255,255,0.3)",
              boxShadow:
                i === currentIndex ? "0 0 8px rgba(201,168,76,0.6)" : "none",
            }}
          />
        ))}
      </div>

      {/* Progress bar (image slides only — video slides advance on their own end) */}
      {!paused && current?.type === "image" && (
        <motion.div
          key={`progress-${currentIndex}`}
          className="absolute bottom-0 left-0 h-[3px] z-20"
          style={{ background: "linear-gradient(90deg, #c9a84c, #f0d080)" }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: IMAGE_DURATION_MS / 1000, ease: "linear" }}
        />
      )}

      {/* Pause indicator */}
      {paused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-xs text-white/40 tracking-widest uppercase"
        >
          ⏸ paused
        </motion.div>
      )}
    </section>
  );
}
