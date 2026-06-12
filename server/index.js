import dotenv from "dotenv";
import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { sql } from "./db.js";
import { requireAuth, requireAdmin, signToken } from "./auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });
const distDir = path.resolve(__dirname, "../dist");
const app = express();
const port = Number(process.env.PORT || 8787);
const adminUsername = String(process.env.ADMIN_USERNAME || "").trim();
const adminPassword = String(process.env.ADMIN_PASSWORD || "");
const donationSheetWebhookUrl = String(process.env.DONATION_GOOGLE_SHEET_WEBHOOK_URL || "").trim();
const donationSheetWebhookSecret = String(process.env.DONATION_GOOGLE_SHEET_WEBHOOK_SECRET || "").trim();
const smtpUser = String(process.env.SMTP_USER || "lisacademyorganisation@gmail.com").trim();
const smtpAppPassword = String(process.env.SMTP_APP_PASSWORD || "").trim();
const normalizedSmtpAppPassword = smtpAppPassword.replace(/^['"]|['"]$/g, "").replace(/[^a-zA-Z0-9]/g, "");
const mailFrom = String(process.env.MAIL_FROM || `LIS Academy <${smtpUser}>`).trim();
const donationAdminEmail = String(process.env.DONATION_ADMIN_EMAIL || smtpUser).trim();
let databaseReady = false;
let databaseStartupError = null;

if (!adminUsername) {
  throw new Error("ADMIN_USERNAME is not set. Configure a dedicated production admin username in the server environment.");
}

if (!adminPassword) {
  throw new Error("ADMIN_PASSWORD is not set. Configure a strong production admin password in the server environment.");
}

app.use(express.json({ limit: "50mb" }));
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const MEMBERSHIP_TIERS = new Set(["student", "life", "institutional"]);
const MEMBER_STATUSES = new Set(["pending", "approved", "rejected"]);
const VOLUNTEER_STATUSES = new Set(["pending", "approved", "rejected"]);
const DONATION_STATUSES = new Set(["pending", "approved", "rejected"]);
const MEMBER_CATEGORIES = new Set([
  "Librarian / Library Staff",
  "LIS Teacher",
  "LIS Student",
  "LIS Research Scholar",
  "Retired LIS Professional",
  "Others",
]);

const TEMPLATE_KEYS = new Set(["certificate", "id_front", "id_back"]);
const LIFE_CERTIFICATE_TEMPLATE_VERSION = 9;

async function ensureMemberDocumentColumns() {
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_data_url TEXT`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_template_version INTEGER`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS application_id TEXT`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_draft_data_url TEXT`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_editor_state JSONB`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS certificate_submitted_at TIMESTAMPTZ`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_status TEXT DEFAULT 'not_applied'`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_applied_at TIMESTAMPTZ`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_number INTEGER`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_certificate_data_url TEXT`;
  await sql`ALTER TABLE members ADD COLUMN IF NOT EXISTS volunteer_certificate_template_version INTEGER`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_members_application_id ON members (application_id)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_members_volunteer_number ON members (volunteer_number) WHERE volunteer_number IS NOT NULL`;
  await sql`
    UPDATE members
    SET application_id = COALESCE(application_id, CONCAT('APP/', membership_number::text))
    WHERE application_id IS NULL
  `;
}

async function ensureEventLinkColumns() {
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS brochure_url TEXT`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_url TEXT`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS report_url TEXT`;
}

async function ensureDonationTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  await sql`
    CREATE TABLE IF NOT EXISTS donations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      currency TEXT NOT NULL DEFAULT 'INR',
      payment_mode TEXT NOT NULL DEFAULT 'UPI QR',
      transaction_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      sheet_sync_status TEXT NOT NULL DEFAULT 'not_configured',
      sheet_sync_error TEXT,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ,
      sheet_synced_at TIMESTAMPTZ
    )
  `;
  await sql`ALTER TABLE donations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`;
  await sql`ALTER TABLE donations ADD COLUMN IF NOT EXISTS rejection_reason TEXT`;
  await sql`ALTER TABLE donations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`;
  await sql`CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_donations_status ON donations (status)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_transaction_id ON donations (transaction_id)`;
}

function normalizeEditorState(value) {
  const source = value && typeof value === "object" ? value : {};
  const asNumber = (key, fallback) => {
    const candidate = Number(source[key]);
    return Number.isFinite(candidate) ? candidate : fallback;
  };

  return {
    certificateOfX: asNumber("certificateOfX", 494),
    certificateOfY: asNumber("certificateOfY", 248),
    certificateOfFontSize: asNumber("certificateOfFontSize", 34),
    certificateTypeX: asNumber("certificateTypeX", 494),
    certificateTypeY: asNumber("certificateTypeY", 292),
    certificateTypeFontSize: asNumber("certificateTypeFontSize", 38),
    nameX: asNumber("nameX", 1198),
    nameY: asNumber("nameY", 770),
    nameFontSize: asNumber("nameFontSize", 52),
    designationX: asNumber("designationX", 1198),
    designationY: asNumber("designationY", 812),
    designationFontSize: asNumber("designationFontSize", 38),
    detailX: asNumber("detailX", 1198),
    detailY: asNumber("detailY", 862),
    detailFontSize: asNumber("detailFontSize", 42),
    membershipX: asNumber("membershipX", 1178),
    membershipY: asNumber("membershipY", 1248),
    membershipFontSize: asNumber("membershipFontSize", 44),
    dateX: asNumber("dateX", 685),
    dateY: asNumber("dateY", 1362),
    dateFontSize: asNumber("dateFontSize", 30),
    photoX: asNumber("photoX", 304),
    photoY: asNumber("photoY", 1002),
    photoRadius: asNumber("photoRadius", 173),
  };
}

function normalizeMember(row) {
  if (!row) return null;
  return {
    id: row.id,
    membership_id: row.membership_id,
    membership_number: Number(row.membership_number),
    application_id: row.application_id || undefined,
    name: row.name,
    email: row.email,
    phone: row.phone,
    category: row.category,
    custom_detail: row.custom_detail,
    designation: row.designation,
    institution: row.institution,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    membership_tier: row.membership_tier,
    status: row.status,
    photo_data_url: row.photo_data_url || undefined,
    certificate_draft_data_url: row.certificate_draft_data_url || undefined,
    certificate_data_url: row.certificate_data_url || undefined,
    certificate_editor_state: row.certificate_editor_state ? normalizeEditorState(row.certificate_editor_state) : undefined,
    certificate_template_version: row.certificate_template_version ? Number(row.certificate_template_version) : undefined,
    certificate_submitted_at: row.certificate_submitted_at || undefined,
    volunteer_status: row.volunteer_status || "not_applied",
    volunteer_number: row.volunteer_number ? Number(row.volunteer_number) : undefined,
    volunteer_certificate_data_url: row.volunteer_certificate_data_url || undefined,
    volunteer_certificate_template_version: row.volunteer_certificate_template_version ? Number(row.volunteer_certificate_template_version) : undefined,
    volunteer_applied_at: row.volunteer_applied_at || undefined,
    created_at: row.created_at,
    approved_at: row.approved_at || undefined,
    issue_date: row.issue_date || undefined,
  };
}

function publicMember(row) {
  return normalizeMember(row);
}

function normalizeJsonArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    location: row.location,
    type: row.event_type,
    description: row.description,
    speakers: normalizeJsonArray(row.speakers),
    agenda: normalizeJsonArray(row.agenda),
    image_url: row.image_url || "",
    registration_url: row.registration_url || "",
    brochure_url: row.brochure_url || "",
    gallery_url: row.gallery_url || "",
    report_url: row.report_url || "",
    is_featured: Boolean(row.is_featured),
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeTemplate(row) {
  if (!row) return null;
  return {
    key: row.template_key,
    label: row.label,
    template_url: row.template_url || "",
    field_map: row.field_map || {},
    updated_at: row.updated_at,
  };
}

function normalizeDonation(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    designation: row.designation,
    email: row.email,
    phone: row.phone,
    amount: Number(row.amount),
    currency: row.currency || "INR",
    payment_mode: row.payment_mode || "UPI QR",
    transaction_id: row.transaction_id,
    status: row.status || "pending",
    sheet_sync_status: row.sheet_sync_status || "not_configured",
    sheet_sync_error: row.sheet_sync_error || undefined,
    rejection_reason: row.rejection_reason || undefined,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at || undefined,
    sheet_synced_at: row.sheet_synced_at || undefined,
  };
}

function assertRequired(value, label) {
  if (!String(value || "").trim()) {
    throw new Error(`${label} is required.`);
  }
}

function validateDonation(body) {
  const amount = Number(body.amount);
  const values = {
    name: String(body.name || "").trim(),
    designation: String(body.designation || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    phone: String(body.phone || "").trim(),
    amount,
    transactionId: String(body.transactionId || body.transaction_id || "").trim(),
  };

  assertRequired(values.name, "Name");
  assertRequired(values.designation, "Designation");
  assertRequired(values.email, "Email");
  assertRequired(values.phone, "Phone number");
  assertRequired(values.transactionId, "Transaction ID");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    throw new Error("A valid email address is required.");
  }

  if (!Number.isFinite(values.amount) || values.amount <= 0) {
    throw new Error("A valid paid amount is required.");
  }

  return values;
}

let mailTransporter = null;

function getMailTransporter() {
  if (!smtpUser || !normalizedSmtpAppPassword) return null;
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: normalizedSmtpAppPassword,
      },
    });
  }
  return mailTransporter;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function donationSummaryLines(donation) {
  return [
    ["Name", donation.name],
    ["Designation", donation.designation],
    ["Email", donation.email],
    ["Phone", donation.phone],
    ["Amount", `${donation.currency || "INR"} ${Number(donation.amount || 0).toFixed(2)}`],
    ["Payment Mode", donation.payment_mode || "UPI QR"],
    ["Transaction ID", donation.transaction_id],
  ];
}

async function sendMailSafe({ to, subject, text, html }) {
  const transporter = getMailTransporter();
  if (!transporter || !to) {
    const error = "Email not sent because SMTP_USER/SMTP_APP_PASSWORD or recipient is missing.";
    console.warn(error);
    return { ok: false, to, subject, error };
  }

  try {
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      text,
      html,
    });
    console.info(`Email sent to ${to} with subject "${subject}". messageId=${info.messageId || "unknown"}`);
    return { ok: true, to, subject, messageId: info.messageId || undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Email send failed:", message);
    return { ok: false, to, subject, error: message };
  }
}

function donationDetailsHtml(donation) {
  return donationSummaryLines(donation)
    .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#475569">${escapeHtml(label)}</td><td style="padding:4px 0;font-weight:600;color:#0f172a">${escapeHtml(value)}</td></tr>`)
    .join("");
}

function donationDetailsText(donation) {
  return donationSummaryLines(donation)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

async function notifyDonationSubmitted(donation) {
  const detailsText = donationDetailsText(donation);
  const detailsHtml = donationDetailsHtml(donation);

  return Promise.all([
    sendMailSafe({
      to: donationAdminEmail,
      subject: `New donation confirmation submitted - ${donation.name}`,
      text: `A new donation confirmation was submitted and is pending admin review.\n\n${detailsText}`,
      html: `<p>A new donation confirmation was submitted and is pending admin review.</p><table>${detailsHtml}</table>`,
    }),
    sendMailSafe({
      to: donation.email,
      subject: "LIS Academy donation details received",
      text: `Dear ${donation.name},\n\nThank you for submitting your donation payment details. Your confirmation is pending verification by LIS Academy.\n\n${detailsText}\n\nRegards,\nLIS Academy`,
      html: `<p>Dear ${escapeHtml(donation.name)},</p><p>Thank you for submitting your donation payment details. Your confirmation is pending verification by LIS Academy.</p><table>${detailsHtml}</table><p>Regards,<br/>LIS Academy</p>`,
    }),
  ]);
}

async function notifyDonationReviewed(donation) {
  if (donation.status === "approved") {
    return sendMailSafe({
      to: donation.email,
      subject: "LIS Academy donation approved",
      text: `Dear ${donation.name},\n\nYour donation confirmation has been approved. Thank you for supporting LIS Academy.\n\n${donationDetailsText(donation)}\n\nRegards,\nLIS Academy`,
      html: `<p>Dear ${escapeHtml(donation.name)},</p><p>Your donation confirmation has been approved. Thank you for supporting LIS Academy.</p><table>${donationDetailsHtml(donation)}</table><p>Regards,<br/>LIS Academy</p>`,
    });
  }

  if (donation.status === "rejected") {
    const reason = donation.rejection_reason || "The submitted donation details could not be verified.";
    return sendMailSafe({
      to: donation.email,
      subject: "LIS Academy donation confirmation rejected",
      text: `Dear ${donation.name},\n\nYour donation confirmation was rejected for the following reason:\n${reason}\n\n${donationDetailsText(donation)}\n\nRegards,\nLIS Academy`,
      html: `<p>Dear ${escapeHtml(donation.name)},</p><p>Your donation confirmation was rejected for the following reason:</p><p style="padding:12px;background:#fee2e2;color:#991b1b">${escapeHtml(reason)}</p><table>${donationDetailsHtml(donation)}</table><p>Regards,<br/>LIS Academy</p>`,
    });
  }

  return { ok: true, skipped: true };
}

function validateRegistration(body) {
  assertRequired(body.name, "Full name");
  assertRequired(body.email, "Email");
  assertRequired(body.phone, "Phone number");
  assertRequired(body.password, "Password");
  assertRequired(body.category, "Category");
  assertRequired(body.custom_detail, "Custom detail");
  assertRequired(body.designation, "Designation");
  assertRequired(body.institution, "Institution");
  assertRequired(body.address, "Address");
  assertRequired(body.city, "City");
  assertRequired(body.state, "State");
  assertRequired(body.pincode, "PIN code");

  if (!MEMBERSHIP_TIERS.has(body.membership_tier)) {
    throw new Error("Invalid membership tier.");
  }

  if (!MEMBER_CATEGORIES.has(body.category)) {
    throw new Error("Invalid member category.");
  }

  if (String(body.password).length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
}

function validateMemberDraftValues(body) {
  const values = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    category: String(body.category || "").trim(),
    custom_detail: String(body.custom_detail || "").trim(),
    designation: String(body.designation || "").trim(),
    institution: String(body.institution || "").trim(),
    address: String(body.address || "").trim(),
    city: String(body.city || "").trim(),
    state: String(body.state || "").trim(),
    pincode: String(body.pincode || "").trim(),
    membership_tier: String(body.membership_tier || "").trim(),
    certificate_draft_data_url: String(body.certificate_draft_data_url || "").trim(),
  };

  assertRequired(values.name, "Full name");
  assertRequired(values.email, "Email");
  assertRequired(values.phone, "Phone number");
  assertRequired(values.category, "Category");
  assertRequired(values.custom_detail, "Custom detail");
  assertRequired(values.designation, "Designation");
  assertRequired(values.institution, "Institution");
  assertRequired(values.address, "Address");
  assertRequired(values.city, "City");
  assertRequired(values.state, "State");
  assertRequired(values.pincode, "PIN code");

  if (!MEMBERSHIP_TIERS.has(values.membership_tier)) {
    throw new Error("Invalid membership tier.");
  }

  if (!MEMBER_CATEGORIES.has(values.category)) {
    throw new Error("Invalid member category.");
  }

  return values;
}

async function generateMembershipIdentity() {
  const rows = await sql`
    SELECT candidate AS membership_number
    FROM generate_series(1, GREATEST((SELECT COALESCE(MAX(membership_number), 0) + 1 FROM members), 1)) AS candidate
    WHERE NOT EXISTS (
      SELECT 1 FROM members WHERE membership_number = candidate
    )
    ORDER BY candidate ASC
    LIMIT 1
  `;
  const membershipNumber = Number(rows[0].membership_number);
  return {
    membershipNumber,
    membershipId: `LISA/${membershipNumber}`,
  };
}

async function generateVolunteerNumber() {
  const rows = await sql`
    SELECT candidate AS volunteer_number
    FROM generate_series(1, GREATEST((SELECT COALESCE(MAX(volunteer_number), 0) + 1 FROM members), 1)) AS candidate
    WHERE NOT EXISTS (
      SELECT 1 FROM members WHERE volunteer_number = candidate
    )
    ORDER BY candidate
    LIMIT 1
  `;
  return Number(rows[0].volunteer_number);
}

function generateApplicationId(membershipNumber) {
  return `APP/${membershipNumber}`;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    databaseReady,
    databaseError: databaseStartupError?.message || undefined,
  });
});

app.get("/api/events", async (_req, res) => {
  try {
    const rows = await sql`
      SELECT * FROM events
      ORDER BY sort_order ASC, created_at DESC
    `;
    res.json({ events: rows.map(normalizeEvent) });
  } catch {
    res.status(500).json({ error: "Failed to load events." });
  }
});

app.get("/api/content", async (req, res) => {
  try {
    const section = String(req.query.section || "").trim();
    const rows = section
      ? await sql`SELECT section, key, value, updated_at FROM site_content WHERE section = ${section} ORDER BY key ASC`
      : await sql`SELECT section, key, value, updated_at FROM site_content ORDER BY section ASC, key ASC`;
    res.json({ content: rows });
  } catch {
    res.status(500).json({ error: "Failed to load site content." });
  }
});

app.get("/api/document-templates", async (_req, res) => {
  try {
    const rows = await sql`
      SELECT * FROM document_templates
      ORDER BY CASE template_key
        WHEN 'certificate' THEN 1
        WHEN 'id_front' THEN 2
        WHEN 'id_back' THEN 3
        ELSE 10
      END
    `;
    res.json({ templates: rows.map(normalizeTemplate) });
  } catch {
    res.status(500).json({ error: "Failed to load document templates." });
  }
});

app.get("/api/image-proxy", async (req, res) => {
  try {
    const rawUrl = String(req.query.url || "").trim();
    const url = new URL(rawUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      return res.status(400).json({ error: "Only http and https image URLs are supported." });
    }

    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "LISAcademyWebsite/1.0",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Failed to fetch template image." });
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return res.status(415).json({ error: "The provided URL did not return an image." });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.header("Content-Type", contentType);
    res.header("Cache-Control", "public, max-age=3600");
    res.send(buffer);
  } catch {
    res.status(400).json({ error: "Invalid image URL." });
  }
});

app.post("/api/donations", async (req, res) => {
  try {
    const donation = validateDonation(req.body);
    const inserted = await sql`
      INSERT INTO donations (
        name,
        designation,
        email,
        phone,
        amount,
        currency,
        payment_mode,
        transaction_id,
        status,
        sheet_sync_status
      ) VALUES (
        ${donation.name},
        ${donation.designation},
        ${donation.email},
        ${donation.phone},
        ${donation.amount},
        ${"INR"},
        ${"UPI QR"},
        ${donation.transactionId},
        ${"pending"},
        ${donationSheetWebhookUrl ? "pending" : "not_configured"}
      )
      RETURNING *
    `;
    const savedDonation = inserted[0];

    if (!donationSheetWebhookUrl) {
      await notifyDonationSubmitted(normalizeDonation(savedDonation));
      return res.status(201).json({ saved: true, donation: normalizeDonation(savedDonation) });
    }

    const payload = {
      submittedAt: savedDonation.created_at,
      currency: "INR",
      paymentMode: "UPI QR",
      secret: donationSheetWebhookSecret || undefined,
      ...donation,
    };

    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "LISAcademyWebsite/1.0",
    };

    try {
      const response = await fetch(donationSheetWebhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Google Sheets webhook responded with ${response.status}.${responseText ? ` ${responseText.slice(0, 300)}` : ""}`);
      }
    } catch (syncError) {
      const message = (syncError instanceof Error ? syncError.message : "Google Sheets sync failed.").slice(0, 500);
      const rows = await sql`
        UPDATE donations
        SET sheet_sync_status = 'failed',
            sheet_sync_error = ${message}
        WHERE id = ${savedDonation.id}
        RETURNING *
      `;
      const normalized = normalizeDonation(rows[0]);
      await notifyDonationSubmitted(normalized);
      return res.status(201).json({ saved: true, donation: normalized, sheet_error: message });
    }

    const rows = await sql`
      UPDATE donations
      SET sheet_sync_status = 'synced',
          sheet_sync_error = NULL,
          sheet_synced_at = NOW()
      WHERE id = ${savedDonation.id}
      RETURNING *
    `;

    const normalized = normalizeDonation(rows[0]);
    await notifyDonationSubmitted(normalized);
    res.status(201).json({ saved: true, donation: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit donation details.";
    if (error?.code === "23505" || message.includes("duplicate key")) {
      return res.status(409).json({ error: "This transaction ID has already been submitted." });
    }
    res.status(400).json({ error: message });
  }
});

app.post("/api/members/register", async (req, res) => {
  try {
    validateRegistration(req.body);

    const email = String(req.body.email).trim().toLowerCase();
    const phone = String(req.body.phone).trim();

    const existing = await sql`
      SELECT id FROM members
      WHERE lower(email) = ${email} OR phone = ${phone}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: "A member with this email or mobile number already exists." });
    }

    const { membershipNumber, membershipId } = await generateMembershipIdentity();
    const applicationId = generateApplicationId(membershipNumber);
    const passwordHash = await bcrypt.hash(String(req.body.password), 10);

    const rows = await sql`
      INSERT INTO members (
        membership_number,
        membership_id,
        application_id,
        name,
        email,
        phone,
        password_hash,
        category,
        custom_detail,
        designation,
        institution,
        address,
        city,
        state,
        pincode,
        membership_tier,
        status,
        photo_data_url,
        certificate_draft_data_url,
        certificate_editor_state,
        certificate_submitted_at,
        issue_date
      ) VALUES (
        ${membershipNumber},
        ${membershipId},
        ${applicationId},
        ${String(req.body.name).trim()},
        ${email},
        ${phone},
        ${passwordHash},
        ${String(req.body.category).trim()},
        ${String(req.body.custom_detail).trim()},
        ${String(req.body.designation).trim()},
        ${String(req.body.institution).trim()},
        ${String(req.body.address).trim()},
        ${String(req.body.city).trim()},
        ${String(req.body.state).trim()},
        ${String(req.body.pincode).trim()},
        ${String(req.body.membership_tier).trim()},
        ${"pending"},
        ${req.body.photo_data_url ? String(req.body.photo_data_url) : null},
        ${req.body.certificate_draft_data_url ? String(req.body.certificate_draft_data_url) : null},
        ${req.body.certificate_editor_state ? JSON.stringify(normalizeEditorState(req.body.certificate_editor_state)) : null}::jsonb,
        ${req.body.certificate_draft_data_url ? new Date().toISOString() : null},
        ${new Date().toISOString()}
      )
      RETURNING *
    `;

    const member = publicMember(rows[0]);
    const token = signToken({ role: "member", memberId: member.id, membershipId: member.membership_id, email: member.email });

    res.status(201).json({ token, member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    res.status(400).json({ error: message });
  }
});

app.post("/api/members/login", async (req, res) => {
  try {
    const identifier = String(req.body.identifier || "").trim();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email or membership ID and password are required." });
    }

    const rows = await sql`
      SELECT * FROM members
      WHERE lower(email) = ${identifier.toLowerCase()} OR membership_id = ${identifier} OR application_id = ${identifier}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    const member = rows[0];
    const valid = await bcrypt.compare(password, member.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    const normalized = publicMember(member);
    const token = signToken({ role: "member", memberId: normalized.id, membershipId: normalized.membership_id, email: normalized.email });
    res.json({ token, member: normalized });
  } catch {
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/api/members/me", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "member") {
      return res.status(403).json({ error: "Member access required." });
    }

    const rows = await sql`SELECT * FROM members WHERE id = ${req.user.memberId} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({ member: publicMember(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to load member profile." });
  }
});

app.put("/api/members/me/certificate", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "member") {
      return res.status(403).json({ error: "Member access required." });
    }

    const currentRows = await sql`SELECT status FROM members WHERE id = ${req.user.memberId} LIMIT 1`;
    if (currentRows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }
    if (currentRows[0].status !== "approved") {
      return res.status(403).json({ error: "Final certificate is available after admin approval." });
    }

    const certificateDataUrl = String(req.body.certificate_data_url || "").trim();
    const templateVersion = Number(req.body.certificate_template_version);

    if (!certificateDataUrl.startsWith("data:image/png;base64,") && !certificateDataUrl.startsWith("data:image/jpeg;base64,")) {
      return res.status(400).json({ error: "A PNG or JPEG certificate image is required." });
    }

    if (!Number.isInteger(templateVersion) || templateVersion < 1) {
      return res.status(400).json({ error: "A valid certificate template version is required." });
    }

    const rows = await sql`
      UPDATE members
      SET
        certificate_data_url = ${certificateDataUrl},
        certificate_template_version = ${templateVersion}
      WHERE id = ${req.user.memberId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({
      saved: true,
      certificate_template_version: Number(rows[0].certificate_template_version || templateVersion),
    });
  } catch {
    res.status(500).json({ error: "Failed to save certificate." });
  }
});

app.put("/api/members/me/volunteer-certificate", requireAuth, async (req, res) => {
  try {
    if (!req.user?.memberId) {
      return res.status(403).json({ error: "Member access required." });
    }

    const currentRows = await sql`
      SELECT volunteer_status FROM members
      WHERE id = ${req.user.memberId}
      LIMIT 1
    `;

    if (currentRows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    if (currentRows[0].volunteer_status !== "approved") {
      return res.status(403).json({ error: "Volunteer certificate is available after admin approval." });
    }

    const certificateDataUrl = String(req.body.volunteer_certificate_data_url || "").trim();
    const templateVersion = Number(req.body.volunteer_certificate_template_version);

    if (!certificateDataUrl.startsWith("data:image/png;base64,") && !certificateDataUrl.startsWith("data:image/jpeg;base64,")) {
      return res.status(400).json({ error: "A PNG or JPEG volunteer certificate image is required." });
    }

    if (!Number.isInteger(templateVersion) || templateVersion < 1) {
      return res.status(400).json({ error: "A valid volunteer certificate template version is required." });
    }

    const rows = await sql`
      UPDATE members
      SET
        volunteer_certificate_data_url = ${certificateDataUrl},
        volunteer_certificate_template_version = ${templateVersion}
      WHERE id = ${req.user.memberId}
      RETURNING volunteer_certificate_template_version
    `;

    res.json({
      saved: true,
      volunteer_certificate_template_version: Number(rows[0].volunteer_certificate_template_version || templateVersion),
    });
  } catch {
    res.status(500).json({ error: "Failed to save volunteer certificate." });
  }
});

app.put("/api/members/me/certificate-draft", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "member") {
      return res.status(403).json({ error: "Member access required." });
    }

    const draftDataUrl = String(req.body.certificate_draft_data_url || "").trim();
    const editorState = normalizeEditorState(req.body.certificate_editor_state);
    const submitForReview = Boolean(req.body.submit_for_review);

    if (!draftDataUrl.startsWith("data:image/png;base64,") && !draftDataUrl.startsWith("data:image/jpeg;base64,")) {
      return res.status(400).json({ error: "A PNG or JPEG draft image is required." });
    }

    const submittedAt = submitForReview ? new Date().toISOString() : null;
    const rows = await sql`
      UPDATE members
      SET
        certificate_draft_data_url = ${draftDataUrl},
        certificate_editor_state = ${JSON.stringify(editorState)}::jsonb,
        certificate_submitted_at = COALESCE(${submittedAt}, certificate_submitted_at)
      WHERE id = ${req.user.memberId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({
      saved: true,
      submitted_at: rows[0].certificate_submitted_at || undefined,
    });
  } catch {
    res.status(500).json({ error: "Failed to save certificate draft." });
  }
});

app.post("/api/members/me/volunteer", requireAuth, async (req, res) => {
  try {
    if (!req.user?.memberId) {
      return res.status(403).json({ error: "Member access required." });
    }

    const rows = await sql`
      UPDATE members
      SET volunteer_status = 'pending',
          volunteer_applied_at = COALESCE(volunteer_applied_at, NOW())
      WHERE id = ${req.user.memberId}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({ member: publicMember(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to submit volunteer application." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ error: "Invalid admin credentials." });
  }

  const token = signToken({ role: "admin", username });
  res.json({ token, admin: { username } });
});

app.get("/api/admin/members", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
    const limit = Math.min(parseInt(String(req.query.limit || "100"), 10), 1000);
    const offset = (page - 1) * limit;
    const rows = await sql`
      SELECT * FROM members
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    // also return total count for client pagination UI
    const totalResult = await sql`SELECT COUNT(*) FROM members`;
    const total = Number(totalResult[0].count);
    res.json({ members: rows.map(publicMember), total, page, limit });
  } catch {
    res.status(500).json({ error: "Failed to load members." });
  }
});

app.get("/api/admin/donations", requireAdmin, async (_req, res) => {
  try {
    const rows = await sql`
      SELECT *
      FROM donations
      ORDER BY created_at DESC
      LIMIT 1000
    `;
    res.json({ donations: rows.map(normalizeDonation) });
  } catch {
    res.status(500).json({ error: "Failed to load donations." });
  }
});

app.patch("/api/admin/donations/:id/status", requireAdmin, async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    if (!DONATION_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid donation status." });
    }

    const rejectionReason = String(req.body.rejection_reason || req.body.rejectionReason || "").trim();
    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ error: "A rejection reason is required." });
    }

    const reviewedAt = status === "pending" ? null : new Date().toISOString();
    const rows = await sql`
      UPDATE donations
      SET status = ${status},
          reviewed_at = ${reviewedAt},
          rejection_reason = ${status === "rejected" ? rejectionReason : null}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: "Donation not found." });
    }

    const normalized = normalizeDonation(rows[0]);
    const mail = await notifyDonationReviewed(normalized);
    res.json({ donation: normalized, mail });
  } catch {
    res.status(500).json({ error: "Failed to update donation status." });
  }
});

app.post("/api/admin/members", requireAdmin, async (req, res) => {
  try {
    validateRegistration(req.body);

    const email = String(req.body.email).trim().toLowerCase();
    const phone = String(req.body.phone).trim();
    const status = MEMBER_STATUSES.has(String(req.body.status || "").trim())
      ? String(req.body.status).trim()
      : "approved";

    const existing = await sql`
      SELECT id FROM members
      WHERE lower(email) = ${email} OR phone = ${phone}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: "A member with this email or mobile number already exists." });
    }

    const { membershipNumber, membershipId } = await generateMembershipIdentity();
    const applicationId = generateApplicationId(membershipNumber);
    const passwordHash = await bcrypt.hash(String(req.body.password), 10);
    const approvedAt = status === "approved" ? new Date().toISOString() : null;

    const rows = await sql`
      INSERT INTO members (
        membership_number,
        membership_id,
        application_id,
        name,
        email,
        phone,
        password_hash,
        category,
        custom_detail,
        designation,
        institution,
        address,
        city,
        state,
        pincode,
        membership_tier,
        status,
        photo_data_url,
        approved_at,
        issue_date
      ) VALUES (
        ${membershipNumber},
        ${membershipId},
        ${applicationId},
        ${String(req.body.name).trim()},
        ${email},
        ${phone},
        ${passwordHash},
        ${String(req.body.category).trim()},
        ${String(req.body.custom_detail).trim()},
        ${String(req.body.designation).trim()},
        ${String(req.body.institution).trim()},
        ${String(req.body.address).trim()},
        ${String(req.body.city).trim()},
        ${String(req.body.state).trim()},
        ${String(req.body.pincode).trim()},
        ${String(req.body.membership_tier).trim()},
        ${status},
        ${req.body.photo_data_url ? String(req.body.photo_data_url) : null},
        ${approvedAt},
        ${new Date().toISOString()}
      )
      RETURNING *
    `;

    res.status(201).json({ member: publicMember(rows[0]) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create member.";
    res.status(400).json({ error: message });
  }
});

app.post("/api/admin/events", requireAdmin, async (req, res) => {
  try {
    assertRequired(req.body.title, "Title");
    assertRequired(req.body.date, "Date");
    assertRequired(req.body.location, "Location");
    assertRequired(req.body.type, "Type");
    assertRequired(req.body.description, "Description");

    const rows = await sql`
      INSERT INTO events (
        title,
        event_date,
        location,
        event_type,
        description,
        speakers,
        agenda,
        image_url,
        registration_url,
        brochure_url,
        gallery_url,
        report_url,
        is_featured,
        sort_order
      ) VALUES (
        ${String(req.body.title).trim()},
        ${String(req.body.date).trim()},
        ${String(req.body.location).trim()},
        ${String(req.body.type).trim()},
        ${String(req.body.description).trim()},
        ${JSON.stringify(normalizeJsonArray(req.body.speakers))}::jsonb,
        ${JSON.stringify(normalizeJsonArray(req.body.agenda))}::jsonb,
        ${String(req.body.image_url || "").trim() || null},
        ${String(req.body.registration_url || "").trim() || null},
        ${String(req.body.brochure_url || "").trim() || null},
        ${String(req.body.gallery_url || "").trim() || null},
        ${String(req.body.report_url || "").trim() || null},
        ${Boolean(req.body.is_featured)},
        ${Number(req.body.sort_order || 0)}
      )
      RETURNING *
    `;
    res.status(201).json({ event: normalizeEvent(rows[0]) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create event.";
    res.status(400).json({ error: message });
  }
});

app.put("/api/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    assertRequired(req.body.title, "Title");
    assertRequired(req.body.date, "Date");
    assertRequired(req.body.location, "Location");
    assertRequired(req.body.type, "Type");
    assertRequired(req.body.description, "Description");

    const rows = await sql`
      UPDATE events
      SET
        title = ${String(req.body.title).trim()},
        event_date = ${String(req.body.date).trim()},
        location = ${String(req.body.location).trim()},
        event_type = ${String(req.body.type).trim()},
        description = ${String(req.body.description).trim()},
        speakers = ${JSON.stringify(normalizeJsonArray(req.body.speakers))}::jsonb,
        agenda = ${JSON.stringify(normalizeJsonArray(req.body.agenda))}::jsonb,
        image_url = ${String(req.body.image_url || "").trim() || null},
        registration_url = ${String(req.body.registration_url || "").trim() || null},
        brochure_url = ${String(req.body.brochure_url || "").trim() || null},
        gallery_url = ${String(req.body.gallery_url || "").trim() || null},
        report_url = ${String(req.body.report_url || "").trim() || null},
        is_featured = ${Boolean(req.body.is_featured)},
        sort_order = ${Number(req.body.sort_order || 0)},
        updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.json({ event: normalizeEvent(rows[0]) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update event.";
    res.status(400).json({ error: message });
  }
});

app.delete("/api/admin/events/:id", requireAdmin, async (req, res) => {
  try {
    await sql`DELETE FROM events WHERE id = ${req.params.id}`;
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete event." });
  }
});

app.put("/api/admin/content/:section", requireAdmin, async (req, res) => {
  try {
    const section = String(req.params.section || "").trim();
    if (!section) {
      return res.status(400).json({ error: "Section is required." });
    }

    const data = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
    for (const [key, value] of Object.entries(data)) {
      await sql`
        INSERT INTO site_content (section, key, value, updated_at)
        VALUES (${section}, ${String(key)}, ${String(value || "")}, NOW())
        ON CONFLICT (section, key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }

    const rows = await sql`SELECT section, key, value, updated_at FROM site_content WHERE section = ${section} ORDER BY key ASC`;
    res.json({ content: rows });
  } catch {
    res.status(500).json({ error: "Failed to save site content." });
  }
});

app.put("/api/admin/document-templates/:key", requireAdmin, async (req, res) => {
  try {
    const key = String(req.params.key || "").trim();
    if (!TEMPLATE_KEYS.has(key)) {
      return res.status(400).json({ error: "Invalid template key." });
    }

    const fieldMap = req.body.field_map && typeof req.body.field_map === "object" ? req.body.field_map : {};
    const rows = await sql`
      INSERT INTO document_templates (template_key, label, template_url, field_map, updated_at)
      VALUES (
        ${key},
        ${String(req.body.label || key).trim()},
        ${String(req.body.template_url || "").trim()},
        ${JSON.stringify(fieldMap)}::jsonb,
        NOW()
      )
      ON CONFLICT (template_key)
      DO UPDATE SET
        label = EXCLUDED.label,
        template_url = EXCLUDED.template_url,
        field_map = EXCLUDED.field_map,
        updated_at = NOW()
      RETURNING *
    `;
    res.json({ template: normalizeTemplate(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to save document template." });
  }
});

app.get("/api/admin/members/:id", requireAdmin, async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM members WHERE id = ${req.params.id} LIMIT 1`;
    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }
    res.json({ member: publicMember(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to load member." });
  }
});

app.patch("/api/admin/members/:id/draft-values", requireAdmin, async (req, res) => {
  try {
    const values = validateMemberDraftValues(req.body);
    const emailRows = await sql`
      SELECT id FROM members
      WHERE lower(email) = ${values.email.toLowerCase()} AND id <> ${req.params.id}
      LIMIT 1
    `;
    if (emailRows.length > 0) {
      return res.status(409).json({ error: "Another member already uses this email." });
    }

    const rows = await sql`
      UPDATE members
      SET name = ${values.name},
          email = ${values.email},
          phone = ${values.phone},
          category = ${values.category},
          custom_detail = ${values.custom_detail},
          designation = ${values.designation},
          institution = ${values.institution},
          address = ${values.address},
          city = ${values.city},
          state = ${values.state},
          pincode = ${values.pincode},
          membership_tier = ${values.membership_tier},
          certificate_draft_data_url = ${values.certificate_draft_data_url || null},
          certificate_data_url = NULL,
          certificate_template_version = NULL,
          certificate_submitted_at = COALESCE(certificate_submitted_at, NOW())
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({ member: publicMember(rows[0]) });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update draft values." });
  }
});

app.patch("/api/admin/members/:id/status", requireAdmin, async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    if (!MEMBER_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid member status." });
    }

    const approvedAt = status === "approved" ? new Date().toISOString() : null;
    const rows = await sql`
      UPDATE members
      SET status = ${status}, approved_at = ${approvedAt}
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({ member: publicMember(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to update member status." });
  }
});

app.patch("/api/admin/members/:id/volunteer-status", requireAdmin, async (req, res) => {
  try {
    const status = String(req.body.status || "").trim();
    if (!VOLUNTEER_STATUSES.has(status)) {
      return res.status(400).json({ error: "Invalid volunteer status." });
    }

    let volunteerNumber = null;
    if (status === "approved") {
      const existing = await sql`
        SELECT volunteer_number FROM members
        WHERE id = ${req.params.id}
        LIMIT 1
      `;
      if (existing.length === 0) {
        return res.status(404).json({ error: "Member not found." });
      }
      volunteerNumber = existing[0].volunteer_number || await generateVolunteerNumber();
    }

    const rows = status === "approved"
      ? await sql`
          UPDATE members
          SET volunteer_status = ${status},
              volunteer_number = ${volunteerNumber}
          WHERE id = ${req.params.id}
          RETURNING *
        `
      : await sql`
          UPDATE members
          SET volunteer_status = ${status}
          WHERE id = ${req.params.id}
          RETURNING *
        `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({ member: publicMember(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to update volunteer status." });
  }
});

app.patch("/api/admin/members/:id/certificate-editor", requireAdmin, async (req, res) => {
  try {
    const editorState = normalizeEditorState(req.body.certificate_editor_state);
    const rows = await sql`
      UPDATE members
      SET certificate_editor_state = ${JSON.stringify(editorState)}::jsonb
      WHERE id = ${req.params.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found." });
    }

    res.json({ member: publicMember(rows[0]) });
  } catch {
    res.status(500).json({ error: "Failed to save certificate editor settings." });
  }
});

app.delete("/api/admin/members/:id", requireAdmin, async (req, res) => {
  try {
    await sql`DELETE FROM members WHERE id = ${req.params.id}`;
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Failed to delete member." });
  }
});

app.use(express.static(distDir));
app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

async function prepareDatabase() {
  try {
    await ensureMemberDocumentColumns();
    await ensureEventLinkColumns();
    await ensureDonationTable();
    databaseReady = true;
    databaseStartupError = null;
    console.log("[db] Database preparation completed.");
  } catch (error) {
    databaseReady = false;
    databaseStartupError = error;
    console.error("Failed to prepare database.", error);
  }
}

app.listen(port, () => {
  console.log(`LIS Academy app listening on http://localhost:${port}`);
  console.log(`Life certificate template version: ${LIFE_CERTIFICATE_TEMPLATE_VERSION}`);
  prepareDatabase();

  setInterval(async () => {
    try {
      await sql`SELECT 1`;
      console.log("[db] Keep-alive ping successful.");
    } catch (err) {
      console.error("[db] Keep-alive ping failed:", err.message);
    }
  }, 4 * 60 * 1000);
});
