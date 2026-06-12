import { useEffect, useState } from "react";
import { Heart, Loader2, ReceiptText } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSection } from "@/lib/contentDb";
import { apiRequest } from "@/lib/api";

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

const initialDonationForm = {
  name: "",
  designation: "",
  email: "",
  phone: "",
  amount: "",
  transactionId: "",
};

export default function Donate() {
  const [content, setContent] = useState(defaultDonateContent);
  const [form, setForm] = useState(initialDonationForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    getSection("donate").then((data) => {
      setContent({
        headline: data.headline || defaultDonateContent.headline,
        intro: data.intro || defaultDonateContent.intro,
        note: data.note || defaultDonateContent.note,
      });
    });
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await apiRequest<{ saved: boolean }>("/api/donations", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmitMessage("Thank you. Your payment details have been submitted to LIS Academy.");
      setForm(initialDonationForm);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit donation details.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

            <div className="rounded-[32px] border border-white/10 bg-[#0d1b3e] p-8 flex flex-col items-center justify-center">
              <img
                src="/upi-qr.png"
                alt="LIS Academy UPI QR Code"
                className="w-full max-w-sm h-auto object-contain rounded-2xl bg-white"
              />
              <p className="mt-5 text-center text-sm leading-6 text-white/70">
                Scan the QR code to complete your UPI payment, then submit the transaction details below.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[32px] border border-white/10 bg-white p-6 shadow-xl md:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#0d1b3e]/10 px-4 py-2 text-sm font-semibold text-[#0d1b3e]">
                  <ReceiptText size={16} /> Donation confirmation
                </div>
                <h2 className="mt-4 font-serif text-2xl text-[#0d1b3e] md:text-3xl">
                  Share your payment details
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                These details are recorded for LIS Academy donation tracking and receipt follow-up.
              </p>
            </div>

            <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="donor-name">Name</Label>
                <Input
                  id="donor-name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donor-designation">Designation</Label>
                <Input
                  id="donor-designation"
                  value={form.designation}
                  onChange={(event) => updateField("designation", event.target.value)}
                  placeholder="Designation / role"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donor-email">Email</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donor-phone">Phone Number</Label>
                <Input
                  id="donor-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="Mobile number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donation-amount">Amount Paid</Label>
                <Input
                  id="donation-amount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="Amount in INR"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-id">Transaction ID</Label>
                <Input
                  id="transaction-id"
                  value={form.transactionId}
                  onChange={(event) => updateField("transactionId", event.target.value)}
                  placeholder="UPI transaction reference"
                  required
                />
              </div>

              <div className="md:col-span-2">
                {submitError ? (
                  <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </p>
                ) : null}
                {submitMessage ? (
                  <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {submitMessage}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  className="w-full bg-[#c9a84c] text-[#091529] hover:bg-[#d8ba65] md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ReceiptText />}
                  Submit Payment Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
