/**
 * Arabic letters (Huruf) from Alif to Ya — for Awwal Arabic Hub.
 * Each letter has isolated, initial, medial, and final forms where applicable.
 * Non-connecting letters: Alif, Daal, Dhaal, Raa, Zaay, Waaw, and (in some fonts) others use isolated form in all positions.
 */

export interface LetterForms {
  isolated: string
  initial: string
  medial: string
  final: string
}

export interface Letter {
  id: string
  name: string
  nameAr: string
  forms: LetterForms
  /** Whether this letter connects to the following letter (right side) */
  connectsForward: boolean
  /** Whether this letter connects to the previous letter (left side) */
  connectsBackward: boolean
  /** Pronunciation / articulation tip for beginners */
  articulation: string
  /** Optional IPA or transliteration hint */
  soundHint: string
  /** Group for curriculum (e.g. similar shapes) */
  group?: string
}

export const ARABIC_LETTERS: Letter[] = [
  {
    id: 'alif',
    name: 'Alif',
    nameAr: 'ألف',
    forms: { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' },
    connectsForward: false,
    connectsBackward: true,
    articulation: 'A straight vertical stroke. Sound: long "a" (as in "father") or a carrier for hamza.',
    soundHint: 'ā / a',
    group: 'alif',
  },
  {
    id: 'baa',
    name: 'Baa',
    nameAr: 'باء',
    forms: { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'One dot below. Lips together, then release for a soft "b".',
    soundHint: 'b',
    group: 'baa-taa-thaa',
  },
  {
    id: 'taa',
    name: 'Taa',
    nameAr: 'تاء',
    forms: { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Two dots above. Same mouth position as Baa but with tongue for "t".',
    soundHint: 't',
    group: 'baa-taa-thaa',
  },
  {
    id: 'thaa',
    name: 'Thaa',
    nameAr: 'ثاء',
    forms: { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Three dots above. Like "th" in "think" — tongue between teeth.',
    soundHint: 'th',
    group: 'baa-taa-thaa',
  },
  {
    id: 'jiim',
    name: 'Jiim',
    nameAr: 'جيم',
    forms: { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'One dot below the bowl. Soft "j" as in "jam" or "jeans".',
    soundHint: 'j',
    group: 'jiim-haa-khaa',
  },
  {
    id: 'haa',
    name: 'Haa',
    nameAr: 'حاء',
    forms: { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'No dots. Strong "h" from the throat — breath from deep in the chest.',
    soundHint: 'ḥ',
    group: 'jiim-haa-khaa',
  },
  {
    id: 'khaa',
    name: 'Khaa',
    nameAr: 'خاء',
    forms: { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'One dot above. Like "ch" in Scottish "loch" — raspy, from the throat.',
    soundHint: 'kh',
    group: 'jiim-haa-khaa',
  },
  {
    id: 'daal',
    name: 'Daal',
    nameAr: 'دال',
    forms: { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' },
    connectsForward: false,
    connectsBackward: true,
    articulation: 'Does not connect to the next letter. Light "d" — tip of tongue to upper teeth.',
    soundHint: 'd',
  },
  {
    id: 'dhaal',
    name: 'Dhaal',
    nameAr: 'ذال',
    forms: { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' },
    connectsForward: false,
    connectsBackward: true,
    articulation: 'One dot above. Like "th" in "this" or "that" — voiced.',
    soundHint: 'dh',
  },
  {
    id: 'raa',
    name: 'Raa',
    nameAr: 'راء',
    forms: { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' },
    connectsForward: false,
    connectsBackward: true,
    articulation: 'Does not connect forward. Rolled or tapped "r" with the tongue tip.',
    soundHint: 'r',
  },
  {
    id: 'zaay',
    name: 'Zaay',
    nameAr: 'زاي',
    forms: { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' },
    connectsForward: false,
    connectsBackward: true,
    articulation: 'Same shape as Raa with a dot above. Clear "z" sound.',
    soundHint: 'z',
  },
  {
    id: 'siin',
    name: 'Siin',
    nameAr: 'سين',
    forms: { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Three teeth. Soft "s" — air over the tongue.',
    soundHint: 's',
  },
  {
    id: 'shiin',
    name: 'Shiin',
    nameAr: 'شين',
    forms: { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Three teeth with three dots above. "Sh" as in "ship".',
    soundHint: 'sh',
  },
  {
    id: 'saad',
    name: 'Saad',
    nameAr: 'صاد',
    forms: { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Heavy "s" — deeper from the throat, with emphasis.',
    soundHint: 'ṣ',
    group: 'emphatics',
  },
  {
    id: 'daad',
    name: 'Daad',
    nameAr: 'ضاد',
    forms: { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Heavy "d" — unique to Arabic, pronounced with side of tongue.',
    soundHint: 'ḍ',
    group: 'emphatics',
  },
  {
    id: 'taa-heavy',
    name: 'Taa (heavy)',
    nameAr: 'طاء',
    forms: { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Heavy "t" — deeper and more emphatic than light Taa.',
    soundHint: 'ṭ',
    group: 'emphatics',
  },
  {
    id: 'dhaa',
    name: 'Dhaa',
    nameAr: 'ظاء',
    forms: { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Heavy "th/dh" — emphatic version of Dhaal.',
    soundHint: 'ẓ',
    group: 'emphatics',
  },
  {
    id: 'ain',
    name: 'Ain',
    nameAr: 'عين',
    forms: { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Guttural sound from the throat — no English equivalent. Like a gentle choke.',
    soundHint: 'ʿ',
  },
  {
    id: 'ghain',
    name: 'Ghain',
    nameAr: 'غين',
    forms: { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Like French "r" or soft "gh" — raspy, from the back of the throat.',
    soundHint: 'gh',
  },
  {
    id: 'faa',
    name: 'Faa',
    nameAr: 'فاء',
    forms: { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'One dot above. "F" — upper teeth on lower lip.',
    soundHint: 'f',
  },
  {
    id: 'qaaf',
    name: 'Qaaf',
    nameAr: 'قاف',
    forms: { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Deep "q" from the back of the throat — not like English "k".',
    soundHint: 'q',
  },
  {
    id: 'kaaf',
    name: 'Kaaf',
    nameAr: 'كاف',
    forms: { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Soft "k" — further forward than Qaaf.',
    soundHint: 'k',
  },
  {
    id: 'laam',
    name: 'Laam',
    nameAr: 'لام',
    forms: { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Clear "l" — tip of tongue to roof of mouth.',
    soundHint: 'l',
  },
  {
    id: 'miim',
    name: 'Miim',
    nameAr: 'ميم',
    forms: { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Lips together for "m".',
    soundHint: 'm',
  },
  {
    id: 'nuun',
    name: 'Nuun',
    nameAr: 'نون',
    forms: { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Tip of tongue to teeth for "n".',
    soundHint: 'n',
  },
  {
    id: 'haa-light',
    name: 'Haa (light)',
    nameAr: 'هاء',
    forms: { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Light "h" — gentle breath, like English "h".',
    soundHint: 'h',
  },
  {
    id: 'waaw',
    name: 'Waaw',
    nameAr: 'واو',
    forms: { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' },
    connectsForward: false,
    connectsBackward: true,
    articulation: 'Can be long "u" (oo) or consonant "w".',
    soundHint: 'w / ū',
  },
  {
    id: 'yaa',
    name: 'Yaa',
    nameAr: 'ياء',
    forms: { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' },
    connectsForward: true,
    connectsBackward: true,
    articulation: 'Long "ee" (y) or consonant "y" as in "yes".',
    soundHint: 'y / ī',
  },
]

export const LETTERS_BY_ID = new Map(ARABIC_LETTERS.map((l) => [l.id, l]))
export function getLetter(id: string): Letter | undefined {
  return LETTERS_BY_ID.get(id)
}
