import { getSection, setSection } from "./contentDb";
import { governanceTabs, type GovernanceMember, type GovernanceTab, type GovernanceTabId } from "@/data/governance";

export type EditableGovernanceMember = GovernanceMember & {
  id: string;
};

export type EditableGovernanceTab = Omit<GovernanceTab, "data"> & {
  data: EditableGovernanceMember[];
};

function memberId(tabId: GovernanceTabId, index: number, member: GovernanceMember) {
  return `${tabId}-${index}-${member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function defaultEditableGovernanceTabs(): EditableGovernanceTab[] {
  return governanceTabs.map((tab) => ({
    ...tab,
    data: tab.data.map((member, index) => ({
      ...member,
      id: memberId(tab.id, index, member),
    })),
  }));
}

function normalizeTabs(value: unknown): EditableGovernanceTab[] {
  if (!Array.isArray(value)) return defaultEditableGovernanceTabs();

  const defaults = defaultEditableGovernanceTabs();
  return defaults.map((defaultTab) => {
    const savedTab = value.find((tab) => tab && typeof tab === "object" && (tab as { id?: unknown }).id === defaultTab.id);
    const savedData = savedTab && typeof savedTab === "object" && Array.isArray((savedTab as { data?: unknown }).data)
      ? (savedTab as { data: unknown[] }).data
      : defaultTab.data;

    return {
      id: defaultTab.id,
      label: typeof (savedTab as { label?: unknown } | undefined)?.label === "string"
        ? String((savedTab as { label: string }).label)
        : defaultTab.label,
      data: savedData
        .filter((member) => member && typeof member === "object")
        .map((member, index) => {
          const source = member as Partial<EditableGovernanceMember>;
          const normalized = {
            id: source.id || memberId(defaultTab.id, index, source),
            name: String(source.name || "").trim(),
            role: String(source.role || "").trim(),
            photo: String(source.photo || "").trim() || undefined,
            imagePosition: String(source.imagePosition || "").trim() || undefined,
          };
          return normalized.name && normalized.role ? normalized : null;
        })
        .filter(Boolean) as EditableGovernanceMember[],
    };
  });
}

export async function fetchGovernanceTabs(): Promise<EditableGovernanceTab[]> {
  const data = await getSection("governance");
  if (!data.tabs_json) return defaultEditableGovernanceTabs();

  try {
    return normalizeTabs(JSON.parse(data.tabs_json));
  } catch {
    return defaultEditableGovernanceTabs();
  }
}

export async function saveGovernanceTabs(tabs: EditableGovernanceTab[]) {
  const normalized = normalizeTabs(tabs);
  await setSection("governance", {
    tabs_json: JSON.stringify(normalized),
  });
  return normalized;
}
