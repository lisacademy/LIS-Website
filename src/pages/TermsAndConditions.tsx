import PageHeader from "@/components/PageHeader";
import PageLayout from "@/components/PageLayout";

const termsSections = [
  {
    title: "Use of the Website",
    body: [
      "This website is provided for information about LIS Academy, its programs, events, membership, donations, publications, and related services.",
      "You agree to use the website only for lawful purposes and in a manner that does not interfere with the security, availability, or normal operation of the website.",
    ],
  },
  {
    title: "Programs, Events, and Services",
    body: [
      "Program schedules, event details, resource availability, fees, and eligibility requirements may be updated from time to time.",
      "Registration or payment for any program, event, membership, or service is subject to confirmation by LIS Academy and any additional terms shared for that specific offering.",
    ],
  },
  {
    title: "Payments and Donations",
    body: [
      "Payments made through the website or linked payment channels must be completed with accurate payer and contact information.",
      "Donations and contributions are accepted for the charitable and professional objectives of LIS Academy. Receipts or confirmations may be issued based on the details submitted during payment.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "Website content, logos, text, images, documents, program materials, and other resources are owned by LIS Academy or used with permission unless otherwise stated.",
      "You may not copy, reproduce, distribute, modify, or commercially use website materials without prior written permission from LIS Academy.",
    ],
  },
  {
    title: "User Submissions",
    body: [
      "When you submit forms, registrations, messages, documents, or other information, you are responsible for ensuring that the information is accurate and does not violate any third-party rights.",
      "LIS Academy may contact you using the submitted information for administrative, program, membership, donation, or service-related communication.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "LIS Academy makes reasonable efforts to keep website information accurate and current, but does not guarantee that all content will always be complete, error-free, or uninterrupted.",
      "To the fullest extent permitted by law, LIS Academy is not liable for indirect, incidental, or consequential losses arising from website use, service interruption, or reliance on website content.",
    ],
  },
  {
    title: "Changes to These Terms",
    body: [
      "LIS Academy may update these terms when required for operational, legal, or service-related reasons.",
      "Continued use of the website after updates means you accept the revised terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about these terms, contact LIS Academy at lisacademyorg@gmail.com or +91 9449679737.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <PageLayout>
      <PageHeader
        tag="Legal"
        title="Terms and Conditions"
        description="Please review these terms before using the LIS Academy website, registering for programs, or making payments."
      />

      <section className="section-padding bg-[#0d1b3e]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 rounded-lg border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-[#c9a84c]">Last updated: June 7, 2026</p>
            <p className="mt-3 text-white/60 leading-relaxed">
              These terms apply to your access to and use of the LIS Academy website and related online services. By using this website, you agree to the terms below.
            </p>
          </div>

          <div className="space-y-6">
            {termsSections.map((section) => (
              <article key={section.title} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="font-serif text-2xl font-semibold text-white">{section.title}</h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-white/60 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
