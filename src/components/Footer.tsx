import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  Academy: [
    { name: "About Us", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Research", path: "/research" },
    { name: "Events", path: "/events" },
  ],
  Resources: [
    { name: "Products", path: "/library-automation" },
    { name: "Community", path: "/community" },
    { name: "Knowledge Hub", path: "/knowledge" },
    { name: "Publications", path: "/research" },
  ],
  Legal: [
    { name: "Terms and Conditions", path: "/terms-and-conditions" },
    { name: "Refund and Cancellation Policy", path: "/refund-and-cancellation-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="LIS Academy Logo" className="h-10 w-auto object-contain" />
              <span className="font-serif font-bold text-xl">LIS Academy</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              A professional Public Charitable Trust advancing the Library and Information Science profession through technology, training, and research support.
            </p>
          </div>

          {/* Academy + Resources */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-serif text-lg mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Get in Touch */}
          <div>
            <h4 className="font-serif text-lg mb-4">Get in Touch</h4>
            <div className="space-y-4 text-sm text-primary-foreground/70">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#c9a84c]" />
                <span className="leading-relaxed">7/29, Vijayalakshmi Complex, 1st Main Road, 1st Phase, 2nd Stage, Gokul, Bengaluru - 560054</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="shrink-0 text-[#c9a84c]" />
                <a href="mailto:lisacademyorg@gmail.com" className="hover:text-primary-foreground transition-colors">lisacademyorg@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={15} className="shrink-0 text-[#c9a84c]" />
                <a href="tel:+919449679737" className="hover:text-primary-foreground transition-colors">+91 9449679737</a>
              </div>
              <div className="pt-2">
                <Link
                  to="/membership"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}
                >
                  Become a Member
                </Link>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">© {new Date().getFullYear()} LIS Academy. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/terms-and-conditions" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
              Terms and Conditions
            </Link>
            <Link to="/refund-and-cancellation-policy" className="text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
              Refund and Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

