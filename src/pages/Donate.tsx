import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Heart } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { getSection } from "@/lib/contentDb";

const defaultDonateContent = {
  headline: "Support LIS Academy ?",
  intro:
    "Your contribution helps LIS Academy expand professional development, research, and community initiatives for library and information science.",
  note: "Contributions are accepted in multiples of Rs. 500. Please choose an amount and continue to the payment gateway.",
};

const donationSupportDetails = [
  'Supporting LIS Academy through donations helps strengthen the Library and Information Science profession by supporting skill development, research, technology training, scholarships, conferences, publications, and community outreach initiatives for LIS professionals and students across India. Your contribution helps promote continuous learning, digital inclusion, and professional empowerment in line with the Academy\'s mission of "Learn | Inspire | Serve."',
  "LIS Academy is recognized for CSR activities (CSR Registration No. CSR00108081), enjoys tax benefits under Sections 12AA and 80G of the Income Tax Act, is registered under NGO Darpan, and holds FCRA Registration No. 094421841, enabling it to receive foreign contributions legally and transparently.",
];

const donationAmounts = [500, 1000, 2500, 5000];
const paymentUrlTemplate = String(import.meta.env.VITE_DONATION_PAYMENT_URL_TEMPLATE || "").trim();

function buildDonationPaymentUrl(amount: number) {
  if (!paymentUrlTemplate || paymentUrlTemplate.includes("example.com")) {
    return "";
  }

  const encodedAmount = encodeURIComponent(String(amount));
  return paymentUrlTemplate.includes("{amount}")
    ? paymentUrlTemplate.replaceAll("{amount}", encodedAmount)
    : paymentUrlTemplate;
}

export default function Donate() {
  const [content, setContent] = useState(defaultDonateContent);
  const [amount, setAmount] = useState(500);
  const paymentUrl = useMemo(() => buildDonationPaymentUrl(amount), [amount]);

  useEffect(() => {
    getSection("donate").then((data) => {
      setContent({
        headline: data.headline || defaultDonateContent.headline,
        intro: data.intro || defaultDonateContent.intro,
        note: data.note || defaultDonateContent.note,
      });
    });
  }, []);

  return (
    <PageLayout>
      <PageHeader
        tag=""
        title={
          <>
            Donate Us
            <span className="block mt-4 text-3xl md:text-4xl lg:text-5xl font-medium text-[#c9a84c]">
              {content.headline}
            </span>
          </>
        }
        description="Contribute to LIS Academy initiatives through the donation gateway."
      />

      <section className="section-padding bg-[#0d1b3e]">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c]/15 px-4 py-2 text-sm font-semibold text-[#f0d080]">
                <Heart size={16} /> Support the mission
              </div>
              <h2 className="mt-6 font-serif text-3xl text-white">
                {content.headline}
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                {content.intro}
              </p>
              <div className="mt-5 space-y-4 text-base leading-8 text-white/70">
                {donationSupportDetails.map((detail) => (
                  <p key={detail}>{detail}</p>
                ))}
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-[#091529] p-6 text-white/70">
                <p>{content.note}</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#0d1b3e] p-8">
              <div className="mb-8">
                <h2 className="font-serif text-2xl text-white">Choose Amount</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Select a contribution amount and continue to the payment gateway.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {donationAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(value)}
                      className="rounded-2xl border px-4 py-3 text-sm font-semibold transition-all"
                      style={{
                        borderColor: amount === value ? "#c9a84c" : "rgba(255,255,255,0.12)",
                        background: amount === value ? "rgba(201,168,76,0.16)" : "rgba(255,255,255,0.05)",
                        color: amount === value ? "#f0d080" : "rgba(255,255,255,0.72)",
                      }}
                    >
                      Rs. {value.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                {paymentUrl ? (
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-[#0d1b3e] transition-all hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)" }}
                  >
                    Pay Online <ExternalLink size={15} />
                  </a>
                ) : (
                  <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100/80">
                    Online payment link is not configured yet. Please scan the QR code or update the Instamojo payment URL in the environment settings.
                  </div>
                )}
              </div>
              <img
                src="/upi-qr.png"
                alt="LIS Academy UPI QR Code"
                className="w-full max-w-sm h-auto object-contain rounded-2xl bg-white"
              />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
