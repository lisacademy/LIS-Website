import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Check, CreditCard, Download, Printer, Save, X } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { MEMBERSHIP_TIERS, getMemberById, updateMemberCertificateEditorState, updateMemberDraftValues, updateMemberStatus, updateVolunteerStatus } from "@/lib/membershipDb";
import { generateCertificate, generateIdCard, generateLifeCertificateDraft, generateVolunteerCertificate, getLifeCertificateSettings, normalizeLifeCertificateEditorState, printImage } from "@/lib/certificateGenerator";
import type { AdminMemberDraftValues, LifeCertificateEditorState, Member, MembershipTier } from "@/lib/membershipTypes";

const MEMBER_CATEGORIES = [
  "Librarian / Library Staff",
  "LIS Teacher",
  "LIS Student",
  "LIS Research Scholar",
  "Retired LIS Professional",
  "Others",
] as const;

function getDraftValues(member: Member): AdminMemberDraftValues {
  return {
    name: member.name || "",
    email: member.email || "",
    phone: member.phone || "",
    category: member.category || "Librarian / Library Staff",
    custom_detail: member.custom_detail || "",
    designation: member.designation || "",
    institution: member.institution || "",
    address: member.address || "",
    city: member.city || "",
    state: member.state || "",
    pincode: member.pincode || "",
    membership_tier: member.membership_tier,
    certificate_draft_data_url: member.certificate_draft_data_url,
  };
}

export default function AdminMemberDetail() {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [volunteerCertUrl, setVolunteerCertUrl] = useState<string | null>(null);
  const [cardFront, setCardFront] = useState<string | null>(null);
  const [cardBack, setCardBack] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [activePreview, setActivePreview] = useState<"draft" | "certificate" | "volunteer" | "card">("draft");
  const [editorState, setEditorState] = useState<LifeCertificateEditorState>(normalizeLifeCertificateEditorState());
  const [placementDirty, setPlacementDirty] = useState(false);
  const [draftValues, setDraftValues] = useState<AdminMemberDraftValues | null>(null);
  const [draftDirty, setDraftDirty] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin");
  }, [isAuthenticated, navigate]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const current = await getMemberById(id);
    const templateSettings = await getLifeCertificateSettings();
    setMember(current);
    setDraftValues(current ? getDraftValues(current) : null);
    setEditorState(normalizeLifeCertificateEditorState(templateSettings.editorState));
    setPlacementDirty(false);
    setDraftDirty(false);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const saveDraftValues = async () => {
    if (!member || !draftValues) return member;
    setWorking(true);
    setMessage("");
    try {
      const templateSettings = await getLifeCertificateSettings();
      const generationEditorState = placementDirty
        ? editorState
        : normalizeLifeCertificateEditorState(member.certificate_editor_state || templateSettings.editorState);
      const draftMember = {
        ...member,
        ...draftValues,
        certificate_editor_state: generationEditorState,
      };
      const certificate_draft_data_url = await generateLifeCertificateDraft(draftMember, { editorState: generationEditorState });
      const saved = await updateMemberDraftValues(member.id, {
        ...draftValues,
        certificate_draft_data_url,
      });
      const savedWithPlacement = placementDirty
        ? await updateMemberCertificateEditorState(member.id, generationEditorState)
        : saved;
      setMember(savedWithPlacement);
      setDraftValues(getDraftValues(savedWithPlacement));
      setEditorState(generationEditorState);
      setDraftDirty(false);
      setPlacementDirty(false);
      setCertUrl(null);
      setCardFront(null);
      setCardBack(null);
      setActivePreview("draft");
      setMessage("Draft values saved and certificate draft regenerated.");
      return savedWithPlacement;
    } finally {
      setWorking(false);
    }
  };

  const requestStatusReason = (status: "approved" | "rejected", label: string) => {
    const reason = prompt(`Enter the reason for ${status === "approved" ? "approving" : "rejecting"} ${label}:`);
    if (reason === null) return null;
    const trimmed = reason.trim();
    if (!trimmed) {
      alert("A reason is required before sending the email notification.");
      return null;
    }
    return trimmed;
  };

  const handleApprove = async () => {
    if (!member) return;
    const reason = requestStatusReason("approved", "this membership application");
    if (!reason) return;
    setWorking(true);
    try {
      const latestMember = (draftDirty || placementDirty) ? await saveDraftValues() : member;
      if (latestMember && placementDirty) {
        await updateMemberCertificateEditorState(latestMember.id, editorState);
      }
      const saved = await updateMemberStatus(latestMember?.id || member.id, "approved", reason);
      if (saved.email_error) {
        alert(`Status updated, but the email could not be sent: ${saved.email_error}`);
      }
      await load();
    } finally {
      setWorking(false);
    }
  };

  const handleReject = async () => {
    if (!member) return;
    const reason = requestStatusReason("rejected", "this membership application");
    if (!reason) return;
    setWorking(true);
    try {
      const saved = await updateMemberStatus(member.id, "rejected", reason);
      if (saved.email_error) {
        alert(`Status updated, but the email could not be sent: ${saved.email_error}`);
      }
      await load();
    } finally {
      setWorking(false);
    }
  };

  const handleVolunteerStatus = async (status: "approved" | "rejected") => {
    if (!member) return;
    const reason = requestStatusReason(status, "this volunteer application");
    if (!reason) return;
    setWorking(true);
    try {
      const saved = await updateVolunteerStatus(member.id, status, reason);
      setMember(saved.member);
      if (saved.email_error) {
        alert(`Volunteer status updated, but the email could not be sent: ${saved.email_error}`);
      }
      setVolunteerCertUrl(null);
    } finally {
      setWorking(false);
    }
  };

  const handleGenerate = async () => {
    if (!member) return;
    setWorking(true);
    try {
      const templateSettings = await getLifeCertificateSettings();
      const generationEditorState = placementDirty
        ? editorState
        : normalizeLifeCertificateEditorState(templateSettings.editorState);
      const savedMember = placementDirty
        ? await updateMemberCertificateEditorState(member.id, generationEditorState)
        : member;
      setMember(savedMember);
      setEditorState(generationEditorState);
      const [cert, { front, back }] = await Promise.all([
        generateCertificate(savedMember, { editorState: generationEditorState }),
        generateIdCard(savedMember),
      ]);
      setCertUrl(cert);
      setCardFront(front);
      setCardBack(back);
    } finally {
      setWorking(false);
    }
  };

  const handleGenerateVolunteerCertificate = async () => {
    if (!member || member.volunteer_status !== "approved") return;
    setWorking(true);
    try {
      const templateSettings = await getLifeCertificateSettings();
      const generationEditorState = placementDirty
        ? editorState
        : normalizeLifeCertificateEditorState(templateSettings.editorState);
      const savedMember = placementDirty
        ? await updateMemberCertificateEditorState(member.id, generationEditorState)
        : member;
      setMember(savedMember);
      setEditorState(generationEditorState);
      const cert = await generateVolunteerCertificate(savedMember, { editorState: generationEditorState });
      setVolunteerCertUrl(cert);
      setActivePreview("volunteer");
    } finally {
      setWorking(false);
    }
  };

  const savePlacement = async () => {
    if (!member) return;
    setWorking(true);
    try {
      const savedMember = await updateMemberCertificateEditorState(member.id, editorState);
      setMember(savedMember);
      const draft = await generateCertificate(savedMember, { editorState });
      setCertUrl(draft);
      setActivePreview("certificate");
    } finally {
      setWorking(false);
    }
  };

  const updatePlacement = (key: keyof LifeCertificateEditorState, value: number) => {
    setEditorState((current) => ({ ...current, [key]: value }));
    setPlacementDirty(true);
  };

  const updateDraftValue = <K extends keyof AdminMemberDraftValues>(key: K, value: AdminMemberDraftValues[K]) => {
    setDraftValues((current) => current ? { ...current, [key]: value } : current);
    setDraftDirty(true);
    setMessage("");
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#080f20" }}><p className="text-white/40">Loading member...</p></div>;
  }

  if (!member) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#080f20" }}><p className="text-white/40">Member not found.</p></div>;
  }

  const memberCode = member.status === "approved" ? member.membership_id : (member.application_id || member.membership_id);

  return (
    <div className="min-h-screen" style={{ background: "#080f20", color: "#e8e0d0" }}>
      <div className="max-w-6xl mx-auto p-8">
        <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: "rgba(201,168,76,0.2)", color: "#c9a84c" }}>{member.name.charAt(0)}</div>
                <div>
                  <h2 className="text-white font-bold">{member.name}</h2>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "#c9a84c" }}>{member.membership_tier} member</p>
                </div>
              </div>

              {[
                { label: member.status === "approved" ? "Membership ID" : "Application ID", value: memberCode },
                { label: "Email", value: member.email },
                { label: "Phone", value: member.phone },
                { label: "Designation", value: member.designation },
                { label: "Institution", value: member.institution },
                { label: "Status", value: member.status },
                { label: "Volunteer Status", value: member.volunteer_status || "not_applied" },
                { label: "Volunteer No.", value: member.volunteer_number || "-" },
                { label: "Submitted Draft", value: member.certificate_submitted_at ? new Date(member.certificate_submitted_at).toLocaleString("en-IN") : "Not submitted" },
              ].map(({ label, value }) => (
                <div key={label} className="mb-3">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-white/80 text-sm">{value || "-"}</p>
                </div>
              ))}
            </motion.div>

            {draftValues && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Editable Draft Values</h3>
                    <p className="mt-1 text-xs text-white/40">Correct the fields printed on the member draft before approval.</p>
                  </div>
                  <button onClick={saveDraftValues} disabled={working || (!draftDirty && !placementDirty)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50" style={{ background: "rgba(201,168,76,0.16)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.35)" }}>
                    <Save size={13} /> Save Draft
                  </button>
                </div>
                <div className="space-y-3">
                  <AdminDraftInput label="Name" value={draftValues.name} onChange={(value) => updateDraftValue("name", value)} />
                  <AdminDraftInput label="Email" value={draftValues.email} onChange={(value) => updateDraftValue("email", value)} />
                  <AdminDraftInput label="Phone" value={draftValues.phone} onChange={(value) => updateDraftValue("phone", value)} />
                  <label className="block">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">Membership Type</span>
                    <select value={draftValues.membership_tier} onChange={(event) => updateDraftValue("membership_tier", event.target.value as MembershipTier)} className="w-full rounded-lg border border-white/10 bg-[#10182b] px-3 py-2 text-xs text-white outline-none focus:border-[#c9a84c]/50">
                      {MEMBERSHIP_TIERS.map((tier) => <option key={tier.value} value={tier.value}>{tier.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">Category</span>
                    <select value={draftValues.category || ""} onChange={(event) => updateDraftValue("category", event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#10182b] px-3 py-2 text-xs text-white outline-none focus:border-[#c9a84c]/50">
                      {MEMBER_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <AdminDraftInput label="Designation" value={draftValues.designation} onChange={(value) => updateDraftValue("designation", value)} />
                  <AdminDraftInput label="Institution" value={draftValues.institution} onChange={(value) => updateDraftValue("institution", value)} />
                  <AdminDraftInput label="Certificate Detail" value={draftValues.custom_detail || ""} onChange={(value) => updateDraftValue("custom_detail", value)} multiline />
                  <div className="grid grid-cols-2 gap-2">
                    <AdminDraftInput label="City" value={draftValues.city} onChange={(value) => updateDraftValue("city", value)} />
                    <AdminDraftInput label="State" value={draftValues.state} onChange={(value) => updateDraftValue("state", value)} />
                  </div>
                  <AdminDraftInput label="Address" value={draftValues.address} onChange={(value) => updateDraftValue("address", value)} multiline />
                  <AdminDraftInput label="PIN Code" value={draftValues.pincode} onChange={(value) => updateDraftValue("pincode", value)} />
                </div>
                {message && <p className="mt-3 text-xs text-[#c9a84c]">{message}</p>}
              </motion.div>
            )}

            {member.status === "pending" && (
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={working} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}>
                  <Check size={16} /> Approve
                </button>
                <button onClick={handleReject} disabled={working} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                  <X size={16} /> Reject
                </button>
              </div>
            )}

            {member.volunteer_status === "pending" && (
              <div className="flex gap-3">
                <button onClick={() => handleVolunteerStatus("approved")} disabled={working} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}>
                  <Check size={16} /> Approve Volunteer
                </button>
                <button onClick={() => handleVolunteerStatus("rejected")} disabled={working} className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                  <X size={16} /> Reject
                </button>
              </div>
            )}

            {member.membership_tier && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Certificate Placeholder Centers</h3>
                    <p className="mt-1 text-xs text-white/40">Adjust X/Y centers and font sizes for the certificate text.</p>
                  </div>
                  <button onClick={savePlacement} disabled={working} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-60" style={{ background: "rgba(201,168,76,0.16)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.35)" }}>
                    <Save size={13} /> Save
                  </button>
                </div>
                <div className="space-y-4">
                  <PlacementGroup title="OF text">
                    <PlacementInput label="X" value={editorState.certificateOfX} onChange={(value) => updatePlacement("certificateOfX", value)} />
                    <PlacementInput label="Y" value={editorState.certificateOfY} onChange={(value) => updatePlacement("certificateOfY", value)} />
                    <PlacementInput label="Size" value={editorState.certificateOfFontSize} onChange={(value) => updatePlacement("certificateOfFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="Type under CERTIFICATE">
                    <PlacementInput label="X" value={editorState.certificateTypeX} onChange={(value) => updatePlacement("certificateTypeX", value)} />
                    <PlacementInput label="Y" value={editorState.certificateTypeY} onChange={(value) => updatePlacement("certificateTypeY", value)} />
                    <PlacementInput label="Size" value={editorState.certificateTypeFontSize} onChange={(value) => updatePlacement("certificateTypeFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="Name">
                    <PlacementInput label="X" value={editorState.nameX} onChange={(value) => updatePlacement("nameX", value)} />
                    <PlacementInput label="Y" value={editorState.nameY} onChange={(value) => updatePlacement("nameY", value)} />
                    <PlacementInput label="Size" value={editorState.nameFontSize} onChange={(value) => updatePlacement("nameFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="Designation">
                    <PlacementInput label="X" value={editorState.designationX} onChange={(value) => updatePlacement("designationX", value)} />
                    <PlacementInput label="Y" value={editorState.designationY} onChange={(value) => updatePlacement("designationY", value)} />
                    <PlacementInput label="Size" value={editorState.designationFontSize} onChange={(value) => updatePlacement("designationFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="Specify Title / Institution / Place">
                    <PlacementInput label="X" value={editorState.detailX} onChange={(value) => updatePlacement("detailX", value)} />
                    <PlacementInput label="Y" value={editorState.detailY} onChange={(value) => updatePlacement("detailY", value)} />
                    <PlacementInput label="Size" value={editorState.detailFontSize} onChange={(value) => updatePlacement("detailFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="LISA Number">
                    <PlacementInput label="X" value={editorState.membershipX} onChange={(value) => updatePlacement("membershipX", value)} />
                    <PlacementInput label="Y" value={editorState.membershipY} onChange={(value) => updatePlacement("membershipY", value)} />
                    <PlacementInput label="Size" value={editorState.membershipFontSize} onChange={(value) => updatePlacement("membershipFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="Issue Date">
                    <PlacementInput label="X" value={editorState.dateX} onChange={(value) => updatePlacement("dateX", value)} />
                    <PlacementInput label="Y" value={editorState.dateY} onChange={(value) => updatePlacement("dateY", value)} />
                    <PlacementInput label="Size" value={editorState.dateFontSize} onChange={(value) => updatePlacement("dateFontSize", value)} />
                  </PlacementGroup>
                  <PlacementGroup title="Photo">
                    <PlacementInput label="X" value={editorState.photoX} onChange={(value) => updatePlacement("photoX", value)} />
                    <PlacementInput label="Y" value={editorState.photoY} onChange={(value) => updatePlacement("photoY", value)} />
                    <PlacementInput label="Radius" value={editorState.photoRadius} onChange={(value) => updatePlacement("photoRadius", value)} />
                  </PlacementGroup>
                </div>
              </motion.div>
            )}

            {member.status === "approved" && (
              <button onClick={handleGenerate} disabled={working} className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}>
                <Award size={16} />
                {working ? "Generating..." : "Generate Final Certificate & ID Card"}
              </button>
            )}

            {member.volunteer_status === "approved" && (
              <button onClick={handleGenerateVolunteerCertificate} disabled={working} className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60" style={{ background: "rgba(201,168,76,0.16)", color: "#f0d080", border: "1px solid rgba(201,168,76,0.35)" }}>
                <Award size={16} />
                {working ? "Generating..." : "Generate Volunteer Certificate"}
              </button>
            )}
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex gap-2 mb-6 flex-wrap">
              {[
                { id: "draft" as const, label: "Submitted Draft", Icon: Award, enabled: !!member.certificate_draft_data_url },
                { id: "certificate" as const, label: "Final Certificate", Icon: Award, enabled: !!certUrl },
                { id: "volunteer" as const, label: "Volunteer Certificate", Icon: Award, enabled: !!volunteerCertUrl },
                { id: "card" as const, label: "ID Card", Icon: CreditCard, enabled: !!cardFront && !!cardBack },
              ].map(({ id, label, Icon, enabled }) => (
                <button key={id} onClick={() => enabled && setActivePreview(id)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: activePreview === id ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)", color: enabled ? (activePreview === id ? "#c9a84c" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.25)", border: activePreview === id ? "1px solid rgba(201,168,76,0.4)" : "1px solid transparent" }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {activePreview === "draft" && (
              member.certificate_draft_data_url ? (
                <img src={member.certificate_draft_data_url} alt="Submitted draft" className="w-full rounded-xl border border-white/10" />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/30"><Award size={40} className="mb-4 opacity-20" /><p className="text-sm">No draft has been submitted yet.</p></div>
              )
            )}

            {activePreview === "volunteer" && (
              volunteerCertUrl ? (
                <>
                  <img src={volunteerCertUrl} alt="Volunteer Certificate Preview" className="w-full rounded-xl border border-white/10 mb-4" />
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => downloadImage(volunteerCertUrl, `volunteer-certificate-${member.volunteer_number || member.membership_id}.jpg`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      <Download size={14} /> Download JPG
                    </button>
                    <button onClick={() => printImage(volunteerCertUrl, "LIS Academy Volunteer Certificate")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      <Printer size={14} /> Print
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/30"><Award size={40} className="mb-4 opacity-20" /><p className="text-sm">Generate the volunteer certificate to preview it here.</p></div>
              )
            )}

            {activePreview === "certificate" && (
              certUrl ? (
                <>
                  <img src={certUrl} alt="Certificate Preview" className="w-full rounded-xl border border-white/10 mb-4" />
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => downloadImage(certUrl, `certificate-${member.membership_id}.jpg`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      <Download size={14} /> Download JPG
                    </button>
                    <button onClick={() => printImage(certUrl, "LIS Academy Certificate")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      <Printer size={14} /> Print
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/30"><Award size={40} className="mb-4 opacity-20" /><p className="text-sm">Generate the approved certificate to preview it here.</p></div>
              )
            )}

            {activePreview === "card" && (
              cardFront && cardBack ? (
                <>
                  <div className="space-y-4 mb-4">
                    <img src={cardFront} alt="ID Card Front" className="w-full rounded-xl border border-white/10" />
                    <img src={cardBack} alt="ID Card Back" className="w-full rounded-xl border border-white/10" />
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => downloadImage(cardFront, `idcard-front-${member.membership_id}.png`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      <Download size={14} /> Front PNG
                    </button>
                    <button onClick={() => downloadImage(cardBack, `idcard-back-${member.membership_id}.png`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80" style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                      <Download size={14} /> Back PNG
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/30"><CreditCard size={40} className="mb-4 opacity-20" /><p className="text-sm">Generate the ID card to preview it here.</p></div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AdminDraftInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#c9a84c]/50";
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      {multiline ? (
        <textarea
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

function PlacementGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">{title}</div>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </div>
  );
}

function PlacementInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-white outline-none focus:border-[#c9a84c]/50"
      />
    </label>
  );
}
