import PageHeader from "@/components/PageHeader";
import PageLayout from "@/components/PageLayout";

const policySections = [
  {
    title: "Program and Event Cancellations by Participants",
    body: [
      "Cancellation requests for paid programs, workshops, conferences, or events should be sent to LIS Academy by email with the participant name, registered email or phone number, payment reference, and program details.",
      "Refund eligibility may depend on the nature of the program, the timing of the request, and any event-specific cancellation terms communicated at the time of registration.",
    ],
  },
  {
    title: "Cancellations or Changes by LIS Academy",
    body: [
      "LIS Academy may reschedule, modify, or cancel a program, event, or service due to operational needs, insufficient registrations, speaker availability, force majeure, or other unavoidable circumstances.",
      "If a paid program or event is cancelled by LIS Academy, eligible participants may be offered a refund, transfer to a rescheduled session, or adjustment against another eligible program.",
    ],
  },
  {
    title: "Membership Fees",
    body: [
      "Membership fees are generally non-refundable once the membership application has been processed or membership benefits have been activated.",
      "If a payment error or duplicate payment occurs, contact LIS Academy with the payment details so the issue can be reviewed.",
    ],
  },
  {
    title: "Donations",
    body: [
      "Donations made to LIS Academy are generally non-refundable, except where a transaction error, duplicate payment, or other exceptional circumstance is verified.",
      "Refund requests for donations must include the donor name, contact details, payment date, amount, and transaction reference.",
    ],
  },
  {
    title: "Processing Time",
    body: [
      "Approved refunds will be processed to the original payment method where possible or through another reasonable method agreed by LIS Academy.",
      "Refund processing timelines may vary depending on payment gateway, bank, or administrative processing requirements.",
    ],
  },
  {
    title: "How to Request a Refund or Cancellation",
    body: [
      "Send your request to lisacademyorg@gmail.com with your full name, contact number, payment reference, payment date, amount, and reason for the request.",
      "LIS Academy may ask for additional information to verify the payment and determine refund eligibility.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For refund or cancellation support, contact LIS Academy at lisacademyorg@gmail.com or +91 9449679737.",
    ],
  },
];

export default function RefundAndCancellationPolicy() {
  return (
    <PageLayout>
      <PageHeader
        tag="Policy"
        title="Refund and Cancellation Policy"
        description="Information about cancellation requests, refund eligibility, and support for LIS Academy payments."
      />

      <section className="section-padding bg-[#0d1b3e]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 rounded-lg border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-[#c9a84c]">Last updated: June 7, 2026</p>
            <p className="mt-3 text-white/60 leading-relaxed">
              This policy explains how LIS Academy handles refund and cancellation requests for memberships, programs, events, services, and donations.
            </p>
          </div>

          <div className="space-y-6">
            {policySections.map((section) => (
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
