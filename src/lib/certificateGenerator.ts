import type { Member } from './supabase';
import type { LifeCertificateEditorState } from './membershipTypes';
import { TIER_COLORS } from './membershipDb';
import { fetchDocumentTemplates, type DocumentTemplate } from './documentTemplates';
import { buildApiUrl } from './api';

export const LIFE_CERTIFICATE_TEMPLATE_VERSION = 9;
export const VOLUNTEER_CERTIFICATE_TEMPLATE_VERSION = 10;
const LIFE_CERTIFICATE_DRAFT_TEMPLATE_URL = '/membership/No_sign-01.png';
const LIFE_CERTIFICATE_TEMPLATE_URL = '/membership/withsign-01.png';
const VOLUNTEER_CERTIFICATE_DRAFT_TEMPLATE_URL = '/membership/No_sign_volunteer-01.png';
const VOLUNTEER_CERTIFICATE_TEMPLATE_URL = '/membership/withsign_volunteer-01.png';
const ID_CARD_FRONT_TEMPLATE_URL = '/membership/ID card template-02.png';

const CANVA_CERTIFICATE_WIDTH = 1876;
const CANVA_CERTIFICATE_HEIGHT = 1438;
const CANVA_CERTIFICATE_COORDS = {
  name: { x: 1237, y: 852, maxWidth: 760, startSize: 56, minSize: 36 },
  membership: { x: 1195, y: 1260, maxWidth: 360, startSize: 38, minSize: 28 },
  date: { x: 762, y: 1348, maxWidth: 355, startSize: 32, minSize: 24 },
  photo: { x: 292.5, y: 995, radius: 177.5 },
};

export const DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE: LifeCertificateEditorState = {
  certificateOfX: 494,
  certificateOfY: 248,
  certificateOfFontSize: 34,
  certificateTypeX: 494,
  certificateTypeY: 292,
  certificateTypeFontSize: 38,
  nameX: 1198,
  nameY: 770,
  nameFontSize: 52,
  designationX: 1198,
  designationY: 812,
  designationFontSize: 38,
  detailX: 1198,
  detailY: 862,
  detailFontSize: 42,
  membershipX: 1178,
  membershipY: 1248,
  membershipFontSize: 44,
  dateX: 685,
  dateY: 1362,
  dateFontSize: 30,
  photoX: 304,
  photoY: 1002,
  photoRadius: 173,
};

let _cachedTemplateImage: HTMLImageElement | null = null;
const _templateImageCache = new Map<string, HTMLImageElement>();
export interface LifeCertificateSettings {
  draftTemplateUrl: string;
  finalTemplateUrl: string;
  editorState: LifeCertificateEditorState;
}

let _lifeCertificateSettingsCache: LifeCertificateSettings | null = null;

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawableImageUrl(src: string) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/')) {
    return src;
  }

  try {
    const url = new URL(src, window.location.href);
    if (url.origin === window.location.origin) return src;
    return buildApiUrl(`/api/image-proxy?url=${encodeURIComponent(url.toString())}`);
  } catch {
    return src;
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function formatIssueDate(member: Member) {
  return new Date(member.issue_date || member.approved_at || member.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function getTemplate(key: string): Promise<DocumentTemplate | undefined> {
  const templates = await fetchDocumentTemplates();
  return templates.find((template) => template.key === key && template.template_url);
}

export async function getLifeCertificateSettings(): Promise<LifeCertificateSettings> {
  try {
    const templates = await fetchDocumentTemplates();
    const certificate = templates.find((template) => template.key === 'certificate');
    const settings = certificate?.field_map?.lifeCertificate
      && typeof certificate.field_map.lifeCertificate === 'object'
      ? certificate.field_map.lifeCertificate as Record<string, unknown>
      : {};

    _lifeCertificateSettingsCache = {
      draftTemplateUrl: getString(settings.draftTemplateUrl, LIFE_CERTIFICATE_DRAFT_TEMPLATE_URL),
      finalTemplateUrl: getString(settings.finalTemplateUrl, certificate?.template_url || LIFE_CERTIFICATE_TEMPLATE_URL),
      editorState: normalizeLifeCertificateEditorState(settings.editorState as Partial<LifeCertificateEditorState> | undefined),
    };
  } catch {
    _lifeCertificateSettingsCache = {
      draftTemplateUrl: LIFE_CERTIFICATE_DRAFT_TEMPLATE_URL,
      finalTemplateUrl: LIFE_CERTIFICATE_TEMPLATE_URL,
      editorState: normalizeLifeCertificateEditorState(),
    };
  }

  return _lifeCertificateSettingsCache;
}

function getMembershipNumberText(member: Member) {
  return String(member.membership_number || member.membership_id.replace('LISA/', '')).trim();
}

function getCertificateNumberText(member: Member, certificateKind: 'membership' | 'volunteer') {
  if (certificateKind === 'volunteer') {
    return String(member.volunteer_number || '').trim();
  }
  return getMembershipNumberText(member);
}

function getCertificateTypeText(member: Member, certificateKind: 'membership' | 'volunteer' = 'membership') {
  if (certificateKind === 'volunteer') return 'VOLUNTEER';
  return member.membership_tier === 'life'
    ? 'LIFE MEMBERSHIP'
    : `${member.membership_tier.toUpperCase()} MEMBERSHIP`;
}

export function normalizeLifeCertificateEditorState(
  state?: Partial<LifeCertificateEditorState> | null,
): LifeCertificateEditorState {
  return {
    certificateOfX: typeof state?.certificateOfX === 'number' ? state.certificateOfX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.certificateOfX,
    certificateOfY: typeof state?.certificateOfY === 'number' ? state.certificateOfY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.certificateOfY,
    certificateOfFontSize: typeof state?.certificateOfFontSize === 'number' ? state.certificateOfFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.certificateOfFontSize,
    certificateTypeX: typeof state?.certificateTypeX === 'number' ? state.certificateTypeX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.certificateTypeX,
    certificateTypeY: typeof state?.certificateTypeY === 'number' ? state.certificateTypeY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.certificateTypeY,
    certificateTypeFontSize: typeof state?.certificateTypeFontSize === 'number' ? state.certificateTypeFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.certificateTypeFontSize,
    nameX: typeof state?.nameX === 'number' ? state.nameX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.nameX,
    nameY: typeof state?.nameY === 'number' ? state.nameY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.nameY,
    nameFontSize: typeof state?.nameFontSize === 'number' ? state.nameFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.nameFontSize,
    designationX: typeof state?.designationX === 'number' ? state.designationX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.designationX,
    designationY: typeof state?.designationY === 'number' ? state.designationY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.designationY,
    designationFontSize: typeof state?.designationFontSize === 'number' ? state.designationFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.designationFontSize,
    detailX: typeof state?.detailX === 'number' ? state.detailX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.detailX,
    detailY: typeof state?.detailY === 'number' ? state.detailY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.detailY,
    detailFontSize: typeof state?.detailFontSize === 'number' ? state.detailFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.detailFontSize,
    membershipX: typeof state?.membershipX === 'number' ? state.membershipX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.membershipX,
    membershipY: typeof state?.membershipY === 'number' ? state.membershipY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.membershipY,
    membershipFontSize: typeof state?.membershipFontSize === 'number' ? state.membershipFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.membershipFontSize,
    dateX: typeof state?.dateX === 'number' ? state.dateX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.dateX,
    dateY: typeof state?.dateY === 'number' ? state.dateY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.dateY,
    dateFontSize: typeof state?.dateFontSize === 'number' ? state.dateFontSize : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.dateFontSize,
    photoX: typeof state?.photoX === 'number' ? state.photoX : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.photoX,
    photoY: typeof state?.photoY === 'number' ? state.photoY : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.photoY,
    photoRadius: typeof state?.photoRadius === 'number' ? state.photoRadius : DEFAULT_LIFE_CERTIFICATE_EDITOR_STATE.photoRadius,
  };
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: string,
  maxWidth: number,
  startSize: number,
  minSize: number
) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function splitTextIntoLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines - 1) break;
  }

  if (current) lines.push(current);

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  const consumed = lines.join(' ').split(/\s+/).filter(Boolean).length;
  if (consumed < words.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${last}...`;
  }

  return lines;
}

function drawCenteredTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    lineHeight: number;
    maxLines: number;
    fontFamily: string;
    fontWeight: string;
    startSize: number;
    minSize: number;
    color: string;
  }
) {
  let size = options.startSize;
  let lines: string[] = [];

  while (size >= options.minSize) {
    ctx.font = `${options.fontWeight} ${size}px ${options.fontFamily}`;
    lines = splitTextIntoLines(ctx, text, options.maxWidth, options.maxLines);
    if (lines.length <= options.maxLines) break;
    size -= 2;
  }

  ctx.font = `${options.fontWeight} ${size}px ${options.fontFamily}`;
  ctx.fillStyle = options.color;
  ctx.textAlign = 'center';
  const totalHeight = (lines.length - 1) * options.lineHeight;
  let lineY = options.y - totalHeight / 2;
  for (const line of lines) {
    ctx.fillText(line, options.x, lineY);
    lineY += options.lineHeight;
  }
}

async function generateLifeMembershipCertificate(member: Member): Promise<string> {
  // Use cached template to avoid re-fetching 2MB image on every call.
  if (!_cachedTemplateImage) {
    _cachedTemplateImage = await loadImage(LIFE_CERTIFICATE_TEMPLATE_URL);
  }
  const background = _cachedTemplateImage;
  // Canvas is exactly 2000 × 1414 px
  const W = background.width;   // 2000
  const H = background.height;  // 1414
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(background, 0, 0, W, H);

  // ── Positions scaled from the reference HTML (canvas 1200×850 → 2000×1414)
  // Scale X = 2000/1200 = 1.6667  |  Scale Y = 1414/850 = 1.6635
  //
  // REF POS (1200×850)           SCALED (2000×1414)
  //  name        700, 480    →    1167, 799
  //  detail      700, 510    →    1167, 849
  //  membershipNo 915, 605   →    1525, 1007
  //  issuedOnVal  750, 700   →    1250, 1165
  //  photo        x=95,y=495,r=105 → cx=333,cy=999,r=175

  ctx.textAlign = 'center';

  // ── Member name ──────────────────────────────────────────────────────
  // ref: font 'bold 32px Georgia, serif' scaled → 53px
  const rawName = member.name.trim().toUpperCase();
  const name = rawName.length > 32 ? rawName.slice(0, 31) + '…' : rawName;
  ctx.fillStyle = '#1e2a8a';
  const nameSize = fitFont(ctx, name, 'Georgia, serif', 'bold', 880, 53, 32);
  ctx.font = `bold ${nameSize}px Georgia, serif`;
  ctx.fillText(name, 1167, 799);

  // ── Designation / institution ─────────────────────────────────────────
  // ref: font '30px Georgia, serif' scaled → 50px
  // Build detail: prefer custom_detail, fallback to designation + institution
  const rawDetail = member.custom_detail?.trim() ||
    [member.designation, member.institution].filter(Boolean).join(', ');
  const detail = rawDetail.length > 60 ? rawDetail.slice(0, 59) + '…' : rawDetail;

  if (detail) {
    drawCenteredTextBlock(ctx, detail, {
      x: 1167,
      y: 849,
      maxWidth: 890,
      lineHeight: 52,
      maxLines: 2,
      fontFamily: 'Georgia, serif',
      fontWeight: '600',
      startSize: 50,
      minSize: 28,
      color: '#2d2d2d',
    });
  }

  // ── Membership number ─────────────────────────────────────────────────
  // Template already prints "Membership No. LISA/" — draw ONLY the digits.
  // ref: font 'bold 38px Georgia, serif' @ x=915 (center) scaled → 63px @ x=1525
  // We use textAlign='center' and position at 1525 so the number centres after "LISA/"
  const membershipNumber = getMembershipNumberText(member);
  ctx.fillStyle = '#1e2a8a';
  const memSize = fitFont(ctx, membershipNumber, 'Georgia, serif', 'bold', 300, 63, 38);
  ctx.font = `bold ${memSize}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(membershipNumber, 1525, 1007);

  // ── Issue date ────────────────────────────────────────────────────────
  // ref: font 'italic 24px Georgia, serif' @ (750,700) scaled → 40px @ (1250,1165)
  const issueDate = formatIssueDate(member);
  ctx.fillStyle = '#111111';
  ctx.font = 'italic bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(issueDate, 1250, 1165);

  // ── Member photo ──────────────────────────────────────────────────────
  // ref: photo x=95, y=495, r=105  →  cx=333, cy=999, r=175
  const memberPhoto = member.photo_data_url || member.photo_url;
  if (memberPhoto) {
    try {
      const image = await loadImage(drawableImageUrl(memberPhoto));
      const cx = 333, cy = 999, r = 175;
      const size = Math.min(image.width, image.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        image,
        (image.width - size) / 2, (image.height - size) / 2, size, size,
        cx - r, cy - r, r * 2, r * 2
      );
      ctx.restore();
    } catch { /* skip if photo fails to load */ }
  }

  // Output JPEG at 87% quality — ~10x smaller than PNG, visually identical for certificates.
  return canvas.toDataURL('image/jpeg', 0.87);
}

async function getTemplateImage(src: string): Promise<HTMLImageElement> {
  const cached = _templateImageCache.get(src);
  if (cached) return cached;
  const loaded = await loadImage(src);
  _templateImageCache.set(src, loaded);
  return loaded;
}

async function generateConfiguredLifeCertificate(
  member: Member,
  templateUrl: string,
  includeMembershipNumber = true,
  editorState?: Partial<LifeCertificateEditorState> | null,
  certificateKind: 'membership' | 'volunteer' = 'membership',
): Promise<string> {
  const background = await getTemplateImage(drawableImageUrl(templateUrl));
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(background, 0, 0, background.width, background.height);
  ctx.textAlign = 'center';
  const settings = await getLifeCertificateSettings();
  const state = normalizeLifeCertificateEditorState(editorState || settings.editorState);
  const scaleX = background.width / CANVA_CERTIFICATE_WIDTH;
  const scaleY = background.height / CANVA_CERTIFICATE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  ctx.fillStyle = '#ffffff';
  const certificateOfSize = fitFont(
    ctx,
    'OF',
    'Georgia, serif',
    'bold',
    220 * scaleX,
    state.certificateOfFontSize * scale,
    20 * scale,
  );
  ctx.font = `bold ${certificateOfSize}px Georgia, serif`;
  ctx.fillText('OF', state.certificateOfX * scaleX, state.certificateOfY * scaleY);

  const certificateType = getCertificateTypeText(member, certificateKind);
  ctx.fillStyle = '#ffffff';
  const certificateTypeSize = fitFont(
    ctx,
    certificateType,
    'Georgia, serif',
    'bold',
    760 * scaleX,
    state.certificateTypeFontSize * scale,
    24 * scale,
  );
  ctx.font = `bold ${certificateTypeSize}px Georgia, serif`;
  ctx.fillText(certificateType, state.certificateTypeX * scaleX, state.certificateTypeY * scaleY);

  const rawName = member.name.trim().toUpperCase();
  const name = rawName.length > 42 ? `${rawName.slice(0, 41)}...` : rawName;
  ctx.fillStyle = '#1e2a8a';
  const nameSize = fitFont(
    ctx,
    name,
    'Georgia, serif',
    'bold',
    880 * scaleX,
    state.nameFontSize * scale,
    32 * scale,
  );
  ctx.font = `bold ${nameSize}px Georgia, serif`;
  ctx.fillText(name, state.nameX * scaleX, state.nameY * scaleY);

  const designation = member.designation?.trim();
  if (designation) {
    const designationSize = fitFont(
      ctx,
      designation,
      'Georgia, serif',
      '600',
      820 * scaleX,
      state.designationFontSize * scale,
      24 * scale,
    );
    ctx.fillStyle = '#2d2d2d';
    ctx.font = `600 ${designationSize}px Georgia, serif`;
    ctx.fillText(designation, state.designationX * scaleX, state.designationY * scaleY);
  }

  const rawDetail = member.custom_detail?.trim()
    || [member.institution, member.city].filter(Boolean).join(', ');
  if (rawDetail) {
    drawCenteredTextBlock(ctx, rawDetail, {
      x: state.detailX * scaleX,
      y: state.detailY * scaleY,
      maxWidth: 890 * scaleX,
      lineHeight: state.detailFontSize * 1.05 * scale,
      maxLines: 2,
      fontFamily: 'Georgia, serif',
      fontWeight: '600',
      startSize: state.detailFontSize * scale,
      minSize: 26 * scale,
      color: '#2d2d2d',
    });
  }

  if (includeMembershipNumber) {
    const membershipNumber = getCertificateNumberText(member, certificateKind);
    ctx.fillStyle = '#1e2a8a';
    const membershipSize = fitFont(
      ctx,
      membershipNumber,
      'Georgia, serif',
      'bold',
      300 * scaleX,
      state.membershipFontSize * scale,
      32 * scale,
    );
    ctx.font = `bold ${membershipSize}px Georgia, serif`;
    ctx.fillText(membershipNumber, state.membershipX * scaleX, state.membershipY * scaleY);

    ctx.fillStyle = '#111111';
    const issueDate = formatIssueDate(member);
    const dateSize = fitFont(
      ctx,
      issueDate,
      'Georgia, serif',
      'bold italic',
      355 * scaleX,
      state.dateFontSize * scale,
      24 * scale,
    );
    ctx.font = `bold italic ${dateSize}px Georgia, serif`;
    ctx.fillText(issueDate, state.dateX * scaleX, state.dateY * scaleY);
  }

  const memberPhoto = member.photo_data_url || member.photo_url;
  if (memberPhoto) {
    try {
      const image = await loadImage(drawableImageUrl(memberPhoto));
      const size = Math.min(image.width, image.height);
      const radius = state.photoRadius * scale;
      const photoX = state.photoX * scaleX;
      const photoY = state.photoY * scaleY;
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX, photoY, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        image,
        (image.width - size) / 2,
        (image.height - size) / 2,
        size,
        size,
        photoX - radius,
        photoY - radius,
        radius * 2,
        radius * 2,
      );
      ctx.restore();
    } catch {
      // Keep certificate generation usable even if the member photo cannot be drawn.
    }
  }

  return canvas.toDataURL('image/jpeg', 0.87);
}

export async function generateLifeCertificateDraft(
  member: Member,
  options?: { editorState?: Partial<LifeCertificateEditorState> | null },
): Promise<string> {
  const settings = await getLifeCertificateSettings();
  return generateConfiguredLifeCertificate(
    member,
    settings.draftTemplateUrl,
    false,
    options?.editorState,
  );
}

export async function generateVolunteerCertificate(
  member: Member,
  options?: { editorState?: Partial<LifeCertificateEditorState> | null },
): Promise<string> {
  return generateConfiguredLifeCertificate(
    member,
    VOLUNTEER_CERTIFICATE_TEMPLATE_URL,
    true,
    options?.editorState,
    'volunteer',
  );
}

export async function generateVolunteerCertificateDraft(
  member: Member,
  options?: { editorState?: Partial<LifeCertificateEditorState> | null },
): Promise<string> {
  return generateConfiguredLifeCertificate(
    member,
    VOLUNTEER_CERTIFICATE_DRAFT_TEMPLATE_URL,
    false,
    options?.editorState,
    'volunteer',
  );
}

async function generateCertificateFromTemplate(member: Member, template: DocumentTemplate): Promise<string> {
  const map = template.field_map || {};
  const W = getNumber(map.width, 1200);
  const H = getNumber(map.height, 850);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bg = await loadImage(drawableImageUrl(template.template_url));
  ctx.drawImage(bg, 0, 0, W, H);

  const name = map.name && typeof map.name === 'object' ? map.name as Record<string, unknown> : {};
  const detail = map.detail && typeof map.detail === 'object' ? map.detail as Record<string, unknown> : {};
  const membership = map.membership && typeof map.membership === 'object' ? map.membership as Record<string, unknown> : {};
  const date = map.date && typeof map.date === 'object' ? map.date as Record<string, unknown> : {};
  const photo = map.photo && typeof map.photo === 'object' ? map.photo as Record<string, unknown> : {};

  ctx.textAlign = 'center';
  ctx.fillStyle = getString(name.color, '#000000');
  ctx.font = getString(name.font, 'bold 32px Georgia, serif');
  ctx.fillText(member.name.toUpperCase(), getNumber(name.x, 700), getNumber(name.y, 480));

  ctx.fillStyle = getString(detail.color, '#000000');
  ctx.font = getString(detail.font, '30px Georgia, serif');
  ctx.fillText(member.custom_detail || `${member.designation}, ${member.institution}`, getNumber(detail.x, 700), getNumber(detail.y, 510));

  ctx.fillStyle = getString(membership.color, '#000000');
  ctx.font = getString(membership.font, 'bold 38px Georgia, serif');
  ctx.fillText(String(member.membership_number || member.membership_id.replace('LISA/', '')), getNumber(membership.x, 915), getNumber(membership.y, 605));

  ctx.fillStyle = getString(date.color, '#000000');
  ctx.font = getString(date.font, 'italic 24px Georgia, serif');
  ctx.fillText(formatIssueDate(member), getNumber(date.x, 750), getNumber(date.y, 700));

  const memberPhoto = member.photo_data_url || member.photo_url;
  if (memberPhoto) {
    const img = await loadImage(drawableImageUrl(memberPhoto));
    const x = getNumber(photo.x, 95);
    const y = getNumber(photo.y, 495);
    const w = getNumber(photo.w, 210);
    const h = getNumber(photo.h, 210);
    const r = getNumber(photo.r, Math.min(w, h) / 2);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
    ctx.clip();
    const sz = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - sz) / 2, (img.height - sz) / 2, sz, sz, x, y, w, h);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

async function generateIdSideFromTemplate(member: Member, template: DocumentTemplate, fallbackSize: { width: number; height: number }) {
  const map = template.field_map || {};
  const W = getNumber(map.width, fallbackSize.width);
  const H = getNumber(map.height, fallbackSize.height);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bg = await loadImage(drawableImageUrl(template.template_url));
  ctx.drawImage(bg, 0, 0, W, H);

  const draw = (key: string, text: string, fallback: { x: number; y: number; font: string; color: string; align?: CanvasTextAlign }) => {
    const spec = map[key] && typeof map[key] === 'object' ? map[key] as Record<string, unknown> : {};
    ctx.textAlign = getString(spec.align, fallback.align || 'left') as CanvasTextAlign;
    ctx.fillStyle = getString(spec.color, fallback.color);
    ctx.font = getString(spec.font, fallback.font);
    ctx.fillText(text, getNumber(spec.x, fallback.x), getNumber(spec.y, fallback.y));
  };

  draw('name', member.name.toUpperCase(), { x: 30, y: 188, font: 'bold 20px Inter, sans-serif', color: '#ffffff' });
  draw('designation', member.designation || '-', { x: 30, y: 226, font: '13px Inter, sans-serif', color: '#ffffff' });
  draw('institution', member.institution || '-', { x: 30, y: 264, font: '12px Inter, sans-serif', color: '#ffffff' });
  draw('membership', member.membership_id, { x: 44, y: 342, font: 'bold 17px Inter, sans-serif', color: '#ffffff' });
  draw('issueDate', formatIssueDate(member), { x: W / 2, y: H - 14, font: '9px Inter, sans-serif', color: '#ffffff', align: 'center' });

  const photo = map.photo && typeof map.photo === 'object' ? map.photo as Record<string, unknown> : {};
  const memberPhoto = member.photo_data_url || member.photo_url;
  if (memberPhoto) {
    const img = await loadImage(drawableImageUrl(memberPhoto));
    const x = getNumber(photo.x, W - 130);
    const y = getNumber(photo.y, 155);
    const w = getNumber(photo.w, 110);
    const h = getNumber(photo.h, 110);
    ctx.save();
    roundRect(ctx, x, y, w, h, getNumber(photo.r, 8));
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

// ─────────────────────────────────────────────────────────────
//  MEMBERSHIP CERTIFICATE  (1122 × 794 px – A4 landscape @96dpi)
// ─────────────────────────────────────────────────────────────
export async function generateCertificate(
  member: Member,
  options?: { editorState?: Partial<LifeCertificateEditorState> | null },
): Promise<string> {
  const settings = await getLifeCertificateSettings();
  return generateConfiguredLifeCertificate(
    member,
    settings.finalTemplateUrl,
    true,
    options?.editorState,
  );
}

export async function generateIdCard(member: Member): Promise<{ front: string; back: string }> {
  const [frontTemplate, backTemplate] = await Promise.all([getTemplate('id_front'), getTemplate('id_back')]);
  if (frontTemplate || backTemplate) {
    try {
      const [frontUrl, backUrl] = await Promise.all([
        frontTemplate ? generateIdSideFromTemplate(member, frontTemplate, { width: 638, height: 402 }) : Promise.resolve(''),
        backTemplate ? generateIdSideFromTemplate(member, backTemplate, { width: 638, height: 402 }) : Promise.resolve(''),
      ]);
      if (frontUrl && backUrl) return { front: frontUrl, back: backUrl };
    } catch {
      // Fall back to the built-in ID card design when an external template is unavailable.
    }
  }

  let frontBackground: HTMLImageElement | null = null;
  try {
    frontBackground = await getTemplateImage(ID_CARD_FRONT_TEMPLATE_URL);
  } catch {
    frontBackground = null;
  }

  const W = frontBackground?.width || 638;
  const H = frontBackground?.height || 402;
  const usesFrontBackground = Boolean(frontBackground);
  const tierColor = TIER_COLORS[member.membership_tier] || '#c9a84c';

  // ── FRONT ───────────────────────────────────────────────────
  const front = document.createElement('canvas');
  front.width = W;
  front.height = H;
  const fc = front.getContext('2d')!;

  if (frontBackground) {
    fc.drawImage(frontBackground, 0, 0, W, H);
  } else {
    const bg = fc.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0d1b3e');
    bg.addColorStop(0.6, '#1a3060');
    bg.addColorStop(1, '#112244');
    fc.fillStyle = bg;
    fc.fillRect(0, 0, W, H);

    fc.strokeStyle = 'rgba(201,168,76,0.25)';
    fc.lineWidth = 40;
    fc.beginPath();
    fc.arc(W + 30, -30, 200, 0, Math.PI * 2);
    fc.stroke();

    fc.fillStyle = '#c9a84c';
    fc.fillRect(0, 0, W, 5);

    fc.fillStyle = tierColor;
    fc.fillRect(0, H - 5, W, 5);
  }

  const frontPrimaryColor = usesFrontBackground ? '#173756' : '#ffffff';
  const frontSecondaryColor = usesFrontBackground ? '#32465c' : 'rgba(255,255,255,0.8)';
  const frontLabelColor = usesFrontBackground ? '#b68b2d' : 'rgba(201,168,76,0.7)';
  const frontBandFill = usesFrontBackground ? 'rgba(201,168,76,0.14)' : tierColor + '33';
  const frontBandStroke = usesFrontBackground ? 'rgba(201,168,76,0.45)' : tierColor + '88';

  // ── Logo (left side) ────────────────────────────────────────
  try {
    const logo = await loadImage('/logo.png');
    fc.save();
    fc.beginPath();
    fc.arc(74, 80, 44, 0, Math.PI * 2);
    fc.closePath();
    fc.clip();
    fc.drawImage(logo, 30, 36, 88, 88);
    fc.restore();
    fc.strokeStyle = '#c9a84c';
    fc.lineWidth = 2;
    fc.beginPath();
    fc.arc(74, 80, 45, 0, Math.PI * 2);
    fc.stroke();
  } catch { /* skip */ }

  // Academy name
  fc.fillStyle = frontPrimaryColor;
  fc.textAlign = 'left';
  fc.font = 'bold 22px "Inter", sans-serif';
  fc.fillText('LIS ACADEMY', 138, 68);
  fc.font = '10px "Inter", sans-serif';
  fc.fillStyle = '#c9a84c';
  fc.letterSpacing = '2px';
  fc.fillText('LEARN | INSPIRE | SERVE', 139, 86);
  fc.letterSpacing = '0px';

  // Divider line
  fc.strokeStyle = usesFrontBackground ? 'rgba(23,55,86,0.18)' : 'rgba(201,168,76,0.4)';
  fc.lineWidth = 1;
  fc.beginPath();
  fc.moveTo(30, 142);
  fc.lineTo(W - 30, 142);
  fc.stroke();

  // Member photo (right side placeholder)
  const photoX = W - 130, photoY = 155, photoSize = 110;
  fc.fillStyle = usesFrontBackground ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.08)';
  roundRect(fc, photoX, photoY, photoSize, photoSize, 8);
  fc.fill();
  fc.strokeStyle = usesFrontBackground ? 'rgba(23,55,86,0.25)' : 'rgba(201,168,76,0.5)';
  fc.lineWidth = 1.5;
  roundRect(fc, photoX, photoY, photoSize, photoSize, 8);
  fc.stroke();
  const memberPhoto = member.photo_data_url || member.photo_url;
  if (memberPhoto) {
    try {
      const photo = await loadImage(drawableImageUrl(memberPhoto));
      fc.save();
      roundRect(fc, photoX, photoY, photoSize, photoSize, 8);
      fc.clip();
      fc.drawImage(photo, photoX, photoY, photoSize, photoSize);
      fc.restore();
    } catch { /* skip */ }
  } else {
    fc.fillStyle = usesFrontBackground ? 'rgba(23,55,86,0.45)' : 'rgba(255,255,255,0.3)';
    fc.font = '11px "Inter", sans-serif';
    fc.textAlign = 'center';
    fc.fillText('PHOTO', photoX + photoSize / 2, photoY + photoSize / 2 + 4);
    fc.textAlign = 'left';
  }

  // Member information
  const infoX = 30;
  let infoY = 170;

  fc.fillStyle = frontLabelColor;
  fc.font = '9px "Inter", sans-serif';
  fc.letterSpacing = '2px';
  fc.fillText('MEMBER NAME', infoX, infoY);
  fc.letterSpacing = '0px';
  infoY += 18;
  fc.fillStyle = frontPrimaryColor;
  fc.font = 'bold 20px "Inter", sans-serif';
  fc.fillText(member.name, infoX, infoY);
  infoY += 24;

  fc.fillStyle = frontLabelColor;
  fc.font = '9px "Inter", sans-serif';
  fc.letterSpacing = '2px';
  fc.fillText('DESIGNATION', infoX, infoY);
  fc.letterSpacing = '0px';
  infoY += 16;
  fc.fillStyle = frontSecondaryColor;
  fc.font = '13px "Inter", sans-serif';
  const designation = member.designation || '—';
  fc.fillText(designation.length > 28 ? designation.slice(0, 28) + '…' : designation, infoX, infoY);
  infoY += 22;

  fc.fillStyle = frontLabelColor;
  fc.font = '9px "Inter", sans-serif';
  fc.letterSpacing = '2px';
  fc.fillText('INSTITUTION', infoX, infoY);
  fc.letterSpacing = '0px';
  infoY += 16;
  fc.fillStyle = frontSecondaryColor;
  fc.font = '12px "Inter", sans-serif';
  const inst = member.institution || '—';
  fc.fillText(inst.length > 34 ? inst.slice(0, 34) + '…' : inst, infoX, infoY);

  // Membership ID band
  fc.fillStyle = frontBandFill;
  roundRect(fc, 30, 308, W - 60, 42, 6);
  fc.fill();
  fc.strokeStyle = frontBandStroke;
  fc.lineWidth = 1;
  roundRect(fc, 30, 308, W - 60, 42, 6);
  fc.stroke();

  fc.fillStyle = usesFrontBackground ? 'rgba(23,55,86,0.58)' : 'rgba(255,255,255,0.5)';
  fc.font = '9px "Inter", sans-serif';
  fc.textAlign = 'left';
  fc.letterSpacing = '2px';
  fc.fillText('MEMBERSHIP ID', 44, 324);
  fc.letterSpacing = '0px';
  fc.fillStyle = frontPrimaryColor;
  fc.font = 'bold 17px "Inter", sans-serif';
  fc.letterSpacing = '2px';
  fc.fillText(member.membership_id, 44, 342);
  fc.letterSpacing = '0px';

  // Tier badge (right of ID band)
  fc.fillStyle = tierColor;
  const tierLabel = member.membership_tier.charAt(0).toUpperCase() + member.membership_tier.slice(1);
  const badgeW2 = 110;
  roundRect(fc, W - 30 - badgeW2, 315, badgeW2, 28, 14);
  fc.fill();
  fc.fillStyle = '#fff';
  fc.font = 'bold 10px "Inter", sans-serif';
  fc.textAlign = 'center';
  fc.letterSpacing = '1px';
  fc.fillText(tierLabel.toUpperCase() + ' MEMBER', W - 30 - badgeW2 / 2, 333);
  fc.letterSpacing = '0px';

  // Footer
  fc.fillStyle = usesFrontBackground ? 'rgba(23,55,86,0.55)' : 'rgba(255,255,255,0.35)';
  fc.font = '9px "Inter", sans-serif';
  fc.textAlign = 'center';
  fc.fillText('lisacademyorg@gmail.com  |  +91 9449679737', W / 2, H - 14);

  // ── BACK ────────────────────────────────────────────────────
  const back = document.createElement('canvas');
  back.width = W;
  back.height = H;
  const bc = back.getContext('2d')!;

  // Background
  const bg2 = bc.createLinearGradient(0, 0, W, H);
  bg2.addColorStop(0, '#0a1428');
  bg2.addColorStop(1, '#0d1b3e');
  bc.fillStyle = bg2;
  bc.fillRect(0, 0, W, H);

  // Gold stripes
  bc.fillStyle = '#c9a84c';
  bc.fillRect(0, 0, W, 5);
  bc.fillStyle = tierColor;
  bc.fillRect(0, H - 5, W, 5);

  // Watermark logo
  try {
    const logo2 = await loadImage('/logo.png');
    bc.globalAlpha = 0.05;
    bc.drawImage(logo2, W / 2 - 120, H / 2 - 120, 240, 240);
    bc.globalAlpha = 1;
  } catch { /* skip */ }

  // Magnetic stripe bar
  bc.fillStyle = '#111';
  bc.fillRect(0, 45, W, 48);

  // Signature strip
  bc.fillStyle = '#fff';
  roundRect(bc, 30, 122, W - 200, 38, 4);
  bc.fill();
  bc.fillStyle = '#ccc';
  bc.font = '9px "Inter", sans-serif';
  bc.textAlign = 'left';
  bc.fillText('SIGNATURE', 40, 145);

  // Terms
  bc.fillStyle = 'rgba(255,255,255,0.5)';
  bc.font = '10px "Inter", sans-serif';
  bc.textAlign = 'center';
  const terms = [
    'This card is the property of LIS Academy and must be returned on demand.',
    'If found, please return to: 7/29, Vijayalakshmi Complex, 1st Main Road,',
    'Gokul, Bengaluru – 560054',
    '',
    'Contact: lisacademyorg@gmail.com | +91 9449679737',
  ];
  let ty = 200;
  terms.forEach(line => {
    bc.fillText(line, W / 2, ty);
    ty += 18;
  });

  // Social handles
  bc.fillStyle = 'rgba(201,168,76,0.6)';
  bc.font = '10px "Inter", sans-serif';
  bc.fillText('www.lisacademy.org', W / 2, H - 30);
  bc.fillStyle = 'rgba(255,255,255,0.3)';
  bc.font = '9px "Inter", sans-serif';
  bc.fillText(member.membership_id + '  ·  Valid from ' + new Date(member.created_at).getFullYear(), W / 2, H - 14);

  return {
    front: front.toDataURL('image/png'),
    back: back.toDataURL('image/png'),
  };
}

// ─────────────────────────────────────────────────────────────
//  Print helper
// ─────────────────────────────────────────────────────────────
export function printImage(dataUrl: string, title = 'LIS Academy') {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { margin:0; background:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh; }
      img { max-width:100%; height:auto; }
      @media print { body { margin:0; } img { width:100%; } }
    </style></head>
    <body><img src="${dataUrl}" onload="window.print();window.close()"/></body></html>
  `);
  win.document.close();
}

// ─────────────────────────────────────────────────────────────
//  Utility – rounded rect (Canvas API helper)
// ─────────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}





