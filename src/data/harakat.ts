/**
 * Arabic vowel marks (Harakat / Arakat) for Awwal Arabic Hub.
 * Covers Fatha, Kasra, Damma, Sukūn, Tanwīn, Shadda, and Maddah.
 */

export interface Haraka {
  id: string
  name: string
  nameAr: string
  symbol: string
  /** Symbol when combined with a letter (e.g. above/below) */
  symbolWithLetter: string
  description: string
  /** Example: "ba" for Fatha on Baa */
  exampleSound: string
  /** Short tip for learners */
  tip: string
}

export const HARAKAT: Haraka[] = [
  {
    id: 'fatha',
    name: 'Fatha',
    nameAr: 'فتحة',
    symbol: 'َ',
    symbolWithLetter: 'َ',
    description: 'Short vowel "a" — a small diagonal stroke above the letter. Opens the sound to "a" as in "cat".',
    exampleSound: 'ba (بَ)',
    tip: 'Think "open mouth" — Fatha gives the "a" sound.',
  },
  {
    id: 'kasra',
    name: 'Kasra',
    nameAr: 'كسرة',
    symbol: 'ِ',
    symbolWithLetter: 'ِ',
    description: 'Short vowel "i" — a small diagonal stroke below the letter. Like "i" in "sit".',
    exampleSound: 'bi (بِ)',
    tip: 'Below the letter — Kasra gives the "i" sound.',
  },
  {
    id: 'damma',
    name: 'Damma',
    nameAr: 'ضمة',
    symbol: 'ُ',
    symbolWithLetter: 'ُ',
    description: 'Short vowel "u" — a small curl above the letter. Like "u" in "put".',
    exampleSound: 'bu (بُ)',
    tip: 'Looks like a small "waw" — Damma gives the "u" sound.',
  },
  {
    id: 'sukun',
    name: 'Sukūn',
    nameAr: 'سكون',
    symbol: 'ْ',
    symbolWithLetter: 'ْ',
    description: 'No vowel — the letter is "resting". The consonant is pronounced without a following vowel.',
    exampleSound: 'b (بْ) — just the consonant',
    tip: 'Sukūn = silence on that letter; no "a", "i", or "u" after it.',
  },
  {
    id: 'tanwin-fath',
    name: 'Tanwīn Fath (Fathatayn)',
    nameAr: 'تنوين فتح',
    symbol: 'ً',
    symbolWithLetter: 'ً',
    description: 'Double Fatha — indicates indefinite "an" at the end of a word (nasb).',
    exampleSound: 'ban (بً) — "a/an" ending',
    tip: 'Two Fathas = "an" sound at the end (e.g. kitāban = a book).',
  },
  {
    id: 'tanwin-kasr',
    name: 'Tanwīn Kasr (Kasratayn)',
    nameAr: 'تنوين كسر',
    symbol: 'ٍ',
    symbolWithLetter: 'ٍ',
    description: 'Double Kasra — indicates indefinite "in" ending (jarr).',
    exampleSound: 'bin (بٍ)',
    tip: 'Two Kasras = "in" ending in grammar.',
  },
  {
    id: 'tanwin-damm',
    name: 'Tanwīn Damm (Dammatayn)',
    nameAr: 'تنوين ضم',
    symbol: 'ٌ',
    symbolWithLetter: 'ٌ',
    description: 'Double Damma — indicates indefinite "un" ending (rafa).',
    exampleSound: 'bun (بٌ)',
    tip: 'Two Dammas = "un" ending (e.g. kitābun = a book, nominative).',
  },
  {
    id: 'shadda',
    name: 'Shadda',
    nameAr: 'شدة',
    symbol: 'ّ',
    symbolWithLetter: 'ّ',
    description: 'Doubling — the letter is pronounced twice (gemination). One letter, double the sound.',
    exampleSound: 'rabb (رَبّ) — double "b"',
    tip: 'Shadda = repeat the letter once; hold the sound a bit longer.',
  },
  {
    id: 'maddah',
    name: 'Maddah',
    nameAr: 'مدّة',
    symbol: 'آ',
    symbolWithLetter: 'آ',
    description: 'Extended Alif — hamza + Alif for long "ā" (two counts). Used in words like Allāh.',
    exampleSound: 'ā (آ) — long "a"',
    tip: 'Maddah is written above Alif for a long "aa" sound.',
  },
]

/** Harakat that can sit on any letter (short vowels + sukūn) */
export const SHORT_VOWELS = HARAKAT.filter((h) =>
  ['fatha', 'kasra', 'damma', 'sukun'].includes(h.id)
)

/** Tanwīn forms */
export const TANWIN = HARAKAT.filter((h) => h.id.startsWith('tanwin'))

export const HARAKAT_BY_ID = new Map(HARAKAT.map((h) => [h.id, h]))
export function getHaraka(id: string): Haraka | undefined {
  return HARAKAT_BY_ID.get(id)
}

/** Build letter + haraka combination for display (e.g. بَ بِ بُ بْ) */
export function letterWithHaraka(letter: string, harakaSymbol: string): string {
  if (harakaSymbol === 'ْ') return letter + harakaSymbol
  return letter + harakaSymbol
}
