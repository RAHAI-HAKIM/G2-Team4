/**
 * InspectionPage — Crucible lot inspection workflow (functional prototype)
 *
 * Four steps: 1 Lot → 2 Sampling → 3 Units → 4 Decision (PIN signature).
 *
 * Everything lives in this one file on purpose, so the prototype is easy to
 * read top to bottom. Each section is marked with where it will move later:
 *
 *   Types ........................ features/inspection/types
 *   Domain data & sampling ....... features/inspection/data + utils
 *   Translations ................. features/inspection/data
 *   Hooks ........................ features/inspection/hooks
 *   Header / Preferences ......... components/layout (Header, AppLayout)
 *   Step components .............. features/inspection/components
 *
 * There is no backend yet: lots, plans and the user are mock data, and defect
 * IDs are generated locally.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import logoUrl from '../../assets/brand/logo.svg';

/* ==========================================================================
   Types
   ========================================================================== */

type Lang = 'en' | 'fr' | 'ar';
type Step = 1 | 2 | 3 | 4;
type Tone = 'ok' | 'warn' | 'err' | 'info';

type Severity = 'critical' | 'major' | 'minor';
type InspectionLevel = 'I' | 'II';
type Direction = 'over' | 'under';
type Outcome = 'accept' | 'reject' | 'pending';

type LineKey = 'line1' | 'line2';
type PlanKey = 'filling' | 'packaging';
type ProductKey = 'water' | 'waterPack';
type Shift = 'morning' | 'afternoon';

type AttributeKey = 'cap' | 'label' | 'seal' | 'code';
type MeasureKey = 'volume' | 'weight';
type CharacteristicKey = AttributeKey | MeasureKey;
type MeasureUnit = 'ml' | 'kg';

/** Pass / fail check done by eye (e.g. "is the cap intact?") */
interface AttributeCharacteristic {
  kind: 'attribute';
  key: AttributeKey;
  severity: Severity;
}

/** Numeric reading checked against lower / upper specification limits */
interface MeasureCharacteristic {
  kind: 'measure';
  key: MeasureKey;
  severity: Severity;
  unit: MeasureUnit;
  lsl: number;
  target: number;
  usl: number;
  decimals: number;
}

type Characteristic = AttributeCharacteristic | MeasureCharacteristic;

interface Plan {
  version: string;
  characteristics: Characteristic[];
}

interface Lot {
  id: string;
  size: number;
  level: InspectionLevel;
}

interface WorkOrder {
  id: string;
  shift: Shift;
  lots: Lot[];
}

interface Line {
  key: LineKey;
  plan: PlanKey;
  product: ProductKey;
  workOrders: WorkOrder[];
}

interface SamplingPlan {
  codeLetter: string;
  sampleSize: number;
  ac: number;
  re: number;
}

interface Defect {
  id: string;
  unit: number;
  key: CharacteristicKey;
  severity: Severity;
  direction?: Direction;
  value?: number;
}

interface DefectEvent {
  type: 'added' | 'removed';
  id: string;
}

type MeasureStatus =
  | { state: 'ok' }
  | { state: 'invalid' }
  | { state: 'out'; direction: Direction; value: number; limit: number };

interface Selection {
  lineKey: LineKey;
  workOrderId: string;
  lotId: string;
}

/* ==========================================================================
   Domain data (mock) and sampling
   ========================================================================== */

const LANGS = ['en', 'fr', 'ar'] as const;

const AQL = 2.5;
const FIRST_DEFECT_NO = 892; // mock sequence — the backend will own IDs later

const PLANS: Record<PlanKey, Plan> = {
  filling: {
    version: 'v3.4',
    characteristics: [
      { kind: 'attribute', key: 'cap', severity: 'major' },
      { kind: 'attribute', key: 'label', severity: 'minor' },
      {
        kind: 'measure',
        key: 'volume',
        severity: 'critical',
        unit: 'ml',
        lsl: 495,
        target: 498,
        usl: 500,
        decimals: 0,
      },
    ],
  },
  packaging: {
    version: 'v2.1',
    characteristics: [
      { kind: 'attribute', key: 'seal', severity: 'major' },
      { kind: 'attribute', key: 'code', severity: 'minor' },
      {
        kind: 'measure',
        key: 'weight',
        severity: 'major',
        unit: 'kg',
        lsl: 9.1,
        target: 9.3,
        usl: 9.5,
        decimals: 1,
      },
    ],
  },
};

const LINES: Line[] = [
  {
    key: 'line1',
    plan: 'packaging',
    product: 'waterPack',
    workOrders: [
      {
        id: 'OF-2026-1102',
        shift: 'morning',
        lots: [{ id: 'LOT-2026-0415', size: 1200, level: 'I' }],
      },
    ],
  },
  {
    key: 'line2',
    plan: 'filling',
    product: 'water',
    workOrders: [
      {
        id: 'OF-2026-1104',
        shift: 'morning',
        lots: [
          { id: 'LOT-2026-0417', size: 3200, level: 'I' },
          { id: 'LOT-2026-0418', size: 900, level: 'I' },
        ],
      },
      {
        id: 'OF-2026-1103',
        shift: 'afternoon',
        lots: [{ id: 'LOT-2026-0416', size: 3200, level: 'I' }],
      },
    ],
  },
];

const DEFAULT_SELECTION: Selection = {
  lineKey: 'line2',
  workOrderId: 'OF-2026-1104',
  lotId: 'LOT-2026-0417',
};

/**
 * ISO 2859-1 (ANSI/ASQ Z1.4, MIL-STD-105E) — single sampling, normal
 * inspection, AQL 2.5.
 *
 * Step 1: lot size + general inspection level → sample-size code letter (Table 1).
 * Step 2: code letter → sample size and Ac / Re numbers (Table 2-A).
 *
 * Where Table 2-A shows an arrow at AQL 2.5, the plan the arrow points to is
 * used: A, B, D → C (n=5, 0/1); E → F (n=20, 1/2); P, Q → N (n=500, 21/22).
 * If the sample size is not smaller than the lot, the whole lot is inspected
 * (100 %), with Ac / Re unchanged.
 *
 * Values cross-checked against published reproductions of the tables
 * (aqlchart.com, tetrainspection.com — Nov 2026). They must still be verified
 * cell by cell against the standard itself (SRS VER-02); the backend will own
 * this table.
 */
const CODE_LETTERS: ReadonlyArray<{ max: number } & Record<InspectionLevel, string>> = [
  { max: 8, I: 'A', II: 'A' },
  { max: 15, I: 'A', II: 'B' },
  { max: 25, I: 'B', II: 'C' },
  { max: 50, I: 'C', II: 'D' },
  { max: 90, I: 'C', II: 'E' },
  { max: 150, I: 'D', II: 'F' },
  { max: 280, I: 'E', II: 'G' },
  { max: 500, I: 'F', II: 'H' },
  { max: 1200, I: 'G', II: 'J' },
  { max: 3200, I: 'H', II: 'K' },
  { max: 10000, I: 'J', II: 'L' },
  { max: 35000, I: 'K', II: 'M' },
  { max: 150000, I: 'L', II: 'N' },
  { max: 500000, I: 'M', II: 'P' },
  { max: Number.POSITIVE_INFINITY, I: 'N', II: 'Q' },
];

const PLAN_BY_LETTER: Record<string, Omit<SamplingPlan, 'codeLetter'>> = {
  A: { sampleSize: 5, ac: 0, re: 1 },
  B: { sampleSize: 5, ac: 0, re: 1 },
  C: { sampleSize: 5, ac: 0, re: 1 },
  D: { sampleSize: 5, ac: 0, re: 1 },
  E: { sampleSize: 20, ac: 1, re: 2 },
  F: { sampleSize: 20, ac: 1, re: 2 },
  G: { sampleSize: 32, ac: 2, re: 3 },
  H: { sampleSize: 50, ac: 3, re: 4 },
  J: { sampleSize: 80, ac: 5, re: 6 },
  K: { sampleSize: 125, ac: 7, re: 8 },
  L: { sampleSize: 200, ac: 10, re: 11 },
  M: { sampleSize: 315, ac: 14, re: 15 },
  N: { sampleSize: 500, ac: 21, re: 22 },
  P: { sampleSize: 500, ac: 21, re: 22 },
  Q: { sampleSize: 500, ac: 21, re: 22 },
};

function getSamplingPlan(lotSize: number, level: InspectionLevel): SamplingPlan {
  const row = CODE_LETTERS.find((r) => lotSize <= r.max) ?? CODE_LETTERS[CODE_LETTERS.length - 1];
  const codeLetter = row[level];
  const plan = PLAN_BY_LETTER[codeLetter];
  // Sample size can never exceed the lot: inspect 100 % instead.
  return { codeLetter, ...plan, sampleSize: Math.min(plan.sampleSize, lotSize) };
}

/** Checks a typed reading against the specification limits. */
function evaluateMeasure(c: MeasureCharacteristic, raw: string): MeasureStatus {
  const text = raw.trim().replace(',', '.');
  const value = Number(text);
  if (text === '' || !Number.isFinite(value)) return { state: 'invalid' };
  if (value > c.usl) return { state: 'out', direction: 'over', value, limit: c.usl };
  if (value < c.lsl) return { state: 'out', direction: 'under', value, limit: c.lsl };
  return { state: 'ok' };
}

const formatDefectId = (n: number) => `DEF-2026-${String(n).padStart(4, '0')}`;

const formatInt = (n: number, lang: Lang) =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-u-nu-latn' : lang).format(n);

const findLine = (key: LineKey): Line => LINES.find((l) => l.key === key) ?? LINES[0];

const SEVERITY_TONE: Record<Severity, Tone> = {
  critical: 'err',
  major: 'warn',
  minor: 'info',
};

/* ==========================================================================
   Translations (EN · FR · AR)
   Dict is inferred from EN, so FR and AR must provide every key.
   ========================================================================== */

const EN = {
  pageTitle: 'Inspection',
  plant: 'North Plant',
  userName: 'Bouchra Allali',
  userRole: 'QC',
  stepsLabel: 'Inspection steps',
  language: 'Language',

  steps: ['Lot', 'Sampling', 'Units', 'Decision'],
  h: ['Select the lot to inspect', 'Sampling result', 'Unit inspection', 'Final lot decision'],
  p1: 'Choose the production line, work order and active lot.',
  p2: (lotId: string) => `ISO 2859-1 sample size computed automatically for ${lotId}.`,
  p3: 'Record each characteristic. Log a defect as soon as one is found.',
  p4: 'Sign with your 4-digit PIN to approve.',

  // Step 1
  fl: 'Production line',
  fw: 'Work order',
  fb: 'Active lot',
  lines: { line1: 'Line 1 – Packaging', line2: 'Line 2 – Filling' },
  lotDetails: 'Lot details',
  shifts: { morning: 'Morning shift', afternoon: 'Afternoon shift' },
  products: { water: 'Mineral water 1.5 L', waterPack: 'Mineral water 1.5 L · 6-pack' },
  unitsWord: 'units',
  planLabel: 'Approved inspection plan',
  approved: 'Approved',
  plans: {
    filling: { name: 'Filling & cap inspection', stage: 'Final filling stage' },
    packaging: { name: 'Packaging & label inspection', stage: 'Final packaging stage' },
  },
  planMeta: (stage: string, count: number, version: string) =>
    `${stage} · ${count} characteristics · ${version}`,
  cont: 'Continue',
  back: 'Back',

  // Step 2
  lotSize: 'Lot size',
  level: 'Inspection level',
  normal: 'Normal',
  sampleSize: 'Sample size',
  accept: 'Acceptance (Ac)',
  reject: 'Rejection (Re)',
  maxN: (n: number) => `${n} max`,
  orMore: (n: number) => `${n} or more`,
  samplingNote: (n: number, ac: number, re: number) =>
    `Inspect ${n} units at random. Accept the lot if defective units ≤ ${ac} (Ac), reject at ${re} (Re) or more.`,
  startInsp: 'Start inspection',

  // Step 3
  unit: 'Unit',
  of: 'of',
  defective: 'Defective units',
  conforming: 'Conforming',
  nonConforming: 'Non-conforming',
  recordDefect: 'Record defect',
  defectLogged: 'Defect recorded',
  previous: 'Previous',
  nextUnit: 'Next unit',
  toDecision: 'Go to decision',
  target: 'Target',
  outOfLimit: (value: number, unit: string, direction: Direction, limit: number) =>
    `Out of limit: ${value} ${unit}, ${direction === 'over' ? 'max' : 'min'} ${limit} ${unit}`,
  blockedRecord: 'Record the defect before moving to the next unit.',
  blockedValue: 'Enter the measured value to continue.',
  unitNames: { ml: 'ml', kg: 'kg' },
  attrs: {
    cap: {
      name: 'Cap & safety ring integrity',
      hint: 'Tight seal, no cracks in the ring.',
      defect: 'Cracked cap safety ring',
    },
    label: {
      name: 'Label alignment',
      hint: 'Centered ±2 mm, no wrinkles or bubbles.',
      defect: 'Misaligned or wrinkled label',
    },
    seal: {
      name: 'Carton seal integrity',
      hint: 'Tape fully closed, no tears or gaps.',
      defect: 'Open or torn carton seal',
    },
    code: {
      name: 'Batch code legibility',
      hint: 'Batch code and barcode are readable.',
      defect: 'Unreadable batch code',
    },
  },
  measures: {
    volume: { name: 'Fill volume', over: 'Overfill', under: 'Underfill' },
    weight: { name: 'Pack weight', over: 'Overweight', under: 'Underweight' },
  },

  // Step 4
  inspected: 'Inspected',
  isoLimits: 'ISO limits',
  proposal: 'System proposal',
  rejectLot: 'Reject lot',
  acceptLot: 'Accept lot',
  pendingLot: 'Sampling incomplete',
  pendingNote: (remaining: number) => `Inspect the remaining ${remaining} units before signing.`,
  signLocked: 'Signing unlocks when the sample is complete.',
  recorded: 'Recorded defects',
  noDefects: 'No defects recorded.',
  severity: { critical: 'Critical', major: 'Major', minor: 'Minor' },
  pinTitle: 'PIN signature',
  clear: 'Clear',
  sign: 'Sign',
  signedHold: (name: string) => `Lot ON HOLD · signed by ${name}`,
  signedAccept: (name: string) => `Lot accepted · signed by ${name}`,
  newInspection: 'New inspection',
  defectAdded: (id: string) => `Defect recorded · ${id}`,
  defectRemoved: (id: string) => `Defect removed · ${id}`,
};

type Dict = typeof EN;

const FR: Dict = {
  pageTitle: 'Inspection',
  plant: 'Usine Nord',
  userName: 'Bouchra Allali',
  userRole: 'Qualité',
  stepsLabel: 'Étapes d’inspection',
  language: 'Langue',

  steps: ['Lot', 'Échantillon', 'Unités', 'Décision'],
  h: [
    'Choisir le lot à inspecter',
    'Résultat d’échantillonnage',
    'Inspection des unités',
    'Décision finale du lot',
  ],
  p1: 'Sélectionnez la ligne, l’ordre de fabrication et le lot actif.',
  p2: (lotId) => `Taille d’échantillon ISO 2859-1 calculée pour ${lotId}.`,
  p3: 'Saisissez chaque caractéristique. Consignez un défaut dès qu’il apparaît.',
  p4: 'Signez avec votre code PIN à 4 chiffres.',

  fl: 'Ligne de production',
  fw: 'Ordre de fabrication',
  fb: 'Lot actif',
  lines: { line1: 'Ligne 1 – Emballage', line2: 'Ligne 2 – Remplissage' },
  lotDetails: 'Détails du lot',
  shifts: { morning: 'Équipe du matin', afternoon: 'Équipe de l’après-midi' },
  products: { water: 'Eau minérale 1,5 L', waterPack: 'Eau minérale 1,5 L · pack de 6' },
  unitsWord: 'unités',
  planLabel: 'Plan d’inspection approuvé',
  approved: 'Approuvé',
  plans: {
    filling: { name: 'Contrôle remplissage et bouchon', stage: 'Remplissage final' },
    packaging: { name: 'Contrôle emballage et étiquette', stage: 'Emballage final' },
  },
  planMeta: (stage, count, version) => `${stage} · ${count} caractéristiques · ${version}`,
  cont: 'Continuer',
  back: 'Retour',

  lotSize: 'Taille du lot',
  level: 'Niveau de contrôle',
  normal: 'Normal',
  sampleSize: 'Taille d’échantillon',
  accept: 'Acceptation (Ac)',
  reject: 'Rejet (Re)',
  maxN: (n) => `${n} maximum`,
  orMore: (n) => `${n} ou plus`,
  samplingNote: (n, ac, re) =>
    `Contrôlez ${n} unités au hasard. Acceptez le lot si les unités défectueuses ≤ ${ac} (Ac), rejetez à partir de ${re} (Re).`,
  startInsp: 'Démarrer l’inspection',

  unit: 'Unité',
  of: 'sur',
  defective: 'Unités défectueuses',
  conforming: 'Conforme',
  nonConforming: 'Non conforme',
  recordDefect: 'Enregistrer un défaut',
  defectLogged: 'Défaut enregistré',
  previous: 'Précédente',
  nextUnit: 'Unité suivante',
  toDecision: 'Aller à la décision',
  target: 'Cible',
  outOfLimit: (value, unit, direction, limit) =>
    `Hors limite : ${value} ${unit}, ${direction === 'over' ? 'maximum' : 'minimum'} ${limit} ${unit}`,
  blockedRecord: 'Enregistrez le défaut avant de passer à l’unité suivante.',
  blockedValue: 'Saisissez la valeur mesurée pour continuer.',
  unitNames: { ml: 'ml', kg: 'kg' },
  attrs: {
    cap: {
      name: 'Intégrité du bouchon et de la bague',
      hint: 'Fermeture étanche, bague sans fissure.',
      defect: 'Bague de sécurité fissurée',
    },
    label: {
      name: 'Alignement de l’étiquette',
      hint: 'Centrée ±2 mm, sans plis ni bulles.',
      defect: 'Étiquette décentrée ou froissée',
    },
    seal: {
      name: 'Intégrité du scellage du carton',
      hint: 'Ruban entièrement fermé, sans déchirure ni jour.',
      defect: 'Scellage du carton ouvert ou déchiré',
    },
    code: {
      name: 'Lisibilité du code lot',
      hint: 'Code lot et code-barres lisibles.',
      defect: 'Code lot illisible',
    },
  },
  measures: {
    volume: { name: 'Volume de remplissage', over: 'Surremplissage', under: 'Sous-remplissage' },
    weight: { name: 'Poids du colis', over: 'Poids excessif', under: 'Poids insuffisant' },
  },

  inspected: 'Inspectées',
  isoLimits: 'Limites ISO',
  proposal: 'Proposition du système',
  rejectLot: 'Rejeter le lot',
  acceptLot: 'Accepter le lot',
  pendingLot: 'Échantillonnage incomplet',
  pendingNote: (remaining) => `Contrôlez encore ${remaining} unités avant de signer.`,
  signLocked: 'La signature sera disponible une fois l’échantillon complet.',
  recorded: 'Défauts enregistrés',
  noDefects: 'Aucun défaut enregistré.',
  severity: { critical: 'Critique', major: 'Majeur', minor: 'Mineur' },
  pinTitle: 'Signature par PIN',
  clear: 'Effacer',
  sign: 'Signer',
  signedHold: (name) => `Lot EN ATTENTE · signé par ${name}`,
  signedAccept: (name) => `Lot accepté · signé par ${name}`,
  newInspection: 'Nouvelle inspection',
  defectAdded: (id) => `Défaut enregistré · ${id}`,
  defectRemoved: (id) => `Défaut retiré · ${id}`,
};

const AR: Dict = {
  pageTitle: 'الفحص',
  plant: 'المصنع الشمالي',
  userName: 'بشرى علالي',
  userRole: 'مراقب جودة',
  stepsLabel: 'خطوات الفحص',
  language: 'اللغة',

  steps: ['الدفعة', 'المعاينة', 'الوحدات', 'القرار'],
  h: ['اختيار الدفعة للفحص', 'نتيجة المعاينة', 'فحص الوحدات', 'القرار النهائي للدفعة'],
  p1: 'حدد خط الإنتاج وأمر التصنيع والدفعة النشطة.',
  p2: (lotId) => `تم احتساب حجم العينة وفق ISO 2859-1 للدفعة ${lotId}.`,
  p3: 'سجّل كل خاصية، وسجّل العيب فور اكتشافه.',
  p4: 'أدخل رمز PIN المكون من 4 أرقام للاعتماد.',

  fl: 'خط الإنتاج',
  fw: 'أمر التصنيع',
  fb: 'الدفعة النشطة',
  lines: { line1: 'الخط 1 – التغليف', line2: 'الخط 2 – التعبئة' },
  lotDetails: 'بيانات الدفعة',
  shifts: { morning: 'وردية الصباح', afternoon: 'وردية المساء' },
  products: { water: 'مياه معدنية 1.5 لتر', waterPack: 'مياه معدنية 1.5 لتر · عبوة من 6' },
  unitsWord: 'وحدة',
  planLabel: 'خطة الفحص المعتمدة',
  approved: 'معتمدة',
  plans: {
    filling: { name: 'فحص التعبئة والغطاء', stage: 'التعبئة النهائية' },
    packaging: { name: 'فحص التغليف والملصق', stage: 'التغليف النهائي' },
  },
  planMeta: (stage, count, version) => `${stage} · ${count} خصائص · ${version}`,
  cont: 'متابعة',
  back: 'رجوع',

  lotSize: 'حجم الدفعة',
  level: 'مستوى الفحص',
  normal: 'عادي',
  sampleSize: 'حجم العينة',
  accept: 'رقم القبول (Ac)',
  reject: 'رقم الرفض (Re)',
  maxN: (n) => `${n} كحد أقصى`,
  orMore: (n) => `${n} فأكثر`,
  samplingNote: (n, ac, re) =>
    `افحص ${n} وحدة عشوائياً. تُقبل الدفعة إذا كانت الوحدات المعيبة ≤ ${ac} (Ac)، وتُرفض عند ${re} (Re) أو أكثر.`,
  startInsp: 'بدء الفحص',

  unit: 'الوحدة',
  of: 'من',
  defective: 'الوحدات المعيبة',
  conforming: 'مطابق',
  nonConforming: 'غير مطابق',
  recordDefect: 'تسجيل عيب',
  defectLogged: 'تم تسجيل العيب',
  previous: 'السابقة',
  nextUnit: 'الوحدة التالية',
  toDecision: 'الانتقال للقرار',
  target: 'Target',
  outOfLimit: (value, unit, direction, limit) =>
    `خارج الحد المسموح: ${value} ${unit}، ${direction === 'over' ? 'الحد الأقصى' : 'الحد الأدنى'} ${limit} ${unit}`,
  blockedRecord: 'سجّل العيب قبل الانتقال إلى الوحدة التالية.',
  blockedValue: 'أدخل القيمة المقاسة للمتابعة.',
  unitNames: { ml: 'مل', kg: 'كغ' },
  attrs: {
    cap: {
      name: 'سلامة الغطاء وحلقة الأمان',
      hint: 'إغلاق محكم دون تشققات في الحلقة.',
      defect: 'تشقق حلقة الأمان للغطاء',
    },
    label: {
      name: 'محاذاة الملصق',
      hint: 'توسيط ±2 مم دون تجاعيد أو فقاعات.',
      defect: 'ملصق غير محاذٍ أو متجعد',
    },
    seal: {
      name: 'سلامة إغلاق الكرتونة',
      hint: 'شريط لاصق مغلق بالكامل دون تمزق أو فراغات.',
      defect: 'إغلاق الكرتونة مفتوح أو ممزق',
    },
    code: {
      name: 'وضوح رمز الدفعة',
      hint: 'رمز الدفعة والباركود مقروءان.',
      defect: 'رمز الدفعة غير مقروء',
    },
  },
  measures: {
    volume: { name: 'حجم التعبئة', over: 'زيادة في حجم التعبئة', under: 'نقص في حجم التعبئة' },
    weight: { name: 'وزن العبوة', over: 'زيادة في الوزن', under: 'نقص في الوزن' },
  },

  inspected: 'المفحوصة',
  isoLimits: 'حدود ISO',
  proposal: 'مقترح النظام',
  rejectLot: 'رفض الدفعة',
  acceptLot: 'قبول الدفعة',
  pendingLot: 'المعاينة غير مكتملة',
  pendingNote: (remaining) => `افحص ${remaining} وحدة إضافية قبل التوقيع.`,
  signLocked: 'يتاح التوقيع عند اكتمال العينة.',
  recorded: 'العيوب المسجلة',
  noDefects: 'لا توجد عيوب مسجلة.',
  severity: { critical: 'حرج', major: 'رئيسي', minor: 'ثانوي' },
  pinTitle: 'التوقيع برمز PIN',
  clear: 'مسح',
  sign: 'توقيع',
  signedHold: (name) => `الدفعة قيد الحجز · وقّعها ${name}`,
  signedAccept: (name) => `تم قبول الدفعة · وقّعها ${name}`,
  newInspection: 'فحص جديد',
  defectAdded: (id) => `تم تسجيل العيب ${id}`,
  defectRemoved: (id) => `تمت إزالة العيب ${id}`,
};

const DICT: Record<Lang, Dict> = { en: EN, fr: FR, ar: AR };

/* ==========================================================================
   Hooks
   ========================================================================== */

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return allowed.find((a) => a === value) ?? fallback;
  } catch {
    return fallback; // storage blocked (private mode, etc.)
  }
}

/** Language preference. Written to <html> (lang, dir) so CSS can react. */
function usePreferences() {
  const [lang, setLang] = useState<Lang>(() => readStored('crucible.lang', LANGS, 'fr'));

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem('crucible.lang', lang);
    } catch {
      /* storage blocked — the preference just won't persist */
    }
  }, [lang]);

  return { lang, setLang };
}

/** One message at a time; the text is kept while it fades out. */
function useToast() {
  const [state, setState] = useState({ text: '', visible: false });
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setState({ text, visible: true });
    timer.current = window.setTimeout(() => setState((s) => ({ ...s, visible: false })), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { ...state, show };
}

/**
 * All the state of one inspection: current step and unit, readings, recorded
 * defects, PIN and signature. `reset()` starts over (new lot or new inspection).
 */
function useInspectionSession(
  plan: Plan,
  sampling: SamplingPlan,
  onDefectEvent: (event: DefectEvent) => void,
) {
  const [step, setStep] = useState<Step>(1);
  const [unit, setUnit] = useState(1);
  const [volumes, setVolumes] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [defects, setDefects] = useState<Defect[]>([]);
  const [defectSeq, setDefectSeq] = useState(FIRST_DEFECT_NO);
  const [pin, setPin] = useState('');
  const [signed, setSigned] = useState(false);

  const locked = signed; // after signing, the inspection is read-only

  /* ---- Reading the current unit ---- */

  const defectOf = (key: CharacteristicKey) =>
    defects.find((d) => d.unit === unit && d.key === key);

  // Readings start empty: the inspector must type every measured value
  // (a pre-filled value could be recorded without anything being measured).
  const rawValueOf = (c: MeasureCharacteristic) => volumes[`${unit}:${c.key}`] ?? '';

  /** Why "Next unit" is disabled right now, if it is. */
  const blockReason = (): 'value' | 'record' | null => {
    if (locked) return null;
    for (const c of plan.characteristics) {
      if (c.kind !== 'measure') continue;
      const status = evaluateMeasure(c, rawValueOf(c));
      if (status.state === 'invalid') return 'value';
      if (status.state === 'out' && !defectOf(c.key)) return 'record';
    }
    return null;
  };

  /* ---- Defects ---- */

  const addDefect = (draft: Omit<Defect, 'id'>) => {
    const id = formatDefectId(defectSeq);
    setDefectSeq((n) => n + 1);
    setDefects((prev) => [...prev, { ...draft, id }]);
    onDefectEvent({ type: 'added', id });
  };

  const removeDefect = (id: string) => {
    setDefects((prev) => prev.filter((d) => d.id !== id));
    onDefectEvent({ type: 'removed', id });
  };

  const setAttribute = (c: AttributeCharacteristic, nonConforming: boolean) => {
    if (locked) return;
    const existing = defectOf(c.key);
    if (nonConforming && !existing) addDefect({ unit, key: c.key, severity: c.severity });
    if (!nonConforming && existing) removeDefect(existing.id);
  };

  const changeMeasure = (c: MeasureCharacteristic, raw: string) => {
    if (locked) return;
    setVolumes((prev) => ({ ...prev, [`${unit}:${c.key}`]: raw }));

    // A recorded defect follows the reading: it disappears when the value is
    // back in limits and flips over/under if the value crosses the other limit.
    const existing = defectOf(c.key);
    if (!existing) return;
    const status = evaluateMeasure(c, raw);
    if (status.state === 'ok') {
      removeDefect(existing.id);
    } else if (status.state === 'out') {
      setDefects((prev) =>
        prev.map((d) =>
          d.id === existing.id ? { ...d, direction: status.direction, value: status.value } : d,
        ),
      );
    }
  };

  const recordMeasureDefect = (c: MeasureCharacteristic) => {
    if (locked || defectOf(c.key)) return;
    const status = evaluateMeasure(c, rawValueOf(c));
    if (status.state !== 'out') return;
    addDefect({
      unit,
      key: c.key,
      severity: c.severity,
      direction: status.direction,
      value: status.value,
    });
  };

  /* ---- Moving between units ---- */

  const previousUnit = () => setUnit((u) => Math.max(1, u - 1));

  const advance = () => {
    if (!locked) setCompleted((prev) => ({ ...prev, [unit]: true }));
    if (unit < sampling.sampleSize) setUnit(unit + 1);
    else setStep(4);
  };

  /* ---- Decision ---- */

  const defectiveUnits = useMemo(() => new Set(defects.map((d) => d.unit)).size, [defects]);
  const inspected = Object.keys(completed).length;

  // Rejection can be decided early (Re reached); acceptance needs the full sample.
  const outcome: Outcome =
    defectiveUnits >= sampling.re ? 'reject' : inspected >= sampling.sampleSize ? 'accept' : 'pending';

  const canSign = !signed && outcome !== 'pending' && pin.length === 4;

  const pressDigit = (digit: string) => {
    if (!locked) setPin((p) => (p.length < 4 ? p + digit : p));
  };
  const clearPin = () => {
    if (!locked) setPin('');
  };

  /** Prototype: any 4-digit PIN signs. Returns true when the signature went through. */
  const sign = () => {
    if (!canSign) return false;
    setSigned(true);
    return true;
  };

  const reset = () => {
    setStep(1);
    setUnit(1);
    setVolumes({});
    setCompleted({});
    setDefects([]);
    setPin('');
    setSigned(false);
  };

  return {
    step,
    setStep,
    unit,
    locked,
    defects,
    defectOf,
    rawValueOf,
    blockReason,
    setAttribute,
    changeMeasure,
    recordMeasureDefect,
    previousUnit,
    advance,
    defectiveUnits,
    inspected,
    outcome,
    pin,
    signed,
    canSign,
    pressDigit,
    clearPin,
    sign,
    reset,
  };
}

type Session = ReturnType<typeof useInspectionSession>;

/* ==========================================================================
   Header + preferences  (→ components/layout)
   ========================================================================== */

/** Brand mark — replace the file src/assets/brand/logo.svg to update it. */
function Logo() {
  return <img src={logoUrl} width={24} height={24} alt="" aria-hidden="true" />;
}

/** Arrow that points the reading direction (flipped in RTL by CSS). */
function Arrow() {
  return (
    <svg className="icon-dir" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Languages shown in the switch. EN stays available for development only. */
const SWITCH_LANGS: readonly Lang[] = ['fr', 'ar'];

interface HeaderProps {
  t: Dict;
  lang: Lang;
  lineKey: LineKey;
  onLang: (lang: Lang) => void;
}

function AppHeader({ t, lang, lineKey, onLang }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="brand" dir="ltr">
          <Logo />
          <span className="brand__name">CRUCIBLE</span>
        </div>
        <span className="app-header__tab">{t.pageTitle}</span>
      </div>
      <div className="app-header__right">
        <span className="app-header__context">
          {t.plant} · {t.lines[lineKey]}
        </span>
        <div className="segmented segmented--sm" dir="ltr" role="group" aria-label={t.language}>
          {SWITCH_LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={l === lang ? 'is-on' : undefined}
              aria-pressed={l === lang}
              onClick={() => onLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="avatar" dir="ltr" title={`${t.userName} · ${t.userRole}`}>
          BA
        </div>
      </div>
    </header>
  );
}

/* ==========================================================================
   Step 1 — Lot
   ========================================================================== */

interface LotStepProps {
  t: Dict;
  lang: Lang;
  line: Line;
  workOrder: WorkOrder;
  lot: Lot;
  plan: Plan;
  onLine: (key: LineKey) => void;
  onWorkOrder: (id: string) => void;
  onLot: (id: string) => void;
  onContinue: () => void;
}

function LotStep({
  t,
  lang,
  line,
  workOrder,
  lot,
  plan,
  onLine,
  onWorkOrder,
  onLot,
  onContinue,
}: LotStepProps) {
  const planText = t.plans[line.plan];

  return (
    <section className="glass panel">
      <div className="grid grid--3">
        <label className="field-group">
          <span className="label">{t.fl}</span>
          <select
            className="field"
            value={line.key}
            onChange={(e) => onLine(e.target.value as LineKey)}
          >
            {LINES.map((l) => (
              <option key={l.key} value={l.key}>
                {t.lines[l.key]}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group">
          <span className="label">{t.fw}</span>
          <select
            className="field mono"
            dir="ltr"
            value={workOrder.id}
            onChange={(e) => onWorkOrder(e.target.value)}
          >
            {line.workOrders.map((w) => (
              <option key={w.id} value={w.id}>
                {w.id} · {w.shift === 'morning' ? 'AM' : 'PM'}
              </option>
            ))}
          </select>
        </label>

        <label className="field-group">
          <span className="label">{t.fb}</span>
          <select
            className="field mono"
            dir="ltr"
            value={lot.id}
            onChange={(e) => onLot(e.target.value)}
          >
            {workOrder.lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} ({formatInt(l.size, lang)})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid--2">
        <div className="inset card">
          <div className="card__row">
            <span className="label">{t.lotDetails}</span>
            <span className="pill pill--info">{t.shifts[workOrder.shift]}</span>
          </div>
          <span className="mono card__value" dir="ltr">
            {lot.id}
          </span>
          <span className="card__meta">
            {t.products[line.product]} · {formatInt(lot.size, lang)} {t.unitsWord}
          </span>
        </div>

        <div className="inset card">
          <div className="card__row">
            <span className="label">{t.planLabel}</span>
            <span className="pill pill--ok">{t.approved}</span>
          </div>
          <span className="card__value card__value--text">{planText.name}</span>
          <span className="card__meta">
            {t.planMeta(planText.stage, plan.characteristics.length, plan.version)}
          </span>
        </div>
      </div>

      <div className="step-actions step-actions--end">
        <button type="button" className="btn btn--primary" onClick={onContinue}>
          {t.cont}
          <Arrow />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   Step 2 — Sampling
   ========================================================================== */

interface SamplingStepProps {
  t: Dict;
  lang: Lang;
  lot: Lot;
  sampling: SamplingPlan;
  onBack: () => void;
  onStart: () => void;
}

function SamplingStep({ t, lang, lot, sampling, onBack, onStart }: SamplingStepProps) {
  return (
    <section className="glass panel">
      <div className="grid grid--3">
        <div className="inset stat">
          <div className="label">{t.lotSize}</div>
          <div className="mono stat__value">{formatInt(lot.size, lang)}</div>
        </div>
        <div className="inset stat">
          <div className="label">{t.level}</div>
          <div className="mono stat__value">
            {lot.level} – {t.normal}
          </div>
        </div>
        <div className="inset stat">
          <div className="label">AQL</div>
          <div className="mono stat__value" dir="ltr">
            {AQL} %
          </div>
        </div>
        <div className="inset stat stat--accent">
          <div className="label">{t.sampleSize}</div>
          <div className="mono stat__value">
            {sampling.sampleSize} {t.unitsWord}
          </div>
        </div>
        <div className="inset stat stat--lg stat--ok">
          <div className="label">{t.accept}</div>
          <div className="mono stat__value">{t.maxN(sampling.ac)}</div>
        </div>
        <div className="inset stat stat--lg stat--err">
          <div className="label">{t.reject}</div>
          <div className="mono stat__value">{t.orMore(sampling.re)}</div>
        </div>
      </div>

      <p className="inset note">{t.samplingNote(sampling.sampleSize, sampling.ac, sampling.re)}</p>

      <div className="step-actions">
        <button type="button" className="btn" onClick={onBack}>
          {t.back}
        </button>
        <button type="button" className="btn btn--primary" onClick={onStart}>
          {t.startInsp}
          <Arrow />
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   Step 3 — Unit inspection
   ========================================================================== */

interface AttributeRowProps {
  t: Dict;
  c: AttributeCharacteristic;
  defect: Defect | undefined;
  locked: boolean;
  onChange: (nonConforming: boolean) => void;
}

function AttributeRow({ t, c, defect, locked, onChange }: AttributeRowProps) {
  const text = t.attrs[c.key];
  const conforming = !defect;

  return (
    <div className="char-row">
      <div>
        <div className="char-row__name">{text.name}</div>
        <div className="char-row__hint">{text.hint}</div>
        {defect && (
          <div className="mono char-row__defect" dir="ltr">
            {defect.id}
          </div>
        )}
      </div>
      <div className="char-row__actions" role="group" aria-label={text.name}>
        <button
          type="button"
          className="choice choice--ok"
          aria-pressed={conforming}
          disabled={locked}
          onClick={() => onChange(false)}
        >
          {t.conforming}
        </button>
        <button
          type="button"
          className="choice choice--err"
          aria-pressed={!conforming}
          disabled={locked}
          onClick={() => onChange(true)}
        >
          {t.nonConforming}
        </button>
      </div>
    </div>
  );
}

interface MeasureRowProps {
  t: Dict;
  c: MeasureCharacteristic;
  raw: string;
  defect: Defect | undefined;
  locked: boolean;
  onChange: (raw: string) => void;
  onRecord: () => void;
}

function MeasureRow({ t, c, raw, defect, locked, onChange, onRecord }: MeasureRowProps) {
  const text = t.measures[c.key];
  const status = evaluateMeasure(c, raw);
  const isOut = status.state === 'out';

  return (
    <div className="char-row">
      <div>
        <div className="char-row__name">{text.name}</div>
        <div className="char-row__hint char-row__hint--limits">
          <bdi className="mono">
            LSL {c.lsl} · {t.target} {c.target} · USL {c.usl} {c.unit}
          </bdi>
        </div>
        {status.state === 'out' && (
          <div className="char-row__alert" role="alert">
            {t.outOfLimit(status.value, t.unitNames[c.unit], status.direction, status.limit)}
          </div>
        )}
        {defect && (
          <div className="mono char-row__defect" dir="ltr">
            {defect.id}
          </div>
        )}
      </div>

      <div className="measure-entry" dir="ltr">
        <input
          className={`field mono measure-entry__input${isOut ? ' is-invalid' : ''}`}
          inputMode="decimal"
          value={raw}
          disabled={locked}
          aria-label={text.name}
          aria-invalid={isOut}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="mono measure-entry__unit">{c.unit}</span>
        {isOut &&
          (defect ? (
            <span className="pill pill--err">{t.defectLogged}</span>
          ) : (
            <button type="button" className="btn btn--danger" disabled={locked} onClick={onRecord}>
              {t.recordDefect}
            </button>
          ))}
      </div>
    </div>
  );
}

interface UnitsStepProps {
  t: Dict;
  lot: Lot;
  plan: Plan;
  sampling: SamplingPlan;
  session: Session;
}

function UnitsStep({ t, lot, plan, sampling, session }: UnitsStepProps) {
  const { unit, locked, defectiveUnits } = session;
  const isLast = unit >= sampling.sampleSize;
  const block = session.blockReason();

  const tone: Tone =
    defectiveUnits === 0 ? 'ok' : defectiveUnits >= sampling.re ? 'err' : 'warn';

  return (
    <section className="stack">
      <div className="glass unit-bar">
        <div className="unit-bar__id">
          <span className="unit-bar__title">
            {t.unit} {unit} {t.of} {sampling.sampleSize}
          </span>
          <span className="mono inset chip" dir="ltr">
            {lot.id}
          </span>
        </div>
        <span className={`pill pill--lg pill--${tone}`}>
          {t.defective}: <b className="mono">{defectiveUnits}</b> / Ac {sampling.ac}
        </span>
      </div>

      <div className="glass char-list">
        {plan.characteristics.map((c) =>
          c.kind === 'attribute' ? (
            <AttributeRow
              key={`${unit}:${c.key}`}
              t={t}
              c={c}
              defect={session.defectOf(c.key)}
              locked={locked}
              onChange={(nonConforming) => session.setAttribute(c, nonConforming)}
            />
          ) : (
            <MeasureRow
              key={`${unit}:${c.key}`}
              t={t}
              c={c}
              raw={session.rawValueOf(c)}
              defect={session.defectOf(c.key)}
              locked={locked}
              onChange={(raw) => session.changeMeasure(c, raw)}
              onRecord={() => session.recordMeasureDefect(c)}
            />
          ),
        )}
      </div>

      <div className="step-actions">
        <button
          type="button"
          className="btn"
          disabled={unit <= 1}
          onClick={session.previousUnit}
        >
          {t.previous}
        </button>
        <div className="step-actions__end">
          {block && (
            <span className="hint hint--err">
              {block === 'record' ? t.blockedRecord : t.blockedValue}
            </span>
          )}
          <button
            type="button"
            className="btn btn--primary"
            disabled={block !== null}
            onClick={session.advance}
          >
            {isLast ? t.toDecision : t.nextUnit}
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Step 4 — Decision
   ========================================================================== */

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'sign'] as const;

function describeDefect(t: Dict, plan: Plan, d: Defect): string {
  const c = plan.characteristics.find((x) => x.key === d.key);
  if (!c) return d.key;
  if (c.kind === 'attribute') return t.attrs[c.key].defect;
  const over = d.direction !== 'under';
  const label = t.measures[c.key][over ? 'over' : 'under'];
  return `${label} (${over ? '>' : '<'} ${over ? c.usl : c.lsl} ${t.unitNames[c.unit]})`;
}

interface DecisionStepProps {
  t: Dict;
  plan: Plan;
  sampling: SamplingPlan;
  session: Session;
  onSign: () => void;
  onNewInspection: () => void;
}

function DecisionStep({ t, plan, sampling, session, onSign, onNewInspection }: DecisionStepProps) {
  const { outcome, signed, pin, defects, defectiveUnits, inspected } = session;
  const remaining = Math.max(0, sampling.sampleSize - inspected);

  const proposal = {
    reject: { tone: 'err', title: t.rejectLot },
    accept: { tone: 'ok', title: t.acceptLot },
    pending: { tone: 'warn', title: t.pendingLot },
  }[outcome];

  const signedMessage =
    outcome === 'reject' ? t.signedHold(t.userName) : t.signedAccept(t.userName);

  return (
    <section className="decision">
      <div className="glass decision__main">
        {signed && (
          <div className={`pill banner pill--${outcome === 'reject' ? 'warn' : 'ok'}`}>
            <span>{signedMessage}</span>
            <button type="button" className="btn btn--sm" onClick={onNewInspection}>
              {t.newInspection}
            </button>
          </div>
        )}

        <div className="grid grid--3 grid--tight">
          <div className="inset summary">
            <div className="label">{t.inspected}</div>
            <div className="mono summary__value" dir="ltr">
              {inspected} / {sampling.sampleSize}
            </div>
          </div>
          <div className="inset summary">
            <div className="label">{t.defective}</div>
            <div className="mono summary__value summary__value--err">{defectiveUnits}</div>
          </div>
          <div className="inset summary">
            <div className="label">{t.isoLimits}</div>
            <div className="mono summary__value" dir="ltr">
              Ac {sampling.ac} / Re {sampling.re}
            </div>
          </div>
        </div>

        <div className={`inset proposal proposal--${proposal.tone}`}>
          <div className="label">{t.proposal}</div>
          <div className="proposal__title">{proposal.title}</div>
          {outcome === 'pending' && <div className="proposal__note">{t.pendingNote(remaining)}</div>}
        </div>

        <div>
          <span className="label section-label">{t.recorded}</span>
          <ul className="inset defect-list">
            {defects.length === 0 && <li className="defect-empty">{t.noDefects}</li>}
            {[...defects].reverse().map((d) => (
              <li key={d.id} className="defect-row">
                <span>
                  <span className="mono defect-row__id" dir="ltr">
                    {d.id}
                  </span>
                  {describeDefect(t, plan, d)}
                  <span className="defect-row__unit">
                    {t.unit} {d.unit}
                  </span>
                </span>
                <span className={`pill pill--${SEVERITY_TONE[d.severity]}`}>
                  {t.severity[d.severity]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass decision__sign">
        <div>
          <div className="pin-title">{t.pinTitle}</div>
          <div className="pin-sub">{outcome === 'pending' ? t.signLocked : t.p4}</div>
        </div>

        <div className="inset mono pin-display" aria-label={t.pinTitle}>
          {pin ? '•'.repeat(pin.length) : '—'}
        </div>

        <div className="keypad" dir="ltr">
          {KEYPAD.map((k) => {
            if (k === 'clear') {
              return (
                <button
                  key={k}
                  type="button"
                  className="key key--text"
                  disabled={signed || pin === ''}
                  onClick={session.clearPin}
                >
                  {t.clear}
                </button>
              );
            }
            if (k === 'sign') {
              return (
                <button
                  key={k}
                  type="button"
                  className="key key--primary"
                  disabled={!session.canSign}
                  onClick={onSign}
                >
                  {t.sign}
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                className="key"
                disabled={signed || pin.length >= 4}
                onClick={() => session.pressDigit(k)}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   Page
   ========================================================================== */

export default function InspectionPage() {
  const { lang, setLang } = usePreferences();
  const t = DICT[lang];
  const toast = useToast();

  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);

  const line = findLine(selection.lineKey);
  const workOrder = line.workOrders.find((w) => w.id === selection.workOrderId) ?? line.workOrders[0];
  const lot = workOrder.lots.find((l) => l.id === selection.lotId) ?? workOrder.lots[0];
  const plan = PLANS[line.plan];
  const sampling = useMemo(() => getSamplingPlan(lot.size, lot.level), [lot]);

  const session = useInspectionSession(plan, sampling, (event) =>
    toast.show(event.type === 'added' ? t.defectAdded(event.id) : t.defectRemoved(event.id)),
  );

  // Picking a different lot always starts a fresh inspection.
  const selectLine = (key: LineKey) => {
    const next = findLine(key);
    const firstOrder = next.workOrders[0];
    setSelection({ lineKey: key, workOrderId: firstOrder.id, lotId: firstOrder.lots[0].id });
    session.reset();
  };

  const selectWorkOrder = (id: string) => {
    const next = line.workOrders.find((w) => w.id === id);
    if (!next) return;
    setSelection({ lineKey: line.key, workOrderId: next.id, lotId: next.lots[0].id });
    session.reset();
  };

  const selectLot = (id: string) => {
    setSelection({ lineKey: line.key, workOrderId: workOrder.id, lotId: id });
    session.reset();
  };

  const handleSign = () => {
    if (!session.sign()) return;
    toast.show(session.outcome === 'reject' ? t.signedHold(t.userName) : t.signedAccept(t.userName));
  };

  const { step, setStep } = session;
  const subtitle = [t.p1, t.p2(lot.id), t.p3, t.p4][step - 1];

  return (
    <div className="app">
      <AppHeader t={t} lang={lang} lineKey={line.key} onLang={setLang} />

      <main className="app-main">
        <nav className="glass step-card" aria-label={t.stepsLabel}>
          <ol className="step-nav">
            {t.steps.map((label, i) => {
              const n = (i + 1) as Step;
              return (
                <li key={n}>
                  <button
                    type="button"
                    className={`nav-step${step === n ? ' is-active' : ''}`}
                    aria-current={step === n ? 'step' : undefined}
                    onClick={() => setStep(n)}
                  >
                    <span className="nav-step__no">{n}</span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="page-head__text">
          <h1 className="page-title">{t.h[step - 1]}</h1>
          <p className="page-sub">{subtitle}</p>
        </div>

        {step === 1 && (
          <LotStep
            t={t}
            lang={lang}
            line={line}
            workOrder={workOrder}
            lot={lot}
            plan={plan}
            onLine={selectLine}
            onWorkOrder={selectWorkOrder}
            onLot={selectLot}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <SamplingStep
            t={t}
            lang={lang}
            lot={lot}
            sampling={sampling}
            onBack={() => setStep(1)}
            onStart={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <UnitsStep t={t} lot={lot} plan={plan} sampling={sampling} session={session} />
        )}

        {step === 4 && (
          <DecisionStep
            t={t}
            plan={plan}
            sampling={sampling}
            session={session}
            onSign={handleSign}
            onNewInspection={() => {
              setSelection(DEFAULT_SELECTION);
              session.reset();
            }}
          />
        )}
      </main>

      <div className="glass toast" role="status" aria-live="polite" data-visible={toast.visible}>
        {toast.text}
      </div>
    </div>
  );
}