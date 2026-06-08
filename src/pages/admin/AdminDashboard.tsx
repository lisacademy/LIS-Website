import { useState, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Settings, LogOut, Globe,
  Phone, Mail, MapPin, Youtube, Facebook, Twitter,
  Linkedin, Instagram, Save, ChevronRight, Menu, X,
  CalendarDays, Plus, Trash2, Edit2, FileText, Images, ReceiptText, type LucideIcon
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { getDefaultSection, getSection, setSection } from "@/lib/contentDb";
import { createAdminMember, getAllMembers, updateMemberStatus, updateVolunteerStatus, deleteMember, MEMBERSHIP_TIERS } from "@/lib/membershipDb";
import { fetchEvents, saveEvent, deleteEvent, type EventItem } from "@/lib/eventsDb";
import { fetchBlogPosts, saveBlogPosts, type BlogPost } from "@/lib/blogDb";
import { fetchCarouselSlides, saveCarouselSlides, type CarouselSlide } from "@/lib/carouselDb";
import { fetchDocumentTemplates, saveDocumentTemplate, type DocumentTemplate } from "@/lib/documentTemplates";
import { fetchDonations, type DonationRecord } from "@/lib/donationDb";
import { normalizeLifeCertificateEditorState } from "@/lib/certificateGenerator";
import type { Member, MemberStatus, MembershipTier } from "@/lib/supabase";
import type { LifeCertificateEditorState } from "@/lib/membershipTypes";

type Tab = "dashboard" | "members" | "donations" | "events" | "blogs" | "carousel" | "templates" | "content" | "social" | "programs_research";

export default function AdminDashboard() {
  const { isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) navigate("/admin");
  }, [isAuthenticated, navigate]);

  const handleLogout = () => { logout(); navigate("/admin"); };

  const navItems: { id: Tab; label: string; Icon: LucideIcon }[] = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { id: "members", label: "Members", Icon: Users },
    { id: "donations", label: "Donations", Icon: ReceiptText },
    { id: "events", label: "Events CMS", Icon: CalendarDays },
    { id: "blogs", label: "Blog CMS", Icon: FileText },
    { id: "carousel", label: "Hero Carousel", Icon: Images },
    { id: "templates", label: "Templates", Icon: Images },
    { id: "programs_research", label: "Program & Research", Icon: Globe },
    { id: "content", label: "Site Content", Icon: Globe },
    { id: "social", label: "Social Links", Icon: Settings },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#080f20", color: "#e8e0d0" }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300"
        style={{
          width: sidebarOpen ? 240 : 68,
          background: "linear-gradient(180deg, #0d1b3e 0%, #1a3060 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          minHeight: "100vh",
        }}
      >
        {/* Logo area */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <img src="/logo.png" alt="LIS Academy" className="w-9 h-9 object-contain flex-shrink-0" />
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none">LIS Academy</p>
              <p className="text-[#c9a84c] text-[10px] mt-0.5">Admin Panel</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="ml-auto text-white/40 hover:text-white transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium"
              style={{
                background: tab === id ? "rgba(201,168,76,0.15)" : "transparent",
                color: tab === id ? "#c9a84c" : "rgba(255,255,255,0.6)",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen && tab === id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 mx-2 mb-4 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
          style={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "members" && <MembersTab />}
          {tab === "donations" && <DonationsTab />}
          {tab === "events" && <EventsTab />}
          {tab === "blogs" && <BlogsTab />}
          {tab === "carousel" && <CarouselTab />}
          {tab === "templates" && <TemplatesTab />}
          {tab === "programs_research" && <ProgramsResearchTab />}
          {tab === "content" && <ContentTab />}
          {tab === "social" && <SocialTab />}
        </div>
      </div>
    </div>
  );
}

// ─────────── Dashboard overview ────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  useEffect(() => {
    getAllMembers().then(m => setStats({
      total: m.length,
      pending: m.filter(x => x.status === "pending").length,
      approved: m.filter(x => x.status === "approved").length,
    })).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Members", value: stats.total, color: "#c9a84c" },
    { label: "Pending Approval", value: stats.pending, color: "#f97316" },
    { label: "Approved Members", value: stats.approved, color: "#22c55e" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {cards.map(c => (
          <div key={c.label}
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-white/50 text-sm mb-2">{c.label}</p>
            <p className="text-4xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 className="text-white font-semibold mb-4">Quick Tips</h2>
        <ul className="space-y-2 text-white/50 text-sm">
          <li>• Go to <b className="text-white/70">Members</b> to approve pending applications and generate certificates.</li>
          <li>• Go to <b className="text-white/70">Site Content</b> to edit contact information displayed on the website.</li>
          <li>• Go to <b className="text-white/70">Social Links</b> to update the social media URLs shown in the top bar.</li>
          <li>• After editing, content changes are applied instantly (stored in localStorage / Supabase).</li>
        </ul>
      </div>
    </motion.div>
  );
}

// ─────────── Members tab ────────────────────────────────────────
function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "volunteer_pending">("all");
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState(() => emptyMemberForm());
  const [savingMember, setSavingMember] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [bulkWorking, setBulkWorking] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getAllMembers().then(m => { setMembers(m); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = filter === "all"
    ? members
    : filter === "volunteer_pending"
      ? members.filter(m => m.volunteer_status === "pending")
      : members.filter(m => m.status === filter);
  const selectedMembers = members.filter((member) => selectedIds.includes(member.id));
  const pendingMembers = members.filter((member) => member.status === "pending");
  const pendingVolunteers = members.filter((member) => member.volunteer_status === "pending");
  const allVisibleSelected = filtered.length > 0 && filtered.every((member) => selectedIds.includes(member.id));

  const setMemberBusy = (id: string, busy: boolean) => {
    setBusyIds((current) => busy ? [...new Set([...current, id])] : current.filter((value) => value !== id));
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const toggleVisibleSelected = () => {
    const visibleIds = filtered.map((member) => member.id);
    setSelectedIds((current) => {
      if (visibleIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...current, ...visibleIds])];
    });
  };

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    const previous = members;
    setMembers((current) => current.map((member) => member.id === id ? { ...member, status } : member));
    setMemberBusy(id, true);
    try {
      await updateMemberStatus(id, status);
    } catch (error) {
      setMembers(previous);
      alert(error instanceof Error ? error.message : "Failed to update member status.");
    } finally {
      setMemberBusy(id, false);
    }
  };

  const handleVolunteerStatus = async (id: string, status: "approved" | "rejected") => {
    const previous = members;
    setMembers((current) => current.map((member) => member.id === id ? { ...member, volunteer_status: status } : member));
    setMemberBusy(id, true);
    try {
      const saved = await updateVolunteerStatus(id, status);
      setMembers((current) => current.map((member) => member.id === id ? saved : member));
    } catch (error) {
      setMembers(previous);
      alert(error instanceof Error ? error.message : "Failed to update volunteer status.");
    } finally {
      setMemberBusy(id, false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this member? This cannot be undone.")) return;
    const previous = members;
    setMembers((current) => current.filter((member) => member.id !== id));
    setSelectedIds((current) => current.filter((value) => value !== id));
    setMemberBusy(id, true);
    try {
      await deleteMember(id);
    } catch (error) {
      setMembers(previous);
      alert(error instanceof Error ? error.message : "Failed to delete member.");
    } finally {
      setMemberBusy(id, false);
    }
  };

  const handleApproveAllPending = async () => {
    if (pendingMembers.length === 0) return;
    if (!confirm(`Approve all ${pendingMembers.length} pending members?`)) return;
    const pendingIds = pendingMembers.map((member) => member.id);
    const previous = members;
    setBulkWorking(true);
    setBusyIds((current) => [...new Set([...current, ...pendingIds])]);
    setMembers((current) => current.map((member) => pendingIds.includes(member.id) ? { ...member, status: "approved" } : member));
    try {
      await Promise.all(pendingIds.map((id) => updateMemberStatus(id, "approved")));
    } catch (error) {
      setMembers(previous);
      alert(error instanceof Error ? error.message : "Failed to approve all pending members.");
    } finally {
      setBusyIds((current) => current.filter((id) => !pendingIds.includes(id)));
      setBulkWorking(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMembers.length === 0) return;
    if (!confirm(`Delete ${selectedMembers.length} selected member(s)? This cannot be undone.`)) return;
    const ids = selectedMembers.map((member) => member.id);
    const previous = members;
    setBulkWorking(true);
    setBusyIds((current) => [...new Set([...current, ...ids])]);
    setMembers((current) => current.filter((member) => !ids.includes(member.id)));
    setSelectedIds([]);
    try {
      await Promise.all(ids.map((id) => deleteMember(id)));
    } catch (error) {
      setMembers(previous);
      alert(error instanceof Error ? error.message : "Failed to delete selected members.");
    } finally {
      setBusyIds((current) => current.filter((id) => !ids.includes(id)));
      setBulkWorking(false);
    }
  };

  const handleCreateMember = async () => {
    setSavingMember(true);
    try {
      const created = await createAdminMember(newMember);
      setMembers((current) => [created, ...current]);
      setNewMember(emptyMemberForm());
      setAddingMember(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create member.");
    } finally {
      setSavingMember(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: "#f97316", approved: "#22c55e", rejected: "#ef4444",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Members</h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => setAddingMember((value) => !value)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
            style={{ background: "#c9a84c", color: "#0d1b3e" }}
          >
            <Plus size={14} /> {addingMember ? "Close Form" : "Add Member"}
          </button>
          <button
            onClick={handleApproveAllPending}
            disabled={bulkWorking || pendingMembers.length === 0}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
            style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}
          >
            Approve All Pending ({pendingMembers.length})
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={bulkWorking || selectedIds.length === 0}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
            style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}
          >
            Delete Selected ({selectedIds.length})
          </button>
          {(["all", "pending", "approved", "rejected", "volunteer_pending"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: filter === f ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)",
                color: filter === f ? "#c9a84c" : "rgba(255,255,255,0.5)",
                border: filter === f ? "1px solid rgba(201,168,76,0.4)" : "1px solid transparent",
              }}
            >{f === "volunteer_pending" ? `volunteers (${pendingVolunteers.length})` : f}</button>
          ))}
        </div>
      </div>

      {addingMember && (
        <div className="mb-8">
          <Section title="Add Member">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name" value={newMember.name} onChange={v => setNewMember(d => ({ ...d, name: v }))} />
              <Field label="Email" value={newMember.email} onChange={v => setNewMember(d => ({ ...d, email: v }))} />
              <Field label="Phone" value={newMember.phone} onChange={v => setNewMember(d => ({ ...d, phone: v }))} />
              <Field label="Password" value={newMember.password} onChange={v => setNewMember(d => ({ ...d, password: v }))} />
              <Field label="Designation" value={newMember.designation} onChange={v => setNewMember(d => ({ ...d, designation: v }))} />
              <Field label="Institution" value={newMember.institution} onChange={v => setNewMember(d => ({ ...d, institution: v }))} />
              <Field label="City" value={newMember.city} onChange={v => setNewMember(d => ({ ...d, city: v }))} />
              <Field label="State" value={newMember.state} onChange={v => setNewMember(d => ({ ...d, state: v }))} />
              <Field label="PIN Code" value={newMember.pincode} onChange={v => setNewMember(d => ({ ...d, pincode: v }))} />
              <Field label="Photo URL or Data URL" value={newMember.photo_data_url || ""} onChange={v => setNewMember(d => ({ ...d, photo_data_url: v }))} />
            </div>
            <Field label="Address" textarea value={newMember.address} onChange={v => setNewMember(d => ({ ...d, address: v }))} />
            <Field label="Custom Detail" textarea value={newMember.custom_detail} onChange={v => setNewMember(d => ({ ...d, custom_detail: v }))} />
            <div className="grid gap-4 md:grid-cols-3">
              <SelectField
                label="Category"
                value={newMember.category}
                onChange={v => setNewMember(d => ({ ...d, category: v }))}
                options={[
                  "Librarian / Library Staff",
                  "LIS Teacher",
                  "LIS Student",
                  "LIS Research Scholar",
                  "Retired LIS Professional",
                  "Others",
                ]}
              />
              <SelectField
                label="Membership Type"
                value={newMember.membership_tier}
                onChange={v => setNewMember(d => ({ ...d, membership_tier: v as MembershipTier }))}
                options={MEMBERSHIP_TIERS.map(tier => tier.value)}
              />
              <SelectField
                label="Status"
                value={newMember.status || "approved"}
                onChange={v => setNewMember(d => ({ ...d, status: v as MemberStatus }))}
                options={["approved", "pending", "rejected"]}
              />
            </div>
            <button
              onClick={handleCreateMember}
              disabled={savingMember}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}
            >
              <Save size={16} /> {savingMember ? "Creating..." : "Create Member"}
            </button>
          </Section>
        </div>
      )}

      {loading ? (
        <p className="text-white/40 text-center py-12">Loading members…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/40 text-center py-12">No members found.</p>
      ) : (
        <div className="space-y-3">
          <label className="mb-2 flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/60">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelected} className="accent-[#c9a84c]" />
            Select visible
          </label>
          {filtered.map(m => (
            <div key={m.id}
              className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(m.id)}
                onChange={() => toggleSelected(m.id)}
                className="accent-[#c9a84c]"
                aria-label={`Select ${m.name}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{m.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{ background: statusColor[m.status] + "22", color: statusColor[m.status] }}>
                    {m.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                    {m.membership_tier}
                  </span>
                  {m.volunteer_status && m.volunteer_status !== "not_applied" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{ background: m.volunteer_status === "approved" ? "#22c55e22" : m.volunteer_status === "rejected" ? "#ef444422" : "#f9731622", color: m.volunteer_status === "approved" ? "#22c55e" : m.volunteer_status === "rejected" ? "#ef4444" : "#f97316" }}>
                      volunteer {m.volunteer_status}{m.volunteer_number ? ` #${m.volunteer_number}` : ""}
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-1 truncate">{m.email} · {m.status === "approved" ? m.membership_id : (m.application_id || m.membership_id)}</p>
                <p className="text-white/40 text-xs">{m.designation} — {m.institution}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                {m.status === "pending" && (
                  <>
                    <button onClick={() => handleStatus(m.id, "approved")}
                      disabled={busyIds.includes(m.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}>
                      {busyIds.includes(m.id) ? "Working..." : "Approve"}
                    </button>
                    <button onClick={() => handleStatus(m.id, "rejected")}
                      disabled={busyIds.includes(m.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                      Reject
                    </button>
                  </>
                )}
                {m.volunteer_status === "pending" && (
                  <>
                    <button onClick={() => handleVolunteerStatus(m.id, "approved")}
                      disabled={busyIds.includes(m.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}>
                      Approve Volunteer
                    </button>
                    <button onClick={() => handleVolunteerStatus(m.id, "rejected")}
                      disabled={busyIds.includes(m.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
                      style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                      Reject Volunteer
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate(`/admin/members/${m.id}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}>
                  View / Certificate
                </button>
                <button onClick={() => handleDelete(m.id)}
                  disabled={busyIds.includes(m.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: "#ef444410", color: "#ef4444aa", border: "1px solid #ef444422" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────── Site content tab ────────────────────────────────────
function DonationsTab() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchDonations()
      .then(setDonations)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Failed to load donations."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const totalAmount = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
  const syncedCount = donations.filter((donation) => donation.sheet_sync_status === "synced").length;
  const failedCount = donations.filter((donation) => donation.sheet_sync_status === "failed").length;
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 2 }).format(amount);
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const syncColor: Record<DonationRecord["sheet_sync_status"], string> = {
    synced: "#22c55e",
    failed: "#ef4444",
    pending: "#f97316",
    not_configured: "#94a3b8",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Donations</h1>
          <p className="mt-1 text-sm text-white/40">Payment confirmations submitted from the Donate page.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50"
          style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <DonationStat label="Total Received" value={formatAmount(totalAmount, "INR")} color="#c9a84c" />
        <DonationStat label="Entries" value={donations.length.toString()} color="#38bdf8" />
        <DonationStat label="Sheets Synced" value={syncedCount.toString()} color="#22c55e" />
        <DonationStat label="Sheets Failed" value={failedCount.toString()} color="#ef4444" />
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-white/40 py-12">Loading donations...</p>
      ) : donations.length === 0 ? (
        <p className="text-center text-white/40 py-12">No donation records yet.</p>
      ) : (
        <div className="space-y-3">
          {donations.map((donation) => (
            <div
              key={donation.id}
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{donation.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                      style={{ background: `${syncColor[donation.sheet_sync_status]}22`, color: syncColor[donation.sheet_sync_status] }}
                    >
                      Sheets {donation.sheet_sync_status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/45">{donation.designation}</p>
                  <p className="mt-1 text-xs text-white/40">{donation.email} - {donation.phone}</p>
                  <p className="mt-2 text-xs text-white/35">Submitted {formatDate(donation.created_at)}</p>
                </div>
                <div className="lg:text-right">
                  <p className="text-2xl font-bold" style={{ color: "#c9a84c" }}>
                    {formatAmount(donation.amount, donation.currency)}
                  </p>
                  <p className="mt-1 text-xs text-white/45">{donation.payment_mode}</p>
                  <p className="mt-2 rounded-lg bg-black/20 px-3 py-2 text-xs font-medium text-white/65">
                    Transaction ID: {donation.transaction_id}
                  </p>
                </div>
              </div>
              {donation.sheet_sync_error && (
                <p className="mt-3 rounded-lg border border-red-400/10 bg-red-400/5 px-3 py-2 text-xs text-red-200">
                  {donation.sheet_sync_error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function DonationStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function ContentTab() {
  const [data, setData] = useState(() => ({
    ...getDefaultSection("contact"),
    ...getDefaultSection("hero"),
    donateHeadline: getDefaultSection("donate").headline || "",
    donateIntro: getDefaultSection("donate").intro || "",
    donateNote: getDefaultSection("donate").note || "",
    marqueeText: getDefaultSection("marquee").text || "",
    marqueeEnabled: getDefaultSection("marquee").enabled || "true",
  }));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSection("contact"), getSection("hero"), getSection("donate"), getSection("marquee")])
      .then(([contact, hero, donate, marquee]) => setData({
        ...contact,
        ...hero,
        donateHeadline: donate.headline || "",
        donateIntro: donate.intro || "",
        donateNote: donate.note || "",
        marqueeText: marquee.text || "",
        marqueeEnabled: marquee.enabled || "true",
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await setSection("contact", {
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
    });
    await setSection("hero", {
      headline: data.headline || "",
      subtitle: data.subtitle || "",
    });
    await setSection("donate", {
      headline: data.donateHeadline || "",
      intro: data.donateIntro || "",
      note: data.donateNote || "",
    });
    await setSection("marquee", {
      text: data.marqueeText || "",
      enabled: data.marqueeEnabled || "true",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold text-white mb-8">Site Content</h1>
      {loading && <p className="text-white/40 text-sm mb-4">Loading saved content...</p>}
      <div className="space-y-6">
        <Section title="Contact Information">
          <Field label="Email" icon={<Mail size={14} />} value={data.email || ""} onChange={v => setData(d => ({ ...d, email: v }))} />
          <Field label="Phone" icon={<Phone size={14} />} value={data.phone || ""} onChange={v => setData(d => ({ ...d, phone: v }))} />
          <Field label="Address" icon={<MapPin size={14} />} value={data.address || ""} onChange={v => setData(d => ({ ...d, address: v }))} textarea />
        </Section>
        <Section title="Hero Section">
          <Field label="Headline" value={data.headline || ""} onChange={v => setData(d => ({ ...d, headline: v }))} />
          <Field label="Subtitle" value={data.subtitle || ""} onChange={v => setData(d => ({ ...d, subtitle: v }))} textarea />
        </Section>
        <Section title="Marquee / Breaking News Strip">
          <p className="text-white/40 text-xs mb-3">This red strip scrolls above the hero carousel. Separate items with  &nbsp;<code className="text-[#c9a84c]">|</code>&nbsp;  for visual separation.</p>
          <Field label="Marquee Text" value={data.marqueeText || ""} onChange={v => setData(d => ({ ...d, marqueeText: v }))} textarea />
          <div className="flex items-center gap-3 mt-1">
            <label className="text-white/40 text-xs uppercase tracking-wider">Strip Visible?</label>
            <button
              type="button"
              onClick={() => setData(d => ({ ...d, marqueeEnabled: d.marqueeEnabled === "true" ? "false" : "true" }))}
              className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: data.marqueeEnabled === "true" ? "#dc2626" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: data.marqueeEnabled === "true" ? "calc(100% - 18px)" : 2 }}
              />
            </button>
            <span className="text-xs" style={{ color: data.marqueeEnabled === "true" ? "#f87171" : "rgba(255,255,255,0.3)" }}>
              {data.marqueeEnabled === "true" ? "Enabled" : "Disabled"}
            </span>
          </div>
        </Section>
        <Section title="Donate Us Section">
          <Field label="Donation Headline" value={data.donateHeadline || ""} onChange={v => setData(d => ({ ...d, donateHeadline: v }))} />
          <Field label="Donation Intro" value={data.donateIntro || ""} onChange={v => setData(d => ({ ...d, donateIntro: v }))} textarea />
          <Field label="Donation Note" value={data.donateNote || ""} onChange={v => setData(d => ({ ...d, donateNote: v }))} textarea />
        </Section>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}>
          <Save size={16} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────── Social links tab ────────────────────────────────────
function SocialTab() {
  const [data, setData] = useState(() => getDefaultSection("social"));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSection("social").then(setData).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await setSection("social", data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const socialFields = [
    { key: "facebook", label: "Facebook URL", Icon: Facebook },
    { key: "twitter", label: "Twitter / X URL", Icon: Twitter },
    { key: "linkedin", label: "LinkedIn URL", Icon: Linkedin },
    { key: "youtube", label: "YouTube URL", Icon: Youtube },
    { key: "instagram", label: "Instagram URL", Icon: Instagram },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold text-white mb-8">Social Media Links</h1>
      <p className="text-white/40 text-sm mb-6">These URLs are displayed in the top bar social icons.</p>
      {loading && <p className="text-white/40 text-sm mb-4">Loading saved links...</p>}
      <div className="space-y-6">
        <Section title="Social Profiles">
          {socialFields.map(({ key, label, Icon }) => (
            <Field key={key} label={label} icon={<Icon size={14} />}
              value={data[key] || ""} onChange={v => setData(d => ({ ...d, [key]: v }))} />
          ))}
        </Section>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}>
          <Save size={16} />
          {saved ? "Saved!" : "Save Social Links"}
        </button>
      </div>
    </motion.div>
  );
}

// ─────────── Shared UI primitives ───────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 space-y-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, textarea = false, icon, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; icon?: React.ReactNode; type?: string;
}) {
  const sharedStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    padding: icon ? "10px 12px 10px 34px" : "10px 12px",
    outline: "none",
    resize: "none" as const,
  };

  return (
    <div>
      <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" style={{ pointerEvents: "none" }}>
            {icon}
          </span>
        )}
        {textarea ? (
          <textarea rows={3} style={sharedStyle} value={value} onChange={e => onChange(e.target.value)} />
        ) : (
          <input type={type} style={sharedStyle} value={value} onChange={e => onChange(e.target.value)} />
        )}
      </div>
    </div>
  );
}

function ListField({
  label, values, onChange, placeholder,
}: {
  label: string; values: string[]; onChange: (values: string[]) => void; placeholder: string;
}) {
  const rows = values.length > 0 ? values : [""];
  const updateRow = (index: number, value: string) => {
    const next = [...rows];
    next[index] = value;
    onChange(next);
  };

  return (
    <div>
      <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="space-y-2">
        {rows.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={value}
              placeholder={placeholder}
              onChange={(event) => updateRow(index, event.target.value)}
              className="min-w-0 flex-1 rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
              className="rounded-lg border border-red-400/25 bg-red-400/10 px-3 text-red-300"
              aria-label={`Remove ${label} row ${index + 1}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...rows, ""])}
          className="inline-flex items-center gap-2 rounded-lg border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-3 py-2 text-xs font-semibold text-[#f0d080]"
        >
          <Plus size={14} /> Add Row
        </button>
      </div>
    </div>
  );
}

// ─────────── Events tab ────────────────────────────────────
function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[10px] border border-white/10 bg-[#111b32] px-3 py-2.5 text-[13px] text-white outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function emptyMemberForm() {
  return {
    name: "",
    email: "",
    phone: "",
    password: "",
    category: "Librarian / Library Staff",
    custom_detail: "",
    designation: "",
    institution: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    membership_tier: "life" as MembershipTier,
    status: "approved" as MemberStatus,
    photo_data_url: "",
  };
}

function EventsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventItem | Partial<EventItem> | null>(null);

  const load = () => {
    setLoading(true);
    fetchEvents().then(data => { setEvents(data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id: string | undefined) => {
    if (!id || !confirm("Delete this event?")) return;
    await deleteEvent(id);
    load();
  };

  const handleSave = async () => {
    if (!editingEvent?.title) return alert("Title is required");
    const cleanSpeakers = (editingEvent.speakers || []).map(item => item.trim()).filter(Boolean);
    const cleanAgenda = (editingEvent.agenda || []).map(item => item.trim()).filter(Boolean);
    const payload: EventItem | Omit<EventItem, "id"> = editingEvent.id
      ? {
          id: editingEvent.id,
          title: editingEvent.title || "",
          date: editingEvent.date || "",
          location: editingEvent.location || "",
          type: editingEvent.type || "Conference",
          description: editingEvent.description || "",
          speakers: cleanSpeakers,
          agenda: cleanAgenda,
          image_url: editingEvent.image_url || "",
          registration_url: editingEvent.registration_url || "",
          brochure_url: editingEvent.brochure_url || "",
          gallery_url: editingEvent.gallery_url || "",
          report_url: editingEvent.report_url || "",
          is_featured: Boolean(editingEvent.is_featured),
          sort_order: Number(editingEvent.sort_order || 0),
          created_at: editingEvent.created_at,
          updated_at: editingEvent.updated_at,
        }
      : {
          title: editingEvent.title || "",
          date: editingEvent.date || "",
          location: editingEvent.location || "",
          type: editingEvent.type || "Conference",
          description: editingEvent.description || "",
          speakers: cleanSpeakers,
          agenda: cleanAgenda,
          image_url: editingEvent.image_url || "",
          registration_url: editingEvent.registration_url || "",
          brochure_url: editingEvent.brochure_url || "",
          gallery_url: editingEvent.gallery_url || "",
          report_url: editingEvent.report_url || "",
          is_featured: Boolean(editingEvent.is_featured),
          sort_order: Number(editingEvent.sort_order || 0),
        };
    await saveEvent(payload);
    setEditingEvent(null);
    load();
  };

  if (editingEvent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">{editingEvent.id ? 'Edit Event' : 'New Event'}</h1>
          <button onClick={() => setEditingEvent(null)} className="text-white/50 hover:text-white transition-all text-sm">Cancel</button>
        </div>
        <div className="space-y-6">
          <Section title="Event Details">
            <Field label="Title" value={editingEvent.title || ""} onChange={v => setEditingEvent({ ...editingEvent, title: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" type="date" value={editingEvent.date || ""} onChange={v => setEditingEvent({ ...editingEvent, date: v })} />
              <Field label="Location" value={editingEvent.location || ""} onChange={v => setEditingEvent({ ...editingEvent, location: v })} />
            </div>
            <Field label="Type (e.g. Conference, Workshop)" value={editingEvent.type || ""} onChange={v => setEditingEvent({ ...editingEvent, type: v })} />
            <Field label="Description" textarea value={editingEvent.description || ""} onChange={v => setEditingEvent({ ...editingEvent, description: v })} />
          </Section>
          <Section title="Additional Info">
            <ListField
              label="Speakers"
              values={editingEvent.speakers || []}
              placeholder="Speaker name"
              onChange={values => setEditingEvent({ ...editingEvent, speakers: values })}
            />
            <ListField
              label="Agenda"
              values={editingEvent.agenda || []}
              placeholder="Agenda item"
              onChange={values => setEditingEvent({ ...editingEvent, agenda: values })}
            />
            <Field label="Image URL" value={editingEvent.image_url || ""} onChange={v => setEditingEvent({ ...editingEvent, image_url: v })} />
            <Field label="Conference Brochure URL" value={editingEvent.brochure_url || ""} onChange={v => setEditingEvent({ ...editingEvent, brochure_url: v })} />
            <Field label="Photo Gallery URL" value={editingEvent.gallery_url || ""} onChange={v => setEditingEvent({ ...editingEvent, gallery_url: v })} />
            <Field label="Conference Report URL" value={editingEvent.report_url || ""} onChange={v => setEditingEvent({ ...editingEvent, report_url: v })} />
            <Field label="Registration URL" value={editingEvent.registration_url || ""} onChange={v => setEditingEvent({ ...editingEvent, registration_url: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sort Order" value={String(editingEvent.sort_order || 0)} onChange={v => setEditingEvent({ ...editingEvent, sort_order: Number(v || 0) })} />
              <label className="flex items-center gap-3 pt-6 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={Boolean(editingEvent.is_featured)}
                  onChange={e => setEditingEvent({ ...editingEvent, is_featured: e.target.checked })}
                  className="h-4 w-4 accent-[#c9a84c]"
                />
                Featured on home page
              </label>
            </div>
          </Section>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}>
            <Save size={16} /> Save Event
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Events CMS</h1>
        <button onClick={() => setEditingEvent({ title: '', date: '', location: '', type: 'Conference', description: '', speakers: [], agenda: [], image_url: '', brochure_url: '', gallery_url: '', report_url: '', registration_url: '', is_featured: true, sort_order: events.length * 10 + 10 })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#c9a84c", color: "#0d1b3e" }}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      {loading ? <p className="text-white/40 text-center py-12">Loading events...</p> : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-white/10 bg-white/5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{event.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>{event.type}</span>
                </div>
                <p className="text-white/40 text-xs mt-1">{event.date} · {event.location}</p>
                <p className="text-white/30 text-xs truncate">{event.brochure_url || event.registration_url || event.gallery_url || event.report_url || "No event links yet"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingEvent(event)} className="p-2 rounded-lg text-white/50 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all border border-transparent hover:border-[#c9a84c]/30">
                   <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/30">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function BlogsTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const load = () => {
    setLoading(true);
    fetchBlogPosts().then(data => { setPosts(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async () => {
    if (!editingPost?.title.trim()) return alert("Blog title is required.");
    const nextPosts = posts.some(post => post.id === editingPost.id)
      ? posts.map(post => post.id === editingPost.id ? editingPost : post)
      : [editingPost, ...posts];
    await saveBlogPosts(nextPosts);
    setEditingPost(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await saveBlogPosts(posts.filter(post => post.id !== id));
    load();
  };

  if (editingPost) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">{posts.some(post => post.id === editingPost.id) ? "Edit Blog" : "New Blog"}</h1>
          <button onClick={() => setEditingPost(null)} className="text-white/50 hover:text-white transition-all text-sm">Cancel</button>
        </div>
        <Section title="Blog Details">
          <Field label="Title" value={editingPost.title} onChange={v => setEditingPost({ ...editingPost, title: v })} />
          <Field label="Author" value={editingPost.author} onChange={v => setEditingPost({ ...editingPost, author: v })} />
          <Field label="Image URL" value={editingPost.image_url} onChange={v => setEditingPost({ ...editingPost, image_url: v })} />
          <Field label="Article Text" textarea value={editingPost.text} onChange={v => setEditingPost({ ...editingPost, text: v })} />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}
          >
            <Save size={16} /> Save Blog
          </button>
        </Section>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Blog CMS</h1>
        <button
          onClick={() => setEditingPost({ id: crypto.randomUUID(), title: "", author: "", text: "", image_url: "", published_at: new Date().toISOString() })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#c9a84c", color: "#0d1b3e" }}
        >
          <Plus size={16} /> Add Blog
        </button>
      </div>
      {loading ? <p className="text-white/40 text-center py-12">Loading blogs...</p> : (
        <div className="space-y-3">
          {posts.length === 0 && <p className="text-white/40 text-center py-12">No blog posts yet.</p>}
          {posts.map(post => (
            <div key={post.id} className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-white/10 bg-white/5">
              {post.image_url && <img src={post.image_url} alt="" className="h-16 w-24 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{post.title}</p>
                <p className="text-white/40 text-xs mt-1">By {post.author || "LIS Academy"}</p>
                <p className="text-white/30 text-xs truncate">{post.text}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingPost(post)} className="p-2 rounded-lg text-white/50 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all border border-transparent hover:border-[#c9a84c]/30">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/30">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function CarouselTab() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetchCarouselSlides().then(data => { setSlides(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  const updateSlide = (id: string, patch: Partial<CarouselSlide>) => {
    setSlides(current => current.map(slide => slide.id === id ? { ...slide, ...patch } : slide));
  };

  const handleSave = async () => {
    await saveCarouselSlides(slides);
    load();
  };

  const addSlide = () => {
    setSlides(current => [
      ...current,
      { id: crypto.randomUUID(), image_url: "", title: "", sort_order: current.length * 10 + 10 },
    ]);
  };

  const removeSlide = (id: string) => {
    setSlides(current => current.filter(slide => slide.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hero Carousel</h1>
          <p className="mt-2 text-sm text-white/40">Add image links and control sequencing with sort order. Lower numbers appear first.</p>
        </div>
        <button
          onClick={addSlide}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#c9a84c", color: "#0d1b3e" }}
        >
          <Plus size={16} /> Add Slide
        </button>
      </div>
      {loading ? <p className="text-white/40 text-center py-12">Loading carousel...</p> : (
        <div className="space-y-4">
          {slides.length === 0 && <p className="text-white/40 text-center py-12">No admin carousel slides yet. The homepage will use event images until you add slides here.</p>}
          {slides.map(slide => (
            <Section key={slide.id} title={slide.title || "Carousel Slide"}>
              <div className="grid gap-4 md:grid-cols-[140px,1fr] md:items-start">
                <div className="h-24 overflow-hidden rounded-xl bg-white/5">
                  {slide.image_url ? <img src={slide.image_url} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="space-y-4">
                  <Field label="Image Link" value={slide.image_url} onChange={v => updateSlide(slide.id, { image_url: v })} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title / Label" value={slide.title} onChange={v => updateSlide(slide.id, { title: v })} />
                    <Field label="Sort Order" value={String(slide.sort_order)} onChange={v => updateSlide(slide.id, { sort_order: Number(v || 0) })} />
                  </div>
                  <button
                    onClick={() => removeSlide(slide.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300"
                  >
                    <Trash2 size={14} /> Remove Slide
                  </button>
                </div>
              </div>
            </Section>
          ))}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}
          >
            <Save size={16} /> Save Carousel
          </button>
        </div>
      )}
    </motion.div>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = () => {
    setLoading(true);
    fetchDocumentTemplates()
      .then((data) => {
        setTemplates(data);
        setDrafts(
          data.reduce<Record<string, string>>((acc, template) => {
            acc[template.key] = JSON.stringify(template.field_map || {}, null, 2);
            return acc;
          }, {}),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (template: DocumentTemplate) => {
    setMessage("");
    setSavingKey(template.key);
    try {
      const fieldMap = drafts[template.key]?.trim() ? JSON.parse(drafts[template.key]) : {};
      await saveDocumentTemplate({ ...template, field_map: fieldMap });
      setMessage("Template settings saved.");
      load();
    } catch (error) {
      setMessage(error instanceof SyntaxError ? "Field map JSON is invalid." : "Could not save template settings.");
    } finally {
      setSavingKey(null);
    }
  };

  const updateTemplate = (key: string, patch: Partial<DocumentTemplate>) => {
    setTemplates((current) => current.map((template) => template.key === key ? { ...template, ...patch } : template));
  };

  const getLifeSettings = (template: DocumentTemplate) => {
    const source = template.field_map?.lifeCertificate && typeof template.field_map.lifeCertificate === "object"
      ? template.field_map.lifeCertificate as Record<string, unknown>
      : {};
    return {
      draftTemplateUrl: typeof source.draftTemplateUrl === "string" && source.draftTemplateUrl ? source.draftTemplateUrl : "/membership/No_sign-01.png",
      finalTemplateUrl: typeof source.finalTemplateUrl === "string" && source.finalTemplateUrl ? source.finalTemplateUrl : template.template_url || "/membership/withsign-01.png",
      editorState: normalizeLifeCertificateEditorState(source.editorState as Partial<LifeCertificateEditorState> | undefined),
    };
  };

  const updateLifeSettings = (template: DocumentTemplate, patch: Partial<ReturnType<typeof getLifeSettings>>) => {
    const current = getLifeSettings(template);
    const nextSettings = {
      ...current,
      ...patch,
      editorState: patch.editorState ? normalizeLifeCertificateEditorState(patch.editorState) : current.editorState,
    };
    const nextFieldMap = {
      ...(template.field_map || {}),
      lifeCertificate: nextSettings,
    };
    updateTemplate(template.key, {
      template_url: nextSettings.finalTemplateUrl,
      field_map: nextFieldMap,
    });
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [template.key]: JSON.stringify(nextFieldMap, null, 2),
    }));
  };

  const updateLifeEditor = (template: DocumentTemplate, key: keyof LifeCertificateEditorState, value: number) => {
    const settings = getLifeSettings(template);
    updateLifeSettings(template, {
      editorState: {
        ...settings.editorState,
        [key]: value,
      },
    });
  };

  const readUpload = (file: File | null, onReady: (dataUrl: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onReady(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSaveLifeCertificate = async (template: DocumentTemplate) => {
    setMessage("");
    setSavingKey(template.key);
    try {
      await saveDocumentTemplate(template);
      setMessage("Certificate defaults saved for all generated certificates.");
      load();
    } catch {
      setMessage("Could not save certificate defaults.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold text-white mb-3">Document Templates</h1>
      <p className="text-white/45 text-sm mb-8">
        Paste public Canva export image URLs here. The generator overlays member data from the persisted membership record, including the membership ID.
      </p>
      {message && <p className="text-sm mb-4" style={{ color: message.includes("saved") ? "#22c55e" : "#ef4444" }}>{message}</p>}
      {loading ? (
        <p className="text-white/40 text-center py-12">Loading templates...</p>
      ) : (
        <div className="space-y-6">
          {templates.map((template) => (
            <Section key={template.key} title={template.label}>
              {template.key === "certificate" ? (
                <LifeCertificateTemplateEditor
                  template={template}
                  settings={getLifeSettings(template)}
                  saving={savingKey === template.key}
                  onLabelChange={(label) => updateTemplate(template.key, { label })}
                  onUploadDraft={(file) => readUpload(file, (dataUrl) => updateLifeSettings(template, { draftTemplateUrl: dataUrl }))}
                  onUploadFinal={(file) => readUpload(file, (dataUrl) => updateLifeSettings(template, { finalTemplateUrl: dataUrl }))}
                  onEditorChange={(key, value) => updateLifeEditor(template, key, value)}
                  onSave={() => handleSaveLifeCertificate(template)}
                />
              ) : (
                <>
                  <Field label="Label" value={template.label} onChange={v => updateTemplate(template.key, { label: v })} />
                  <Field label="Canva Export / Template Image URL" value={template.template_url} onChange={v => updateTemplate(template.key, { template_url: v })} />
                  <Field
                    label="Field Map JSON"
                    textarea
                    value={drafts[template.key] || "{}"}
                    onChange={v => setDrafts(current => ({ ...current, [template.key]: v }))}
                  />
                  <button
                    onClick={() => handleSave(template)}
                    disabled={savingKey === template.key}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}
                  >
                    <Save size={16} /> {savingKey === template.key ? "Saving..." : "Save Template"}
                  </button>
                </>
              )}
            </Section>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────── Programs & Research tab ────────────────────────────────────
function LifeCertificateTemplateEditor({
  template,
  settings,
  saving,
  onLabelChange,
  onUploadDraft,
  onUploadFinal,
  onEditorChange,
  onSave,
}: {
  template: DocumentTemplate;
  settings: { draftTemplateUrl: string; finalTemplateUrl: string; editorState: LifeCertificateEditorState };
  saving: boolean;
  onLabelChange: (label: string) => void;
  onUploadDraft: (file: File | null) => void;
  onUploadFinal: (file: File | null) => void;
  onEditorChange: (key: keyof LifeCertificateEditorState, value: number) => void;
  onSave: () => void;
}) {
  const uploadCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-[#c9a84c] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#0d1b3e]";
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const beginDrag = (event: ReactPointerEvent, xKey: keyof LifeCertificateEditorState, yKey: keyof LifeCertificateEditorState) => {
    event.preventDefault();
    const move = (pointerEvent: PointerEvent) => {
      const image = imageRef.current;
      if (!image) return;
      const rect = image.getBoundingClientRect();
      const naturalWidth = image.naturalWidth || 1876;
      const naturalHeight = image.naturalHeight || 1438;
      const x = Math.max(0, Math.min(naturalWidth, ((pointerEvent.clientX - rect.left) / rect.width) * naturalWidth));
      const y = Math.max(0, Math.min(naturalHeight, ((pointerEvent.clientY - rect.top) / rect.height) * naturalHeight));
      onEditorChange(xKey, Math.round(x));
      onEditorChange(yKey, Math.round(y));
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  const markerStyle = (x: number, y: number) => {
    const image = imageRef.current;
    const width = image?.naturalWidth || 1876;
    const height = image?.naturalHeight || 1438;
    return { left: `${(x / width) * 100}%`, top: `${(y / height) * 100}%` };
  };

  return (
    <div className="space-y-6">
      <Field label="Label" value={template.label} onChange={onLabelChange} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/35">Certificate without sign</label>
          <input type="file" accept="image/*" className={uploadCls} onChange={(event) => onUploadDraft(event.target.files?.[0] || null)} />
          {settings.draftTemplateUrl && <img src={settings.draftTemplateUrl} alt="Unsigned certificate template" className="mt-3 rounded-xl border border-white/10" />}
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/35">Certificate with sign</label>
          <input type="file" accept="image/*" className={uploadCls} onChange={(event) => onUploadFinal(event.target.files?.[0] || null)} />
          {settings.finalTemplateUrl && <img src={settings.finalTemplateUrl} alt="Signed certificate template" className="mt-3 rounded-xl border border-white/10" />}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Drag Placeholder Positions</h3>
        <div ref={previewRef} className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <img ref={imageRef} src={settings.finalTemplateUrl} alt="Certificate placement editor" className="block w-full select-none" draggable={false} />
          <DragMarker label="OF" style={markerStyle(settings.editorState.certificateOfX, settings.editorState.certificateOfY)} onPointerDown={(event) => beginDrag(event, "certificateOfX", "certificateOfY")} />
          <DragMarker label="Type" style={markerStyle(settings.editorState.certificateTypeX, settings.editorState.certificateTypeY)} onPointerDown={(event) => beginDrag(event, "certificateTypeX", "certificateTypeY")} />
          <DragMarker label="Name" style={markerStyle(settings.editorState.nameX, settings.editorState.nameY)} onPointerDown={(event) => beginDrag(event, "nameX", "nameY")} />
          <DragMarker label="Designation" style={markerStyle(settings.editorState.designationX, settings.editorState.designationY)} onPointerDown={(event) => beginDrag(event, "designationX", "designationY")} />
          <DragMarker label="Detail" style={markerStyle(settings.editorState.detailX, settings.editorState.detailY)} onPointerDown={(event) => beginDrag(event, "detailX", "detailY")} />
          <DragMarker label="LISA No." style={markerStyle(settings.editorState.membershipX, settings.editorState.membershipY)} onPointerDown={(event) => beginDrag(event, "membershipX", "membershipY")} />
          <DragMarker label="Date" style={markerStyle(settings.editorState.dateX, settings.editorState.dateY)} onPointerDown={(event) => beginDrag(event, "dateX", "dateY")} />
          <DragMarker label="Photo" style={markerStyle(settings.editorState.photoX, settings.editorState.photoY)} onPointerDown={(event) => beginDrag(event, "photoX", "photoY")} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Default Placeholder Centers</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TemplatePlacementGroup title="OF text">
            <TemplatePlacementInput label="X" value={settings.editorState.certificateOfX} onChange={(value) => onEditorChange("certificateOfX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.certificateOfY} onChange={(value) => onEditorChange("certificateOfY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.certificateOfFontSize} onChange={(value) => onEditorChange("certificateOfFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="Membership type">
            <TemplatePlacementInput label="X" value={settings.editorState.certificateTypeX} onChange={(value) => onEditorChange("certificateTypeX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.certificateTypeY} onChange={(value) => onEditorChange("certificateTypeY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.certificateTypeFontSize} onChange={(value) => onEditorChange("certificateTypeFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="Name">
            <TemplatePlacementInput label="X" value={settings.editorState.nameX} onChange={(value) => onEditorChange("nameX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.nameY} onChange={(value) => onEditorChange("nameY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.nameFontSize} onChange={(value) => onEditorChange("nameFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="Designation">
            <TemplatePlacementInput label="X" value={settings.editorState.designationX} onChange={(value) => onEditorChange("designationX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.designationY} onChange={(value) => onEditorChange("designationY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.designationFontSize} onChange={(value) => onEditorChange("designationFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="Specify Title / Institution / Place">
            <TemplatePlacementInput label="X" value={settings.editorState.detailX} onChange={(value) => onEditorChange("detailX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.detailY} onChange={(value) => onEditorChange("detailY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.detailFontSize} onChange={(value) => onEditorChange("detailFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="LISA number">
            <TemplatePlacementInput label="X" value={settings.editorState.membershipX} onChange={(value) => onEditorChange("membershipX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.membershipY} onChange={(value) => onEditorChange("membershipY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.membershipFontSize} onChange={(value) => onEditorChange("membershipFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="Issue date">
            <TemplatePlacementInput label="X" value={settings.editorState.dateX} onChange={(value) => onEditorChange("dateX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.dateY} onChange={(value) => onEditorChange("dateY", value)} />
            <TemplatePlacementInput label="Size" value={settings.editorState.dateFontSize} onChange={(value) => onEditorChange("dateFontSize", value)} />
          </TemplatePlacementGroup>
          <TemplatePlacementGroup title="Photo">
            <TemplatePlacementInput label="X" value={settings.editorState.photoX} onChange={(value) => onEditorChange("photoX", value)} />
            <TemplatePlacementInput label="Y" value={settings.editorState.photoY} onChange={(value) => onEditorChange("photoY", value)} />
            <TemplatePlacementInput label="Radius" value={settings.editorState.photoRadius} onChange={(value) => onEditorChange("photoRadius", value)} />
          </TemplatePlacementGroup>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}
      >
        <Save size={16} /> {saving ? "Saving..." : "Save Certificate Defaults"}
      </button>
    </div>
  );
}

function TemplatePlacementGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">{title}</div>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </div>
  );
}

function DragMarker({
  label,
  style,
  onPointerDown,
}: {
  label: string;
  style: CSSProperties;
  onPointerDown: (event: ReactPointerEvent) => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border border-white bg-[#0d1b3e] px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg active:cursor-grabbing"
      style={style}
      title={`Drag ${label}`}
    >
      {label}
    </button>
  );
}

function TemplatePlacementInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-white/30">{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-white/10 bg-black/15 px-2 py-2 text-xs text-white outline-none focus:border-[#c9a84c]/50"
      />
    </label>
  );
}

function ProgramsResearchTab() {
  const [data, setData] = useState(() => ({
    ...getDefaultSection("programs"),
    ...getDefaultSection("research"),
    ...getDefaultSection("products"),
  }));
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSection("programs"), getSection("research"), getSection("products")])
      .then(([programs, research, products]) => setData({
        ...programs,
        ...research,
        ...products,
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await setSection("programs", {
      programs_json: data.programs_json || "[]",
    });
    await setSection("research", {
      publications_json: data.publications_json || "[]",
      projects_json: data.projects_json || "[]",
      collaborators_json: data.collaborators_json || "[]",
    });
    await setSection("products", {
      products_json: data.products_json || "[]",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold text-white mb-8">Program & Research Content</h1>
      <p className="text-white/40 text-sm mb-6">Manage the data arrays shown in the Research Support page. Use valid JSON format.</p>
      {loading && <p className="text-white/40 text-sm mb-4">Loading saved content...</p>}
      <div className="space-y-6">
        <Section title="Programs">
          <Field label="Programs JSON Array" value={data.programs_json || ""} onChange={v => setData(d => ({ ...d, programs_json: v }))} textarea />
        </Section>
        <Section title="Research">
          <Field label="Publications JSON Array" value={data.publications_json || ""} onChange={v => setData(d => ({ ...d, publications_json: v }))} textarea />
          <Field label="Projects JSON Array" value={data.projects_json || ""} onChange={v => setData(d => ({ ...d, projects_json: v }))} textarea />
          <Field label="Collaborators JSON Array" value={data.collaborators_json || ""} onChange={v => setData(d => ({ ...d, collaborators_json: v }))} textarea />
        </Section>
        <Section title="Products">
          <Field label="Products JSON Array" value={data.products_json || ""} onChange={v => setData(d => ({ ...d, products_json: v }))} textarea />
        </Section>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, #f0d080, #c9a84c)", color: "#0d1b3e" }}>
          <Save size={16} />
          {saved ? "Saved!" : "Save Content"}
        </button>
      </div>
    </motion.div>
  );
}

