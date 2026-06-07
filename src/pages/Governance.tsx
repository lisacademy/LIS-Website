import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import PageHeader from "@/components/PageHeader";
import {
  governanceTabs,
  TRUSTEE_IMAGE_VERSION,
  type GovernanceMember,
} from "@/data/governance";
import { fetchGovernanceTabs } from "@/lib/governanceDb";

function getInitials(name: string) {
  return name
    .replace(/^Dr\.\s*|^Sri\.\s*/i, "") // Remove titles
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function MemberCard({ member, index }: { member: GovernanceMember; index: number }) {
  const photoSrc = member.photo?.startsWith("data:")
    ? member.photo
    : member.photo
      ? `${member.photo}?v=${TRUSTEE_IMAGE_VERSION}`
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
      <div className="h-2 w-full bg-[#c0392b] transition-all duration-300"></div>
      <div className="p-7 flex flex-col items-center flex-1 text-center">
        <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-serif text-4xl mb-5 border-4 border-white shadow-md overflow-hidden relative">
          {member.photo ? (
            <img
              src={photoSrc}
              alt={member.name}
              className="h-full w-full object-cover"
              style={{ objectPosition: member.imagePosition || "center center" }}
            />
          ) : (
            <>
              <span className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/20 to-transparent"></span>
              <span className="relative font-bold text-[#0d1b3e]">
                {getInitials(member.name)}
              </span>
            </>
          )}
        </div>
        <h3 className="font-serif text-lg font-bold text-[#0d1b3e] mb-2">
          {member.name}
        </h3>
        <p className="text-sm text-slate-600 font-medium leading-snug">
          {member.role}
        </p>
      </div>
    </motion.div>
  );
}

export default function Governance() {
  const [activeTab, setActiveTab] = useState(governanceTabs[0].id);
  const [tabs, setTabs] = useState(governanceTabs);

  useEffect(() => {
    fetchGovernanceTabs().then(setTabs).catch(() => setTabs(governanceTabs));
  }, []);

  const activeData = tabs.find((t) => t.id === activeTab)?.data || [];

  return (
    <PageLayout>
      <PageHeader
        tag=""
        title={
          <>
            Governance
            <span className="block mt-4 text-3xl md:text-4xl lg:text-5xl font-medium text-[#c9a84c]">
              Our Leadership
            </span>
          </>
        }
        description="The esteemed professionals guiding the vision and mission of LIS Academy."
      />

      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Subpage Tabs */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-[#0d1b3e] text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-200 shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {activeData.map((member, index) => (
                <MemberCard key={member.name} member={member} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageLayout>
  );
}
