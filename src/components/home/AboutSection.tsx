import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, Lightbulb } from "lucide-react";

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Eye,
      title: "Vision",
      text: "To contribute to the essential knowledge, skills, and values of librarianship and the information professions through innovative and cutting-edge technology.",
      hexColor: "#c0392b",
      hoverTextClass: "group-hover:text-[#c0392b]",
    },
    {
      icon: Target,
      title: "Mission",
      text: "To spread the multi-dimensional utility and overall growth of librarianship through education, literature, research, publications, outsourcing, training programs, consultation, and collaboration.",
      hexColor: "#e67e22",
      hoverTextClass: "group-hover:text-[#e67e22]",
    },
    {
      icon: Lightbulb,
      title: "Purpose",
      text: "To provide need-based services to libraries and support LIS professionals through continuous skill development and technological innovation.",
      hexColor: "#27ae60",
      hoverTextClass: "group-hover:text-[#27ae60]",
    },
  ];

  const taglineCards = [
    {
      icon: Lightbulb,
      title: "Learn",
      accent: "#c0392b",
      kicker: "Knowledge",
      text: "Represents the continuous pursuit of knowledge, skills, innovation, and professional excellence. It emphasizes lifelong learning, research, training, and capacity building for library and information professionals.",
    },
    {
      icon: Eye,
      title: "Inspire",
      accent: "#e67e22",
      kicker: "Leadership",
      text: "Signifies motivating individuals and institutions through visionary leadership, creativity, ethical practices, and the sharing of ideas that advance the profession and empower communities.",
    },
    {
      icon: Target,
      title: "Serve",
      accent: "#27ae60",
      kicker: "Impact",
      text: "Highlights commitment to society through meaningful information services, community engagement, knowledge dissemination, and the promotion of equitable access to information for all.",
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            About LIS Academy
          </h2>
          <h3 className="text-2xl md:text-3xl font-medium text-secondary max-w-4xl mx-auto">
            A Professional Platform for Libraries, Librarians, and Research
            Communities
          </h3>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="text-muted-foreground text-lg leading-relaxed space-y-4">
              <p>
                LIS Academy, Bangalore, is a non-governmental organization
                established as a Charitable Trust under Section 4 of the Indian
                Trusts Act, 1882. Guided by its tagline “Learn Inspire Serve,”
                the Academy is committed to evolving into a leading, vibrant,
                and dynamic professional body in the field of Library and
                Information Science.
              </p>
              <p>
                The Academy strives to empower professionals by equipping them
                with essential knowledge, advanced skills, and strong
                professional values in librarianship. It actively promotes the
                use of innovative, cutting-edge technologies and encourages the
                adoption of best practices, ethical standards, and progressive
                ideas within the profession.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                className="flex gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                <div
                  className="absolute top-0 left-0 w-full h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
                  style={{ backgroundColor: item.hexColor }}
                ></div>
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <item.icon
                    className={`transition-colors duration-300 ${item.hoverTextClass} text-primary`}
                    size={22}
                  />
                </div>
                <div>
                  <h3
                    className={`font-serif text-lg font-semibold text-foreground mb-1 transition-colors duration-300 ${item.hoverTextClass}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Recognitions & Registrations ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-16"
        >
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-3 text-center leading-tight">
            CSR \ NGO
          </h2>
          <h3
            className="text-2xl md:text-3xl font-extrabold mb-6 text-center uppercase tracking-widest"
            style={{ color: "#c9a84c", letterSpacing: "0.08em" }}
          >
            Recognitions &amp; Registrations
          </h3>
          <div
            className="w-full rounded-2xl px-8 md:px-14 py-10"
            style={{
              background: "#ffffff",
              border: "1.5px solid #e8e0d0",
              boxShadow: "0 4px 32px 0 rgba(13,27,62,0.07)",
            }}
          >
            <p className="text-base md:text-lg leading-relaxed mb-5 text-muted-foreground">
              LIS Academy is duly recognized for undertaking{" "}
              <strong className="text-foreground">
                Corporate Social Responsibility (CSR)
              </strong>{" "}
              activities, holding Registration No.{" "}
              <strong className="text-foreground">CSR00108081</strong>. It has
              been granted tax benifits under{" "}
              <strong className="text-foreground">
                Section 12AA and 80G of the Income Tax Act, 1961
              </strong>
              , and is registered under{" "}
              <strong className="text-foreground">NGO Darpan</strong> with the
              Government of India.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              Further, the Academy holds{" "}
              <strong className="text-foreground">
                FCRA Registration No. 094421841
              </strong>
              , issued by the Ministry of Home Affairs, Government of India, New
              Delhi, enabling it to receive financial assistance and
              contributions from foreign sources in compliance with applicable
              regulations.
            </p>
          </div>
        </motion.div>

        {/* New Tagline Explanation Section */}
        <motion.div
          id="tagline-section"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-24 border-t border-border pt-16 scroll-mt-24"
        >
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              LISA TAGLINE
            </h2>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">
              <span style={{ color: "#c0392b" }}>Learn</span>
              <span className="text-muted-foreground mx-3 md:mx-4 font-light">
                |
              </span>
              <span style={{ color: "#e67e22" }}>Inspire</span>
              <span className="text-muted-foreground mx-3 md:mx-4 font-light">
                |
              </span>
              <span style={{ color: "#27ae60" }}>Serve</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The tagline “Learn | Inspire | Serve” of LIS Academy reflects the
              core philosophy and mission of professional growth, leadership,
              and social responsibility in the field of Library and Information
              Science.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {taglineCards.map((card) => (
              <div
                key={card.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-white p-8 text-center shadow-[0_10px_30px_rgba(13,27,62,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(13,27,62,0.14)]"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: card.accent }}
                ></div>
                <div
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-125"
                  style={{ backgroundColor: card.accent }}
                ></div>
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
                  <card.icon
                    size={28}
                    className="transition-transform duration-300 group-hover:scale-110"
                    style={{ color: card.accent }}
                  />
                </div>
                <p
                  className="mb-3 text-xs font-bold uppercase tracking-[0.22em]"
                  style={{ color: card.accent }}
                >
                  {card.kicker}
                </p>
                <h3
                  className="font-serif text-3xl font-bold transition-colors duration-300"
                  style={{ color: card.accent }}
                >
                  {card.title}
                </h3>
                <div
                  className="mx-auto my-5 h-0.5 w-14 rounded-full transition-all duration-300 group-hover:w-24"
                  style={{ backgroundColor: card.accent }}
                ></div>
                <p className="text-base text-muted-foreground leading-7">
                  {card.text}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center max-w-4xl mx-auto bg-accent/30 p-8 rounded-2xl border border-border/50 shadow-inner">
            <p className="text-foreground font-medium text-lg italic leading-relaxed">
              Together, the tagline conveys the journey of a professional: to
              acquire knowledge, inspire others through wisdom and leadership,
              and ultimately serve society with dedication and integrity.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
