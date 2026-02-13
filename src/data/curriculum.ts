import { ARABIC_LETTERS, type Letter } from './letters'
import { HARAKAT } from './harakat'
import { QURANIC_SURAHS } from './quranicVerses'

export type LessonCategory =
  | 'huruf'
  | 'positions'
  | 'harakat'
  | 'combination'
  | 'reading'
  | 'quran-reading'
  | 'tajweed'

export interface ExerciseChoice {
  id: string
  label: string
  isCorrect: boolean
}

export interface Exercise {
  id: string
  prompt: string
  promptArabic?: string
  promptNote?: string
  audioUrl?: string
  choices: ExerciseChoice[]
  /** For letter recognition: which letter this exercise is about */
  letterId?: string
  /** For haraka recognition */
  harakaId?: string
}

export interface Lesson {
  id: string
  title: string
  category: LessonCategory
  description: string
  objectives: string[]
  exercises: Exercise[]
  /** Letter IDs covered in this lesson (for display) */
  letterIds?: string[]
  /** Haraka IDs covered */
  harakaIds?: string[]
  /** Practice words for reading drills */
  practiceWords?: string[]
}

export type StageLabel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export interface Level {
  id: string
  title: string
  stageLabel: StageLabel
  description: string
  focus: string
  colorClass: string
  lessons: Lesson[]
}

// --- Build letter groups for Huruf Identification (Alif to Ya)
const LETTER_GROUPS = [
  { id: 'alif-thaa', title: 'Alif to Thaa (ا - ث)', ids: ['alif', 'baa', 'taa', 'thaa'] },
  { id: 'jiim-khaa', title: 'Jiim to Khaa (ج - خ)', ids: ['jiim', 'haa', 'khaa'] },
  { id: 'daal-zaay', title: 'Daal to Zaay (د - ز)', ids: ['daal', 'dhaal', 'raa', 'zaay'] },
  { id: 'siin-dhaa', title: 'Siin to Dhaa (س - ظ)', ids: ['siin', 'shiin', 'saad', 'daad', 'taa-heavy', 'dhaa'] },
  { id: 'ain-yaa', title: 'Ain to Yaa (ع - ي)', ids: ['ain', 'ghain', 'faa', 'qaaf', 'kaaf', 'laam', 'miim', 'nuun', 'haa-light', 'waaw', 'yaa'] },
]

function buildHurufIdentificationLessons(): Lesson[] {
  return LETTER_GROUPS.map((group) => {
    const letters = group.ids
      .map((id) => ARABIC_LETTERS.find((l) => l.id === id))
      .filter((l): l is Letter => Boolean(l))
    const exercises: Exercise[] = letters.slice(0, 5).map((letter) => {
      // The original code used 'i' to filter 'others'.
      // To maintain functionality and syntactic correctness after removing 'i' from map parameters,
      // we need to find the index of the current 'letter' to exclude it from 'others'.
      const currentIndex = letters.indexOf(letter);
      const others = letters.filter((_, j) => j !== currentIndex).slice(0, 2)
      return {
        id: `huruf-${letter.id}`,
        prompt: `Which letter is this?`,
        promptArabic: letter.forms.isolated,
        promptNote: letter.articulation,
        audioUrl: `http://localhost:3001/api/audio/letter/${letter.id}`,
        letterId: letter.id,
        choices: [
          { id: letter.id, label: `${letter.name} (${letter.forms.isolated})`, isCorrect: true },
          ...others.map((o) => ({
            id: o.id,
            label: `${o.name} (${o.forms.isolated})`,
            isCorrect: false as const,
          })),
        ],
      }
    })
    return {
      id: `huruf-${group.id}`,
      title: group.title,
      category: 'huruf',
      description: `Recognize and name each letter from ${group.title}. Focus on shape and sound.`,
      objectives: [
        'Identify each letter in isolation.',
        'Connect the visual shape with its name and sound.',
      ],
      letterIds: group.ids,
      exercises,
    }
  })
}

// --- Huruf Positions: one lesson per "connector" letter group
const POSITION_GROUPS = [
  { id: 'positions-baa-family', title: 'Baa, Taa, Thaa in words', ids: ['baa', 'taa', 'thaa'] },
  { id: 'positions-jiim-family', title: 'Jiim, Haa, Khaa in words', ids: ['jiim', 'haa', 'khaa'] },
  { id: 'positions-non-connectors', title: 'Daal, Dhaal, Raa, Zaay', ids: ['daal', 'dhaal', 'raa', 'zaay'] },
  { id: 'positions-rest', title: 'Remaining letters', ids: ['siin', 'shiin', 'saad', 'daad', 'ain', 'ghain', 'faa', 'qaaf', 'kaaf', 'laam', 'miim', 'nuun', 'haa-light', 'waaw', 'yaa'] },
]

function buildPositionsLessons(): Lesson[] {
  return POSITION_GROUPS.map((group) => {
    // Generate distinct exercises for each letter in the group
    // For each letter, we ask to identify Initial, Medial, and Final forms
    const exercises: Exercise[] = group.ids.flatMap((letterId) => {
      const letter = ARABIC_LETTERS.find((l) => l.id === letterId)
      if (!letter) return []

      const forms = [
        { type: 'initial', arabic: letter.forms.initial, label: 'Initial (Beginning)' },
        { type: 'medial', arabic: letter.forms.medial, label: 'Medial (Middle)' },
        { type: 'final', arabic: letter.forms.final, label: 'Final (End)' },
      ]

      return forms.map((form) => {
        // Create distractors from the *same* letter's other forms
        const distractors = forms
          .filter((f) => f.type !== form.type)
          .map((f) => ({
            id: f.type,
            label: f.arabic,
            isCorrect: false as const,
          }))

        const correctChoice = {
          id: form.type,
          label: form.arabic,
          isCorrect: true,
        }

        return {
          id: `pos-${group.id}-${letter.id}-${form.type}`,
          prompt: `Which is the ${form.label} form of ${letter.name}?`,
          promptArabic: letter.forms.isolated,
          promptNote: `Look for the shape that connects appropriately (${form.type}).`,
          choices: [correctChoice, ...distractors].sort(() => Math.random() - 0.5),
        }
      })
    })

    return {
      id: `positions-${group.id}`,
      title: group.title,
      category: 'positions',
      description: `Practice recognizing identifying Initial, Medial, and Final forms for ${group.ids.length} letters.`,
      objectives: [
        'Identify the initial form (start of word).',
        'Identify the medial form (middle of word).',
        'Identify the final form (end of word).',
      ],
      letterIds: group.ids,
      exercises,
    }
  })
}

// --- Arakat (Harakat) Mastery
function buildHarakatLessons(): Lesson[] {
  const mainVowels = HARAKAT.filter((h) =>
    ['fatha', 'kasra', 'damma', 'sukun'].includes(h.id)
  )
  const tanwin = HARAKAT.filter((h) => h.id.startsWith('tanwin'))

  // Helper to generate multiple exercises for vowel recognition
  const generateVowelExercises = (harakaIds: string[], count: number, startIdx: number): Exercise[] => {
    return Array.from({ length: count }).map((_, i) => {
      const letter = ARABIC_LETTERS[(startIdx + i) % ARABIC_LETTERS.length]
      const correctHaraka = HARAKAT.find(h => h.id === harakaIds[i % harakaIds.length])!
      const distractors = mainVowels.filter(h => h.id !== correctHaraka.id && harakaIds.includes(h.id)).slice(0, 2)

      return {
        id: `haraka-recog-${i}-${correctHaraka.id}`,
        prompt: `Which vowel is on this letter?`,
        promptArabic: `${letter.forms.isolated}${correctHaraka.symbol}`,
        promptNote: correctHaraka.tip,
        harakaId: correctHaraka.id,
        audioUrl: `http://localhost:3001/api/audio/haraka/${correctHaraka.id}`, // Generic audio if available
        choices: [
          { id: correctHaraka.id, label: correctHaraka.name, isCorrect: true },
          ...distractors.map(d => ({ id: d.id, label: d.name, isCorrect: false as const }))
        ].sort(() => Math.random() - 0.5)
      }
    })
  }

  return [
    {
      id: 'arakat-fatha-kasra-damma',
      title: 'Fatha, Kasra, and Damma',
      category: 'harakat',
      description: 'The three short vowels that give each letter an "a", "i", or "u" sound.',
      objectives: [
        'Recognize Fatha (َ), Kasra (ِ), and Damma (ُ).',
        'Read letter + vowel combinations (e.g. بَ بِ بُ).',
      ],
      harakaIds: ['fatha', 'kasra', 'damma'],
      practiceWords: ['بَ', 'بِ', 'بُ', 'تَ', 'تِ', 'تُ', 'جَ', 'جِ', 'جُ'],
      exercises: generateVowelExercises(['fatha', 'kasra', 'damma'], 15, 0)
    },
    {
      id: 'arakat-sukun',
      title: 'Sukūn — No Vowel',
      category: 'harakat',
      description: 'Sukūn indicates the letter is pronounced without a following vowel.',
      objectives: ['Recognize Sukūn (ْ).', 'Read consonant-only syllables.'],
      harakaIds: ['sukun'],
      practiceWords: ['بْ', 'تْ', 'مْ', 'لْ', 'سْ'],
      exercises: [
        {
          id: 'haraka-sukun-concept',
          prompt: 'What does Sukūn do?',
          promptArabic: 'بْ',
          promptNote: 'The letter has no vowel after it.',
          harakaId: 'sukun',
          choices: [
            { id: 'no-vowel', label: 'No vowel — consonant only', isCorrect: true },
            { id: 'fatha', label: 'Adds "a" sound', isCorrect: false },
            { id: 'double', label: 'Doubles the letter', isCorrect: false },
          ],
        },
        ...generateVowelExercises(['sukun'], 9, 5).map(e => ({
          ...e,
          prompt: 'Identify the mark on this letter:',
          choices: [
            { id: 'sukun', label: 'Sukūn (No vowel)', isCorrect: true },
            { id: 'fatha', label: 'Fatha (a)', isCorrect: false },
            { id: 'kasra', label: 'Kasra (i)', isCorrect: false }
          ]
        }))
      ],
    },
    {
      id: 'arakat-tanwin',
      title: 'Tanwīn (Double Vowels)',
      category: 'harakat',
      description: 'Double vowels that indicate indefinite "an", "in", "un" endings.',
      objectives: ['Recognize all three Tanwīn forms.', 'Understand their grammatical use.'],
      harakaIds: ['tanwin-fath', 'tanwin-kasr', 'tanwin-damm'],
      practiceWords: ['بً', 'بٍ', 'بٌ', 'كً', 'كٍ', 'كٌ'],
      exercises: [
        ...tanwin.map((h) => ({
          id: `haraka-tanwin-intro-${h.id}`,
          prompt: `Which Tanwīn is this?`,
          promptArabic: `ب${h.symbol}`,
          harakaId: h.id,
          choices: [
            { id: h.id, label: h.name, isCorrect: true },
            ...tanwin.filter((x) => x.id !== h.id).map((x) => ({ id: x.id, label: x.name, isCorrect: false as const })),
          ],
        })),
        ...generateVowelExercises(['tanwin-fath', 'tanwin-kasr', 'tanwin-damm'], 12, 10)
      ]
    },
    {
      id: 'arakat-shadda-maddah',
      title: 'Shadda and Maddah',
      category: 'harakat',
      description: 'Shadda doubles a letter; Maddah extends the Alif for long "ā".',
      objectives: ['Recognize Shadda (ّ) and Maddah (آ).', 'Apply them in reading.'],
      harakaIds: ['shadda', 'maddah'],
      practiceWords: ['رَبّ', 'آمَن', 'مَدّ', 'قُرْآن'],
      exercises: [
        {
          id: 'haraka-shadda-concept',
          prompt: 'What does Shadda indicate?',
          promptArabic: 'رَبّ',
          promptNote: 'The letter is pronounced twice.',
          harakaId: 'shadda',
          choices: [
            { id: 'double', label: 'The letter is doubled (gemination)', isCorrect: true },
            { id: 'long', label: 'Long vowel', isCorrect: false },
            { id: 'silent', label: 'Silent letter', isCorrect: false },
          ],
        },
        {
          id: 'haraka-maddah-concept',
          prompt: 'What sound does Maddah (آ) make?',
          promptArabic: 'آ',
          harakaId: 'maddah',
          choices: [
            { id: 'long-a', label: 'Long "aa" (two counts)', isCorrect: true },
            { id: 'short-a', label: 'Short "a"', isCorrect: false },
            { id: 'hamza', label: 'Only a glottal stop', isCorrect: false },
          ],
        },
        // Add more identification exercises
        ...Array.from({ length: 8 }).map((_, i) => {
          const isShadda = i % 2 === 0
          const letter = ARABIC_LETTERS[i + 20] || ARABIC_LETTERS[i]
          const mark = isShadda ? HARAKAT.find(h => h.id === 'shadda')! : HARAKAT.find(h => h.id === 'maddah')!
          return {
            id: `special-${i}`,
            prompt: `Identify this mark:`,
            promptArabic: isShadda ? `${letter.forms.isolated}${mark.symbol}` : `${((i % 2 === 0) ? 'ا' : 'أ')}${mark.symbol}`,
            // Maddah usually on Alif. Shadda on any.
            // Fix promptArabic for Maddah to always be on Alif
            // Actually Maddah is mostly on Alif.
            choices: [
              { id: mark.id, label: mark.name, isCorrect: true },
              { id: 'other', label: isShadda ? 'Maddah' : 'Shadda', isCorrect: false },
              { id: 'sukun', label: 'Sukun', isCorrect: false }
            ]
          }
        }).map(e => e.promptArabic.includes('undefined') ? { ...e, promptArabic: 'آ' } : e) // quick fix if logic fails
      ],
    },
  ]
}

// --- Sound Application: letter + haraka
function buildSoundApplicationLessons(): Lesson[] {
  // Lesson 1: Fatha on every letter (28 exercises)
  const fathaExercises: Exercise[] = ARABIC_LETTERS.map((l) => ({
    id: `sound-${l.id}-fatha`,
    prompt: `Read this with Fatha:`,
    promptArabic: `${l.forms.isolated}\u064E`,
    promptNote: l.articulation,
    letterId: l.id,
    harakaId: 'fatha',
    audioUrl: `http://localhost:3001/api/audio/sound/${l.id}/fatha`,
    choices: [
      { id: 'correct', label: `"${l.soundHint}a"`, isCorrect: true },
      { id: 'wrong1', label: `"${l.soundHint}i"`, isCorrect: false },
      { id: 'wrong2', label: `"${l.soundHint}u"`, isCorrect: false },
    ].sort(() => Math.random() - 0.5),
  }))

  // Lesson 2: Kasra and Damma on letters (20+ exercises)
  // We'll alternate between Kasra and Damma for different letters
  const kasraDammaExercises: Exercise[] = ARABIC_LETTERS.map((l, i) => {
    const isKasra = i % 2 === 0
    const haraka = isKasra ? HARAKAT.find(h => h.id === 'kasra')! : HARAKAT.find(h => h.id === 'damma')!
    const vowelSound = isKasra ? 'i' : 'u'
    const wrongSound = isKasra ? 'u' : 'i' // distractor

    return {
      id: `sound-${l.id}-${haraka.id}`,
      prompt: `Which reading is correct?`,
      promptArabic: `${l.forms.isolated}${haraka.symbol}`,
      harakaId: haraka.id,
      letterId: l.id,
      choices: [
        { id: 'correct', label: `${l.soundHint}${vowelSound}`, isCorrect: true },
        { id: 'wrong1', label: `${l.soundHint}a`, isCorrect: false },
        { id: 'wrong2', label: `${l.soundHint}${wrongSound}`, isCorrect: false }
      ].sort(() => Math.random() - 0.5)
    }
  })

  return [
    {
      id: 'sound-fatha-all',
      title: 'Fatha on Every Letter',
      category: 'harakat',
      description: 'Hear how Fatha changes the sound of each letter — slow, precise pronunciation.',
      objectives: ['Read all 28 letters with Fatha.', 'Master the "a" vowel sound.'],
      practiceWords: ['بَ', 'تَ', 'ثَ', 'جَ', 'حَ', 'خَ'],
      exercises: fathaExercises,
    },
    {
      id: 'sound-kasra-damma',
      title: 'Kasra and Damma Mastery',
      category: 'harakat',
      description: 'Practice "i" and "u" sounds across the alphabet.',
      objectives: ['Read letters with Kasra and Damma.', 'Distinguish "i" vs "u".'],
      practiceWords: ['بِ', 'بُ', 'تِ', 'تُ', 'مِ', 'مُ'],
      exercises: kasraDammaExercises,
    },
  ]
}

// --- Letter Combination (Advanced Stage) - Progressive word-length exercises
function buildCombinationLessons(): Lesson[] {
  return [
    // Stage 1: Two-letter combinations
    {
      id: 'combo-two-letter',
      title: 'Two-Letter Syllables',
      category: 'combination',
      description: 'Master simple two-letter combinations with all vowel marks.',
      objectives: ['Read letter + vowel pairs fluently.', 'Practice with fatha, kasra, and damma.'],
      practiceWords: ['بَا', 'بِي', 'بُو', 'تَا', 'تِي', 'تُو', 'مَا', 'مِي', 'مُو'],
      exercises: [
        { id: 'two-1', prompt: 'Select the correct reading:', promptArabic: 'بَا', choices: [{ id: 'baa', label: 'Baa', isCorrect: true }, { id: 'bi', label: 'Bi', isCorrect: false }, { id: 'bu', label: 'Bu', isCorrect: false }] },
        { id: 'two-2', prompt: 'Select the correct reading:', promptArabic: 'تِي', choices: [{ id: 'tee', label: 'Tee', isCorrect: true }, { id: 'ta', label: 'Ta', isCorrect: false }, { id: 'tu', label: 'Tu', isCorrect: false }] },
        { id: 'two-3', prompt: 'Select the correct reading:', promptArabic: 'نُو', choices: [{ id: 'noo', label: 'Noo', isCorrect: true }, { id: 'na', label: 'Na', isCorrect: false }, { id: 'ni', label: 'Ni', isCorrect: false }] },
        { id: 'two-4', prompt: 'Select the correct reading:', promptArabic: 'لَا', choices: [{ id: 'laa', label: 'Laa', isCorrect: true }, { id: 'li', label: 'Li', isCorrect: false }, { id: 'lu', label: 'Lu', isCorrect: false }] },
        { id: 'two-5', prompt: 'Select the correct reading:', promptArabic: 'رِي', choices: [{ id: 'ree', label: 'Ree', isCorrect: true }, { id: 'ra', label: 'Ra', isCorrect: false }, { id: 'ru', label: 'Ru', isCorrect: false }] },
        { id: 'two-6', prompt: 'Select the correct reading:', promptArabic: 'سُو', choices: [{ id: 'suu', label: 'Suu', isCorrect: true }, { id: 'saa', label: 'Saa', isCorrect: false }, { id: 'see', label: 'See', isCorrect: false }] },
        { id: 'two-7', prompt: 'Select the correct reading:', promptArabic: 'هِي', choices: [{ id: 'hee', label: 'Hee', isCorrect: true }, { id: 'ha', label: 'Ha', isCorrect: false }, { id: 'hu', label: 'Hu', isCorrect: false }] },
        { id: 'two-8', prompt: 'Select the correct reading:', promptArabic: 'فُو', choices: [{ id: 'foo', label: 'Foo', isCorrect: true }, { id: 'fa', label: 'Fa', isCorrect: false }, { id: 'fi', label: 'Fi', isCorrect: false }] },
        { id: 'two-9', prompt: 'Select the correct reading:', promptArabic: 'قَا', choices: [{ id: 'qaa', label: 'Qaa', isCorrect: true }, { id: 'qi', label: 'Qi', isCorrect: false }, { id: 'qu', label: 'Qu', isCorrect: false }] },
        { id: 'two-10', prompt: 'Select the correct reading:', promptArabic: 'جِي', choices: [{ id: 'jii', label: 'Jii', isCorrect: true }, { id: 'ja', label: 'Ja', isCorrect: false }, { id: 'ju', label: 'Ju', isCorrect: false }] },
        { id: 'two-11', prompt: 'Select the correct reading:', promptArabic: 'دُو', choices: [{ id: 'duu', label: 'Duu', isCorrect: true }, { id: 'da', label: 'Da', isCorrect: false }, { id: 'di', label: 'Di', isCorrect: false }] },
        { id: 'two-12', prompt: 'Select the correct reading:', promptArabic: 'زِي', choices: [{ id: 'zii', label: 'Zii', isCorrect: true }, { id: 'za', label: 'Za', isCorrect: false }, { id: 'zu', label: 'Zu', isCorrect: false }] },
        { id: 'two-13', prompt: 'Select the correct reading:', promptArabic: 'شَا', choices: [{ id: 'shaa', label: 'Shaa', isCorrect: true }, { id: 'shi', label: 'Shi', isCorrect: false }, { id: 'shu', label: 'Shu', isCorrect: false }] },
        { id: 'two-14', prompt: 'Select the correct reading:', promptArabic: 'يَا', choices: [{ id: 'yaa', label: 'Yaa', isCorrect: true }, { id: 'yi', label: 'Yi', isCorrect: false }, { id: 'yu', label: 'Yu', isCorrect: false }] },
        { id: 'two-15', prompt: 'Select the correct reading:', promptArabic: 'خُ', choices: [{ id: 'khu', label: 'Khu', isCorrect: true }, { id: 'kha', label: 'Kha', isCorrect: false }, { id: 'khi', label: 'Khi', isCorrect: false }] },
      ],
    },
    // Stage 2: Two-letter with sukun
    {
      id: 'combo-sukun-pairs',
      title: 'Sukun Combinations',
      category: 'combination',
      description: 'Practice consonant clusters with sukun.',
      objectives: ['Read CV+C patterns.', 'Recognize sukun effect.'],
      practiceWords: ['مِنْ', 'عَنْ', 'إِنْ', 'لَمْ', 'قَدْ'],
      exercises: [
        { id: 'sukun-1', prompt: 'Select the correct reading:', promptArabic: 'مِنْ', choices: [{ id: 'min', label: 'Min', isCorrect: true }, { id: 'man', label: 'Man', isCorrect: false }, { id: 'mun', label: 'Mun', isCorrect: false }] },
        { id: 'sukun-2', prompt: 'Select the correct reading:', promptArabic: 'عَنْ', choices: [{ id: 'an', label: "An", isCorrect: true }, { id: 'in', label: "In", isCorrect: false }, { id: 'un', label: "Un", isCorrect: false }] },
        { id: 'sukun-3', prompt: 'Select the correct reading:', promptArabic: 'قَدْ', choices: [{ id: 'qad', label: 'Qad', isCorrect: true }, { id: 'qid', label: 'Qid', isCorrect: false }, { id: 'qud', label: 'Qud', isCorrect: false }] },
        { id: 'sukun-4', prompt: 'Select the correct reading:', promptArabic: 'لَمْ', choices: [{ id: 'lam', label: 'Lam', isCorrect: true }, { id: 'lim', label: 'Lim', isCorrect: false }, { id: 'lum', label: 'Lum', isCorrect: false }] },
        { id: 'sukun-5', prompt: 'Select the correct reading:', promptArabic: 'هَلْ', choices: [{ id: 'hal', label: 'Hal', isCorrect: true }, { id: 'hil', label: 'Hil', isCorrect: false }, { id: 'hul', label: 'Hul', isCorrect: false }] },
        { id: 'sukun-6', prompt: 'Select the correct reading:', promptArabic: 'بَلْ', choices: [{ id: 'bal', label: 'Bal', isCorrect: true }, { id: 'bil', label: 'Bil', isCorrect: false }, { id: 'bul', label: 'Bul', isCorrect: false }] },
        { id: 'sukun-7', prompt: 'Select the correct reading:', promptArabic: 'كَمْ', choices: [{ id: 'kam', label: 'Kam', isCorrect: true }, { id: 'kim', label: 'Kim', isCorrect: false }, { id: 'kum', label: 'Kum', isCorrect: false }] },
        { id: 'sukun-8', prompt: 'Select the correct reading:', promptArabic: 'كَيْ', choices: [{ id: 'kay', label: 'Kay', isCorrect: true }, { id: 'ku', label: 'Ku', isCorrect: false }, { id: 'ki', label: 'Ki', isCorrect: false }] },
        { id: 'sukun-9', prompt: 'Select the correct reading:', promptArabic: 'لَوْ', choices: [{ id: 'law', label: 'Law', isCorrect: true }, { id: 'lu', label: 'Lu', isCorrect: false }, { id: 'la', label: 'La', isCorrect: false }] },
        { id: 'sukun-10', prompt: 'Select the correct reading:', promptArabic: 'قُلْ', choices: [{ id: 'qul', label: 'Qul', isCorrect: true }, { id: 'qal', label: 'Qal', isCorrect: false }, { id: 'qil', label: 'Qil', isCorrect: false }] },
        { id: 'sukun-11', prompt: 'Select the correct reading:', promptArabic: 'سِرْ', choices: [{ id: 'sir', label: 'Sir', isCorrect: true }, { id: 'sar', label: 'Sar', isCorrect: false }, { id: 'sur', label: 'Sur', isCorrect: false }] },
        { id: 'sukun-12', prompt: 'Select the correct reading:', promptArabic: 'قُمْ', choices: [{ id: 'qum', label: 'Qum', isCorrect: true }, { id: 'qam', label: 'Qam', isCorrect: false }, { id: 'qim', label: 'Qim', isCorrect: false }] },
        { id: 'sukun-13', prompt: 'Select the correct reading:', promptArabic: 'نَمْ', choices: [{ id: 'nam', label: 'Nam', isCorrect: true }, { id: 'nim', label: 'Nim', isCorrect: false }, { id: 'num', label: 'Num', isCorrect: false }] },
        { id: 'sukun-14', prompt: 'Select the correct reading:', promptArabic: 'هُمْ', choices: [{ id: 'hum', label: 'Hum', isCorrect: true }, { id: 'ham', label: 'Ham', isCorrect: false }, { id: 'him', label: 'Him', isCorrect: false }] },
        { id: 'sukun-15', prompt: 'Select the correct reading:', promptArabic: 'بِسْ', choices: [{ id: 'bis', label: 'Bis', isCorrect: true }, { id: 'bas', label: 'Bas', isCorrect: false }, { id: 'bus', label: 'Bus', isCorrect: false }] },
      ],
    },
    // Stage 3: Three-letter words
    {
      id: 'combo-three-letter',
      title: 'Three-Letter Words',
      category: 'combination',
      description: 'Read common three-letter Arabic words with various harakat patterns.',
      objectives: ['Master common 3-letter patterns.', 'Recognize word shapes.'],
      practiceWords: ['كَتَبَ', 'ذَهَبَ', 'رَجَعَ', 'سَمِعَ', 'عَلِمَ', 'فَتَحَ'],
      exercises: [
        { id: 'three-1', prompt: 'Select the correct reading:', promptArabic: 'كَتَبَ', choices: [{ id: 'kataba', label: 'Kataba', isCorrect: true }, { id: 'kutub', label: 'Kutub', isCorrect: false }, { id: 'kitab', label: 'Kitab', isCorrect: false }] },
        { id: 'three-2', prompt: 'Select the correct reading:', promptArabic: 'ذَهَبَ', choices: [{ id: 'dhahaba', label: 'Dhahaba', isCorrect: true }, { id: 'dhahab', label: 'Dhahab', isCorrect: false }, { id: 'thahab', label: 'Thahab', isCorrect: false }] },
        { id: 'three-3', prompt: 'Select the correct reading:', promptArabic: 'سَمِعَ', choices: [{ id: 'samia', label: "Samia", isCorrect: true }, { id: 'sama', label: 'Sama', isCorrect: false }, { id: 'sim', label: 'Sim', isCorrect: false }] },
        { id: 'three-4', prompt: 'Select the correct reading:', promptArabic: 'عَلِمَ', choices: [{ id: 'alima', label: "Alima", isCorrect: true }, { id: 'alam', label: "Alam", isCorrect: false }, { id: 'ilm', label: "Ilm", isCorrect: false }] },
        { id: 'three-5', prompt: 'Select the correct reading:', promptArabic: 'فَتَحَ', choices: [{ id: 'fataha', label: 'Fataha', isCorrect: true }, { id: 'fath', label: 'Fath', isCorrect: false }, { id: 'futuh', label: 'Futuh', isCorrect: false }] },
        { id: 'three-6', prompt: 'Select the correct reading:', promptArabic: 'قَلَم', choices: [{ id: 'qalam', label: 'Qalam', isCorrect: true }, { id: 'qalb', label: 'Qalb', isCorrect: false }, { id: 'qamar', label: 'Qamar', isCorrect: false }] },
        { id: 'three-7', prompt: 'Select the correct reading:', promptArabic: 'نَصَرَ', choices: [{ id: 'nasara', label: 'Nasara', isCorrect: true }, { id: 'nasr', label: 'Nasr', isCorrect: false }, { id: 'nasir', label: 'Nasir', isCorrect: false }] },
        { id: 'three-8', prompt: 'Select the correct reading:', promptArabic: 'جَلَسَ', choices: [{ id: 'jalasa', label: 'Jalasa', isCorrect: true }, { id: 'jalis', label: 'Jalis', isCorrect: false }, { id: 'julius', label: 'Julius', isCorrect: false }] },
        { id: 'three-9', prompt: 'Select the correct reading:', promptArabic: 'دَرَسَ', choices: [{ id: 'darasa', label: 'Darasa', isCorrect: true }, { id: 'dars', label: 'Dars', isCorrect: false }, { id: 'mudarris', label: 'Mudarris', isCorrect: false }] },
        { id: 'three-10', prompt: 'Select the correct reading:', promptArabic: 'فَطَرَ', choices: [{ id: 'fatara', label: 'Fatara', isCorrect: true }, { id: 'fitr', label: 'Fitr', isCorrect: false }, { id: 'futur', label: 'Futur', isCorrect: false }] },
        { id: 'three-11', prompt: 'Select the correct reading:', promptArabic: 'أَكَلَ', choices: [{ id: 'akala', label: 'Akala', isCorrect: true }, { id: 'akil', label: 'Akil', isCorrect: false }, { id: 'akl', label: 'Akl', isCorrect: false }] },
        { id: 'three-12', prompt: 'Select the correct reading:', promptArabic: 'شَرِبَ', choices: [{ id: 'shariba', label: 'Shariba', isCorrect: true }, { id: 'shurb', label: 'Shurb', isCorrect: false }, { id: 'sharab', label: 'Sharab', isCorrect: false }] },
        { id: 'three-13', prompt: 'Select the correct reading:', promptArabic: 'حَمِلَ', choices: [{ id: 'hamila', label: 'Hamila', isCorrect: true }, { id: 'haml', label: 'Haml', isCorrect: false }, { id: 'hamal', label: 'Hamal', isCorrect: false }] },
        { id: 'three-14', prompt: 'Select the correct reading:', promptArabic: 'مَرِضَ', choices: [{ id: 'marida', label: 'Marida', isCorrect: true }, { id: 'marad', label: 'Marad', isCorrect: false }, { id: 'marr', label: 'Marr', isCorrect: false }] },
        { id: 'three-15', prompt: 'Select the correct reading:', promptArabic: 'بَلَد', choices: [{ id: 'balad', label: 'Balad', isCorrect: true }, { id: 'bilad', label: 'Bilad', isCorrect: false }, { id: 'balid', label: 'Balid', isCorrect: false }] },
      ],
    },
    // Stage 4: Three-letter with shadda
    {
      id: 'combo-shadda-words',
      title: 'Words with Shadda',
      category: 'combination',
      description: 'Practice reading words containing shadda (doubled consonants).',
      objectives: ['Recognize shadda effect.', 'Read geminated letters correctly.'],
      practiceWords: ['رَبّ', 'حَقّ', 'شَرّ', 'كُلّ', 'أُمّ'],
      exercises: [
        { id: 'shadda-1', prompt: 'Select the correct reading:', promptArabic: 'رَبّ', choices: [{ id: 'rabb', label: 'Rabb', isCorrect: true }, { id: 'rab', label: 'Rab', isCorrect: false }, { id: 'raab', label: 'Raab', isCorrect: false }] },
        { id: 'shadda-2', prompt: 'Select the correct reading:', promptArabic: 'حَقّ', choices: [{ id: 'haqq', label: 'Haqq', isCorrect: true }, { id: 'haq', label: 'Haq', isCorrect: false }, { id: 'haaq', label: 'Haaq', isCorrect: false }] },
        { id: 'shadda-3', prompt: 'Select the correct reading:', promptArabic: 'كُلّ', choices: [{ id: 'kull', label: 'Kull', isCorrect: true }, { id: 'kul', label: 'Kul', isCorrect: false }, { id: 'kuul', label: 'Kuul', isCorrect: false }] },
        { id: 'shadda-4', prompt: 'Select the correct reading:', promptArabic: 'أُمّ', choices: [{ id: 'umm', label: 'Umm', isCorrect: true }, { id: 'um', label: 'Um', isCorrect: false }, { id: 'uum', label: 'Uum', isCorrect: false }] },
        { id: 'shadda-5', prompt: 'Select the correct reading:', promptArabic: 'جَدّ', choices: [{ id: 'jadd', label: 'Jadd', isCorrect: true }, { id: 'jad', label: 'Jad', isCorrect: false }, { id: 'jid', label: 'Jid', isCorrect: false }] },
        { id: 'shadda-6', prompt: 'Select the correct reading:', promptArabic: 'حَجّ', choices: [{ id: 'hajj', label: 'Hajj', isCorrect: true }, { id: 'haj', label: 'Haj', isCorrect: false }, { id: 'hij', label: 'Hij', isCorrect: false }] },
        { id: 'shadda-7', prompt: 'Select the correct reading:', promptArabic: 'شَكّ', choices: [{ id: 'shakk', label: 'Shakk', isCorrect: true }, { id: 'shak', label: 'Shak', isCorrect: false }, { id: 'shik', label: 'Shik', isCorrect: false }] },
        { id: 'shadda-8', prompt: 'Select the correct reading:', promptArabic: 'ظَنّ', choices: [{ id: 'zhann', label: 'Zhann', isCorrect: true }, { id: 'zhan', label: 'Zhan', isCorrect: false }, { id: 'zhin', label: 'Zhin', isCorrect: false }] },
        { id: 'shadda-9', prompt: 'Select the correct reading:', promptArabic: 'حُبّ', choices: [{ id: 'hubb', label: 'Hubb', isCorrect: true }, { id: 'hab', label: 'Hab', isCorrect: false }, { id: 'hib', label: 'Hib', isCorrect: false }] },
        { id: 'shadda-10', prompt: 'Select the correct reading:', promptArabic: 'سِرّ', choices: [{ id: 'sirr', label: 'Sirr', isCorrect: true }, { id: 'sar', label: 'Sar', isCorrect: false }, { id: 'sur', label: 'Sur', isCorrect: false }] },
        { id: 'shadda-11', prompt: 'Select the correct reading:', promptArabic: 'بِرّ', choices: [{ id: 'birr', label: 'Birr', isCorrect: true }, { id: 'bar', label: 'Bar', isCorrect: false }, { id: 'bur', label: 'Bur', isCorrect: false }] },
        { id: 'shadda-12', prompt: 'Select the correct reading:', promptArabic: 'دَنّ', choices: [{ id: 'dann', label: 'Dann', isCorrect: true }, { id: 'dan', label: 'Dan', isCorrect: false }, { id: 'din', label: 'Din', isCorrect: false }] },
        { id: 'shadda-13', prompt: 'Select the correct reading:', promptArabic: 'مَسّ', choices: [{ id: 'mass', label: 'Mass', isCorrect: true }, { id: 'mas', label: 'Mas', isCorrect: false }, { id: 'mis', label: 'Mis', isCorrect: false }] },
        { id: 'shadda-14', prompt: 'Select the correct reading:', promptArabic: 'تَبّ', choices: [{ id: 'tabb', label: 'Tabb', isCorrect: true }, { id: 'tab', label: 'Tab', isCorrect: false }, { id: 'tub', label: 'Tub', isCorrect: false }] },
        { id: 'shadda-15', prompt: 'Select the correct reading:', promptArabic: 'صَفّ', choices: [{ id: 'saff', label: 'Saff', isCorrect: true }, { id: 'saf', label: 'Saf', isCorrect: false }, { id: 'sif', label: 'Sif', isCorrect: false }] },
      ],
    },
    // Stage 5: Four-letter words
    {
      id: 'combo-four-letter',
      title: 'Four-Letter Words',
      category: 'combination',
      description: 'Progress to longer words with multiple syllables.',
      objectives: ['Read 4-letter words fluently.', 'Apply all harakat rules.'],
      practiceWords: ['كِتَاب', 'مَلِك', 'سَلَام', 'عَظِيم', 'كَرِيم', 'رَحِيم'],
      exercises: [
        { id: 'four-1', prompt: 'Select the correct reading:', promptArabic: 'كِتَاب', choices: [{ id: 'kitaab', label: 'Kitaab', isCorrect: true }, { id: 'kutub', label: 'Kutub', isCorrect: false }, { id: 'katab', label: 'Katab', isCorrect: false }] },
        { id: 'four-2', prompt: 'Select the correct reading:', promptArabic: 'مَلِك', choices: [{ id: 'malik', label: 'Malik', isCorrect: true }, { id: 'mulk', label: 'Mulk', isCorrect: false }, { id: 'malak', label: 'Malak', isCorrect: false }] },
        { id: 'four-3', prompt: 'Select the correct reading:', promptArabic: 'سَلَام', choices: [{ id: 'salaam', label: 'Salaam', isCorrect: true }, { id: 'slim', label: 'Slim', isCorrect: false }, { id: 'salam', label: 'Salam', isCorrect: false }] },
        { id: 'four-4', prompt: 'Select the correct reading:', promptArabic: 'عَظِيم', choices: [{ id: 'adheem', label: 'Adheem', isCorrect: true }, { id: 'azam', label: 'Azam', isCorrect: false }, { id: 'azim', label: 'Azim', isCorrect: false }] },
        { id: 'four-5', prompt: 'Select the correct reading:', promptArabic: 'كَرِيم', choices: [{ id: 'kareem', label: 'Kareem', isCorrect: true }, { id: 'karm', label: 'Karm', isCorrect: false }, { id: 'karim', label: 'Karim', isCorrect: false }] },
        { id: 'four-6', prompt: 'Select the correct reading:', promptArabic: 'رَحِيم', choices: [{ id: 'raheem', label: 'Raheem', isCorrect: true }, { id: 'rahm', label: 'Rahm', isCorrect: false }, { id: 'rajim', label: 'Rajim', isCorrect: false }] },
        { id: 'four-7', prompt: 'Select the correct reading:', promptArabic: 'مَسْجِد', choices: [{ id: 'masjid', label: 'Masjid', isCorrect: true }, { id: 'sajid', label: 'Sajid', isCorrect: false }, { id: 'sujud', label: 'Sujud', isCorrect: false }] },
        { id: 'four-8', prompt: 'Select the correct reading:', promptArabic: 'مَنْزِل', choices: [{ id: 'manzil', label: 'Manzil', isCorrect: true }, { id: 'nazil', label: 'Nazil', isCorrect: false }, { id: 'nuzul', label: 'Nuzul', isCorrect: false }] },
        { id: 'four-9', prompt: 'Select the correct reading:', promptArabic: 'كَوْكَب', choices: [{ id: 'kawkab', label: 'Kawkab', isCorrect: true }, { id: 'katib', label: 'Katib', isCorrect: false }, { id: 'kub', label: 'Kub', isCorrect: false }] },
        { id: 'four-10', prompt: 'Select the correct reading:', promptArabic: 'مَلْعَب', choices: [{ id: 'malab', label: 'Malab', isCorrect: true }, { id: 'laib', label: 'Laib', isCorrect: false }, { id: 'lab', label: 'Lab', isCorrect: false }] },
        { id: 'four-11', prompt: 'Select the correct reading:', promptArabic: 'مَطْبَخ', choices: [{ id: 'matbakh', label: 'Matbakh', isCorrect: true }, { id: 'tabakh', label: 'Tabakh', isCorrect: false }, { id: 'tabkh', label: 'Tabkh', isCorrect: false }] },
        { id: 'four-12', prompt: 'Select the correct reading:', promptArabic: 'مَسْبَح', choices: [{ id: 'masbah', label: 'Masbah', isCorrect: true }, { id: 'sabah', label: 'Sabah', isCorrect: false }, { id: 'subh', label: 'Subh', isCorrect: false }] },
        { id: 'four-13', prompt: 'Select the correct reading:', promptArabic: 'دَفْتَر', choices: [{ id: 'daftar', label: 'Daftar', isCorrect: true }, { id: 'dafa', label: 'Dafa', isCorrect: false }, { id: 'dafin', label: 'Dafin', isCorrect: false }] },
        { id: 'four-14', prompt: 'Select the correct reading:', promptArabic: 'مَقْعَد', choices: [{ id: 'maqad', label: 'Maqad', isCorrect: true }, { id: 'qaid', label: 'Qaid', isCorrect: false }, { id: 'quud', label: 'Quud', isCorrect: false }] },
        { id: 'four-15', prompt: 'Select the correct reading:', promptArabic: 'سُكَّر', choices: [{ id: 'sukkar', label: 'Sukkar', isCorrect: true }, { id: 'sakr', label: 'Sakr', isCorrect: false }, { id: 'sukr', label: 'Sukr', isCorrect: false }] },
      ],
    },
    // Stage 6: Tanwin words
    {
      id: 'combo-tanwin-words',
      title: 'Words with Tanwin',
      category: 'combination',
      description: 'Practice reading words ending with tanwin (nunation).',
      objectives: ['Read tanwin fath, kasr, and damm.', 'Recognize indefinite endings.'],
      practiceWords: ['كِتَابًا', 'رَجُلٌ', 'بَيْتٍ', 'عِلْمًا', 'نُورًا'],
      exercises: [
        { id: 'tanwin-1', prompt: 'Select the correct reading:', promptArabic: 'كِتَابًا', choices: [{ id: 'kitaaban', label: 'Kitaaban', isCorrect: true }, { id: 'kitaabin', label: 'Kitaabin', isCorrect: false }, { id: 'kitaabun', label: 'Kitaabun', isCorrect: false }] },
        { id: 'tanwin-2', prompt: 'Select the correct reading:', promptArabic: 'رَجُلٌ', choices: [{ id: 'rajulun', label: 'Rajulun', isCorrect: true }, { id: 'rajulin', label: 'Rajulin', isCorrect: false }, { id: 'rajulan', label: 'Rajulan', isCorrect: false }] },
        { id: 'tanwin-3', prompt: 'Select the correct reading:', promptArabic: 'بَيْتٍ', choices: [{ id: 'baytin', label: 'Baytin', isCorrect: true }, { id: 'baytun', label: 'Baytun', isCorrect: false }, { id: 'baytan', label: 'Baytan', isCorrect: false }] },
        { id: 'tanwin-4', prompt: 'Select the correct reading:', promptArabic: 'عِلْمًا', choices: [{ id: 'ilman', label: 'Ilman', isCorrect: true }, { id: 'ilmun', label: 'Ilmun', isCorrect: false }, { id: 'ilmin', label: 'Ilmin', isCorrect: false }] },
        { id: 'tanwin-5', prompt: 'Select the correct reading:', promptArabic: 'قَلَمٌ', choices: [{ id: 'qalamun', label: 'Qalamun', isCorrect: true }, { id: 'qalaman', label: 'Qalaman', isCorrect: false }, { id: 'qalamin', label: 'Qalamin', isCorrect: false }] },
        { id: 'tanwin-6', prompt: 'Select the correct reading:', promptArabic: 'وَلَدًا', choices: [{ id: 'waladan', label: 'Waladan', isCorrect: true }, { id: 'waladun', label: 'Waladun', isCorrect: false }, { id: 'waladin', label: 'Waladin', isCorrect: false }] },
        { id: 'tanwin-7', prompt: 'Select the correct reading:', promptArabic: 'شَمْسٍ', choices: [{ id: 'shamsin', label: 'Shamsin', isCorrect: true }, { id: 'shamsun', label: 'Shamsun', isCorrect: false }, { id: 'shamsan', label: 'Shamsan', isCorrect: false }] },
        { id: 'tanwin-8', prompt: 'Select the correct reading:', promptArabic: 'قَمَرٌ', choices: [{ id: 'qamarun', label: 'Qamarun', isCorrect: true }, { id: 'qamaran', label: 'Qamaran', isCorrect: false }, { id: 'qamarin', label: 'Qamarin', isCorrect: false }] },
        { id: 'tanwin-9', prompt: 'Select the correct reading:', promptArabic: 'نُورًا', choices: [{ id: 'nuran', label: 'Nuran', isCorrect: true }, { id: 'nurun', label: 'Nurun', isCorrect: false }, { id: 'nurin', label: 'Nurin', isCorrect: false }] },
        { id: 'tanwin-10', prompt: 'Select the correct reading:', promptArabic: 'لَيْلًا', choices: [{ id: 'laylan', label: 'Laylan', isCorrect: true }, { id: 'laylun', label: 'Laylun', isCorrect: false }, { id: 'laylin', label: 'Laylin', isCorrect: false }] },
        { id: 'tanwin-11', prompt: 'Select the correct reading:', promptArabic: 'يَوْمٌ', choices: [{ id: 'yawmun', label: 'Yawmun', isCorrect: true }, { id: 'yawman', label: 'Yawman', isCorrect: false }, { id: 'yawmin', label: 'Yawmin', isCorrect: false }] },
        { id: 'tanwin-12', prompt: 'Select the correct reading:', promptArabic: 'أَحَدٌ', choices: [{ id: 'ahadun', label: 'Ahadun', isCorrect: true }, { id: 'ahadan', label: 'Ahadan', isCorrect: false }, { id: 'ahadin', label: 'Ahadin', isCorrect: false }] },
        { id: 'tanwin-13', prompt: 'Select the correct reading:', promptArabic: 'شَيْءٍ', choices: [{ id: 'shayin', label: 'Shayin', isCorrect: true }, { id: 'shayun', label: 'Shayun', isCorrect: false }, { id: 'shayan', label: 'Shayan', isCorrect: false }] },
        { id: 'tanwin-14', prompt: 'Select the correct reading:', promptArabic: 'أَمْرًا', choices: [{ id: 'amran', label: 'Amran', isCorrect: true }, { id: 'amrun', label: 'Amrun', isCorrect: false }, { id: 'amrin', label: 'Amrin', isCorrect: false }] },
        { id: 'tanwin-15', prompt: 'Select the correct reading:', promptArabic: 'قَوْلًا', choices: [{ id: 'qawlan', label: 'Qawlan', isCorrect: true }, { id: 'qawlun', label: 'Qawlun', isCorrect: false }, { id: 'qawlin', label: 'Qawlin', isCorrect: false }] },
      ],
    },
    // Stage 7: Five+ letter words
    {
      id: 'combo-five-letter',
      title: 'Longer Words',
      category: 'combination',
      description: 'Master reading longer, more complex words.',
      objectives: ['Read 5+ letter words.', 'Build reading stamina.'],
      practiceWords: ['مُسْلِمُون', 'الْحَمْدُ', 'الرَّحْمَن', 'الْعَالَمِين', 'يَعْبُدُون'],
      exercises: [
        { id: 'five-1', prompt: 'Select the correct reading:', promptArabic: 'مُسْلِمُون', choices: [{ id: 'muslimoon', label: 'Muslimoon', isCorrect: true }, { id: 'muslim', label: 'Muslim', isCorrect: false }, { id: 'muslimeen', label: 'Muslimeen', isCorrect: false }] },
        { id: 'five-2', prompt: 'Select the correct reading:', promptArabic: 'الْحَمْدُ', choices: [{ id: 'alhamdu', label: 'Al-Hamdu', isCorrect: true }, { id: 'alhamda', label: 'Al-Hamda', isCorrect: false }, { id: 'alhamdi', label: 'Al-Hamdi', isCorrect: false }] },
        { id: 'five-3', prompt: 'Select the correct reading:', promptArabic: 'الرَّحْمَن', choices: [{ id: 'arrahman', label: 'Ar-Rahman', isCorrect: true }, { id: 'arrahim', label: 'Ar-Rahim', isCorrect: false }, { id: 'almalik', label: 'Al-Malik', isCorrect: false }] },
        { id: 'five-4', prompt: 'Select the correct reading:', promptArabic: 'الْعَالَمِين', choices: [{ id: 'alameen', label: 'Al-Aalamiin', isCorrect: true }, { id: 'alalim', label: 'Al-Alim', isCorrect: false }, { id: 'alaalam', label: 'Al-Aalam', isCorrect: false }] },
        { id: 'five-5', prompt: 'Select the correct reading:', promptArabic: 'يَعْبُدُون', choices: [{ id: 'yabudoon', label: "Ya'budoon", isCorrect: true }, { id: 'abid', label: 'Abid', isCorrect: false }, { id: 'ibada', label: 'Ibada', isCorrect: false }] },
        { id: 'five-6', prompt: 'Select the correct reading:', promptArabic: 'الْمُسْتَقِيم', choices: [{ id: 'mustaqim', label: 'Al-Mustaqim', isCorrect: true }, { id: 'mustaqbal', label: 'Al-Mustaqbal', isCorrect: false }, { id: 'mustamir', label: 'Al-Mustamir', isCorrect: false }] },
        { id: 'five-7', prompt: 'Select the correct reading:', promptArabic: 'أَنْعَمْتَ', choices: [{ id: 'anamta', label: "An-amta", isCorrect: true }, { id: 'anama', label: "An-ama", isCorrect: false }, { id: 'niam', label: 'Niam', isCorrect: false }] },
        { id: 'five-8', prompt: 'Select the correct reading:', promptArabic: 'الْمَغْضُوب', choices: [{ id: 'maghdub', label: 'Al-Maghdub', isCorrect: true }, { id: 'ghadab', label: 'Ghadab', isCorrect: false }, { id: 'maghrib', label: 'Al-Maghrib', isCorrect: false }] },
        { id: 'five-9', prompt: 'Select the correct reading:', promptArabic: 'الضَّالِّين', choices: [{ id: 'dallin', label: 'Ad-Dallin', isCorrect: true }, { id: 'dalal', label: 'Dalal', isCorrect: false }, { id: 'dall', label: 'Dall', isCorrect: false }] },
        { id: 'five-10', prompt: 'Select the correct reading:', promptArabic: 'النَّاس', choices: [{ id: 'nas', label: 'An-Nas', isCorrect: true }, { id: 'nisa', label: 'An-Nisa', isCorrect: false }, { id: 'ins', label: 'Al-Ins', isCorrect: false }] },
        { id: 'five-11', prompt: 'Select the correct reading:', promptArabic: 'الْفَلَق', choices: [{ id: 'falaq', label: 'Al-Falaq', isCorrect: true }, { id: 'khalaq', label: 'Khalaq', isCorrect: false }, { id: 'firaq', label: 'Firaq', isCorrect: false }] },
        { id: 'five-12', prompt: 'Select the correct reading:', promptArabic: 'الْإِخْلَاص', choices: [{ id: 'ikhlas', label: 'Al-Ikhlas', isCorrect: true }, { id: 'khalas', label: 'Khalas', isCorrect: false }, { id: 'khalis', label: 'Khalis', isCorrect: false }] },
        { id: 'five-13', prompt: 'Select the correct reading:', promptArabic: 'الْكَوْثَر', choices: [{ id: 'kawthar', label: 'Al-Kawthar', isCorrect: true }, { id: 'kathir', label: 'Kathir', isCorrect: false }, { id: 'kawth', label: 'Kawth', isCorrect: false }] },
        { id: 'five-14', prompt: 'Select the correct reading:', promptArabic: 'الْكَافِرُون', choices: [{ id: 'kafirun', label: 'Al-Kafirun', isCorrect: true }, { id: 'kuffar', label: 'Kuffar', isCorrect: false }, { id: 'kafir', label: 'Kafir', isCorrect: false }] },
        { id: 'five-15', prompt: 'Select the correct reading:', promptArabic: 'الْمَسَد', choices: [{ id: 'masad', label: 'Al-Masad', isCorrect: true }, { id: 'asad', label: 'Asad', isCorrect: false }, { id: 'hasad', label: 'Hasad', isCorrect: false }] },
      ],
    },
    // Stage 8: Mixed review
    {
      id: 'combo-mixed-review',
      title: 'Comprehensive Review',
      category: 'combination',
      description: 'Mixed exercises covering all word lengths and patterns.',
      objectives: ['Apply all learned skills.', 'Build reading confidence.'],
      practiceWords: ['لَا', 'هُوَ', 'اللَّه', 'بِسْمِ', 'الرَّحِيم'],
      exercises: [
        { id: 'review-1', prompt: 'Select the correct reading:', promptArabic: 'لَا', choices: [{ id: 'laa', label: 'Laa', isCorrect: true }, { id: 'la', label: 'La', isCorrect: false }, { id: 'li', label: 'Li', isCorrect: false }] },
        { id: 'review-2', prompt: 'Select the correct reading:', promptArabic: 'هُوَ', choices: [{ id: 'huwa', label: 'Huwa', isCorrect: true }, { id: 'hu', label: 'Hu', isCorrect: false }, { id: 'hiya', label: 'Hiya', isCorrect: false }] },
        { id: 'review-3', prompt: 'Select the correct reading:', promptArabic: 'اللَّه', choices: [{ id: 'allah', label: 'Allah', isCorrect: true }, { id: 'ilah', label: 'Ilah', isCorrect: false }, { id: 'aliha', label: 'Aliha', isCorrect: false }] },
        { id: 'review-4', prompt: 'Select the correct reading:', promptArabic: 'بِسْمِ', choices: [{ id: 'bismi', label: 'Bismi', isCorrect: true }, { id: 'bism', label: 'Bism', isCorrect: false }, { id: 'ism', label: 'Ism', isCorrect: false }] },
        { id: 'review-5', prompt: 'Select the correct reading:', promptArabic: 'الرَّحِيم', choices: [{ id: 'arraheem', label: 'Ar-Raheem', isCorrect: true }, { id: 'rahim', label: 'Rahim', isCorrect: false }, { id: 'rahma', label: 'Rahma', isCorrect: false }] },
        { id: 'review-6', prompt: 'Select the correct reading:', promptArabic: 'مُحَمَّد', choices: [{ id: 'muhammad', label: 'Muhammad', isCorrect: true }, { id: 'ahmad', label: 'Ahmad', isCorrect: false }, { id: 'mahmud', label: 'Mahmud', isCorrect: false }] },
        { id: 'review-7', prompt: 'Select the correct reading:', promptArabic: 'رَسُول', choices: [{ id: 'rasul', label: 'Rasul', isCorrect: true }, { id: 'rasl', label: 'Rasl', isCorrect: false }, { id: 'risala', label: 'Risala', isCorrect: false }] },
        { id: 'review-8', prompt: 'Select the correct reading:', promptArabic: 'كِتَاب', choices: [{ id: 'kitab', label: 'Kitab', isCorrect: true }, { id: 'kaatib', label: 'Kaatib', isCorrect: false }, { id: 'maktab', label: 'Maktab', isCorrect: false }] },
        { id: 'review-9', prompt: 'Select the correct reading:', promptArabic: 'شَجَر', choices: [{ id: 'shajar', label: 'Shajar', isCorrect: true }, { id: 'shajara', label: 'Shajara', isCorrect: false }, { id: 'ashjar', label: 'Ashjar', isCorrect: false }] },
        { id: 'review-10', prompt: 'Select the correct reading:', promptArabic: 'سَمَاء', choices: [{ id: 'samaa', label: 'Samaa', isCorrect: true }, { id: 'ism', label: 'Ism', isCorrect: false }, { id: 'samawa', label: 'Samawa', isCorrect: false }] },
        { id: 'review-11', prompt: 'Select the correct reading:', promptArabic: 'أَرْض', choices: [{ id: 'ard', label: 'Ard', isCorrect: true }, { id: 'ardun', label: 'Ardun', isCorrect: false }, { id: 'arda', label: 'Arda', isCorrect: false }] },
        { id: 'review-12', prompt: 'Select the correct reading:', promptArabic: 'مَاء', choices: [{ id: 'ma', label: 'Maa', isCorrect: true }, { id: 'ma', label: 'Ma', isCorrect: false }, { id: 'man', label: 'Man', isCorrect: false }] },
        { id: 'review-13', prompt: 'Select the correct reading:', promptArabic: 'نَار', choices: [{ id: 'nar', label: 'Nar', isCorrect: true }, { id: 'nur', label: 'Nur', isCorrect: false }, { id: 'nayr', label: 'Nayr', isCorrect: false }] },
        { id: 'review-14', prompt: 'Select the correct reading:', promptArabic: 'جَنَّة', choices: [{ id: 'janna', label: 'Janna', isCorrect: true }, { id: 'jinn', label: 'Jinn', isCorrect: false }, { id: 'janib', label: 'Janib', isCorrect: false }] },
        { id: 'review-15', prompt: 'Select the correct reading:', promptArabic: 'صَلَاة', choices: [{ id: 'salah', label: 'Salah', isCorrect: true }, { id: 'salaha', label: 'Salaha', isCorrect: false }, { id: 'sall', label: 'Sall', isCorrect: false }] },
      ],
    },
  ]
}

// --- Tajweed Rules
function buildTajweedLessons(): Lesson[] {
  return [
    {
      id: 'tajweed-sun-moon',
      title: 'Moon & Sun Letters (Al-Qamari & Al-Shamsi)',
      category: 'tajweed',
      description: 'Learn when the "Lam" of "Al-" (the) is pronounced or silent based on the following letter.',
      objectives: ['Distinguish Moon (pronounced) vs Sun (silent) letters.', 'Read "Al-" words correctly.'],
      practiceWords: ['الْقَمَر', 'الشَّمْس', 'الْكِتَاب', 'النُّور'],
      exercises: [
        {
          id: 'tj-sun-moon-concept-1',
          prompt: 'In "Al-Qamar" (The Moon), is the Lam pronounced?',
          promptArabic: 'الْقَمَر',
          promptNote: 'Qaf is a Moon letter.',
          choices: [
            { id: 'yes', label: 'Yes (Izhar - Clear)', isCorrect: true },
            { id: 'no', label: 'No (Idgham - Silent)', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-concept-2',
          prompt: 'In "Ash-Shams" (The Sun), is the Lam pronounced?',
          promptArabic: 'الشَّمْس',
          promptNote: 'Shin is a Sun letter.',
          choices: [
            { id: 'no', label: 'No (Silent - Merged)', isCorrect: true },
            { id: 'yes', label: 'Yes (Pronounced)', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'tj-sun-moon-1',
          prompt: 'Identify the type of "Al-":',
          promptArabic: 'الرَّحْمَن',
          promptNote: 'Ra is a Sun letter.',
          choices: [
            { id: 'sun', label: 'Sun (Shamsiya) - Silent Lam', isCorrect: true },
            { id: 'moon', label: 'Moon (Qamariya) - Pronounced Lam', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-2',
          prompt: 'Identify the type of "Al-":',
          promptArabic: 'الْحَمْد',
          promptNote: 'Ha is a Moon letter.',
          choices: [
            { id: 'moon', label: 'Moon (Qamariya) - Pronounced Lam', isCorrect: true },
            { id: 'sun', label: 'Sun (Shamsiya) - Silent Lam', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-3',
          prompt: 'Which is correct pronunciation?',
          promptArabic: 'النَّاس',
          choices: [
            { id: 'annas', label: 'An-Naas (Silent Lam)', isCorrect: true },
            { id: 'alnaas', label: 'Al-Naas (Pronounced Lam)', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-4',
          prompt: 'Which is correct pronunciation?',
          promptArabic: 'الْبَيْت',
          choices: [
            { id: 'albayt', label: 'Al-Bayt (Pronounced Lam)', isCorrect: true },
            { id: 'abbayt', label: 'Ab-Bayt (Silent Lam)', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-5',
          prompt: 'Is the Lam pronounced in "Al-Fatiha"?',
          promptArabic: 'الْفَاتِحَة',
          promptNote: 'Fa is a Moon letter.',
          choices: [
            { id: 'yes', label: 'Yes - Al-Fatiha', isCorrect: true },
            { id: 'no', label: 'No - Af-Fatiha', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-6',
          prompt: 'Is the Lam pronounced in "As-Sirata"?',
          promptArabic: 'الصِّرَاط',
          promptNote: 'Sad is a Sun letter.',
          choices: [
            { id: 'no', label: 'No - As-Sirata (Silent)', isCorrect: true },
            { id: 'yes', label: 'Yes - Al-Sirata', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-7',
          prompt: 'Identify the rule for "Al-Din":',
          promptArabic: 'الدِّين',
          promptNote: 'Dal is a Sun letter.',
          choices: [
            { id: 'sun', label: 'Sun - Ad-Din (Silent Lam)', isCorrect: true },
            { id: 'moon', label: 'Moon - Al-Din (Pronounced)', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-8',
          prompt: 'Identify the rule for "Al-Iman":',
          promptArabic: 'الْإِيمَان',
          promptNote: 'Hamza is a Moon letter.',
          choices: [
            { id: 'moon', label: 'Moon - Al-Iman (Pronounced)', isCorrect: true },
            { id: 'sun', label: 'Sun - (Silent Lam)', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-9',
          prompt: 'Which letter type is Jim?',
          promptArabic: 'ج',
          choices: [
            { id: 'moon', label: 'Moon Letter', isCorrect: true },
            { id: 'sun', label: 'Sun Letter', isCorrect: false }
          ]
        },
        {
          id: 'tj-sun-moon-10',
          prompt: 'Which letter type is Ta?',
          promptArabic: 'ت',
          choices: [
            { id: 'sun', label: 'Sun Letter', isCorrect: true },
            { id: 'moon', label: 'Moon Letter', isCorrect: false }
          ]
        }
      ]
    },
    {
      id: 'tajweed-lafzatullah',
      title: 'Lafzatullah (Name of Allah)',
      category: 'tajweed',
      description: 'Rules for pronouncing "Allah": Heavy (Tafkheem) vs Light (Tarqeeq).',
      objectives: ['Identify preceding vowel.', 'Apply Heavy sound after Fatha/Damma.', 'Apply Light sound after Kasra.'],
      practiceWords: ['اللَّهُ', 'لِلَّهِ', 'رَسُولُ اللَّهِ', 'بِسْمِ اللَّهِ'],
      exercises: [
        {
          id: 'tj-lafz-concept-1',
          prompt: 'How is "Allah" pronounced here?',
          promptArabic: 'قَالَ اللَّهُ',
          promptNote: 'Preceded by Fatha (la).',
          choices: [
            { id: 'heavy', label: 'Heavy/Thick (Tafkheem)', isCorrect: true },
            { id: 'light', label: 'Light/Thin (Tarqeeq)', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-concept-2',
          prompt: 'How is "Allah" pronounced here?',
          promptArabic: 'بِسْمِ اللَّهِ',
          promptNote: 'Preceded by Kasra (mi).',
          choices: [
            { id: 'light', label: 'Light/Thin (Tarqeeq)', isCorrect: true },
            { id: 'heavy', label: 'Heavy/Thick (Tafkheem)', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-3',
          prompt: 'Choose the correct rule:',
          promptArabic: 'نَصْرُ اللَّهِ',
          promptNote: 'Preceded by Damma (ru).',
          choices: [
            { id: 'heavy', label: 'Heavy (after Damma)', isCorrect: true },
            { id: 'light', label: 'Light (after Damma)', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-4',
          prompt: 'Choose the correct rule:',
          promptArabic: 'لِلَّهِ',
          promptNote: 'Preceded by Preposition Lam (Kasra).',
          choices: [
            { id: 'light', label: 'Light (after Kasra)', isCorrect: true },
            { id: 'heavy', label: 'Heavy', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-5',
          prompt: 'How is "Allah" pronounced here?',
          promptArabic: 'وَاللَّهُ',
          promptNote: 'Preceded by Waw with Damma.',
          choices: [
            { id: 'heavy', label: 'Heavy (Tafkheem)', isCorrect: true },
            { id: 'light', label: 'Light (Tarqeeq)', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-6',
          prompt: 'How is "Allah" pronounced here?',
          promptArabic: 'عِبَادُ اللَّهِ',
          promptNote: 'Preceded by Damma (du).',
          choices: [
            { id: 'heavy', label: 'Heavy (after Damma)', isCorrect: true },
            { id: 'light', label: 'Light', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-7',
          prompt: 'How is "Allah" pronounced here?',
          promptArabic: 'فِي اللَّهِ',
          promptNote: 'Preceded by Kasra (Fi).',
          choices: [
            { id: 'light', label: 'Light (Tarqeeq)', isCorrect: true },
            { id: 'heavy', label: 'Heavy (Tafkheem)', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-8',
          prompt: 'Which rule applies?',
          promptArabic: 'عَلَى اللَّهِ',
          promptNote: 'Preceded by Fatha (La).',
          choices: [
            { id: 'heavy', label: 'Heavy - After Fatha', isCorrect: true },
            { id: 'light', label: 'Light - After Fatha', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-9',
          prompt: 'Which rule applies?',
          promptArabic: 'إِيَّاكَ نَعْبُدُ',
          promptNote: 'No "Allah" here - testing attention!',
          choices: [
            { id: 'none', label: 'No Lafzatullah here', isCorrect: true },
            { id: 'heavy', label: 'Heavy', isCorrect: false }
          ]
        },
        {
          id: 'tj-lafz-10',
          prompt: 'Complete the rule: After Fatha/Damma = ?',
          promptArabic: 'Rule:',
          promptNote: 'General rule for Lafzatullah.',
          choices: [
            { id: 'heavy', label: 'Heavy (Tafkheem)', isCorrect: true },
            { id: 'light', label: 'Light (Tarqeeq)', isCorrect: false }
          ]
        }
      ]
    },
    {
      id: 'tajweed-nun-sakinah',
      title: 'Nun Sakinah & Tanween',
      category: 'tajweed',
      description: 'Rules for Nun Sakinah (static Nun) and Tanween (double vowels).',
      objectives: ['Identify Izhar (Clear)', 'Identify Idgham (Merging)', 'Identify Iqlab (Changing)', 'Identify Ikhfa (Hiding)'],
      practiceWords: ['مَنْ يَعْمَلْ', 'مِنْ بَعْدِ', 'أَنْعَمْتَ', 'مِنْ شَرِّ'],
      exercises: [
        {
          id: 'tj-nun-1',
          prompt: 'Identify the rule:',
          promptArabic: 'مَنْ آمَنَ',
          promptNote: 'Nun Sakinah followed by Hamza.',
          choices: [
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: true },
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-2',
          prompt: 'Identify the rule:',
          promptArabic: 'مَنْ يَقُولُ',
          promptNote: 'Nun Sakinah followed by Ya.',
          choices: [
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: true },
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-3',
          prompt: 'Identify the rule:',
          promptArabic: 'مِنْ بَعْدِ',
          promptNote: 'Nun Sakinah followed by Ba.',
          choices: [
            { id: 'iqlab', label: 'Iqlab (Change to Mim)', isCorrect: true },
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-4',
          prompt: 'Identify the rule:',
          promptArabic: 'مِنْ عِلْمٍ',
          promptNote: 'Nun Sakinah followed by Ain.',
          choices: [
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: true },
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-5',
          prompt: 'Identify the rule:',
          promptArabic: 'أَنْعَمْتَ',
          promptNote: 'Nun Sakinah followed by Ain.',
          choices: [
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: true },
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-6',
          prompt: 'Identify the rule:',
          promptArabic: 'مَنْ هَدَى',
          promptNote: 'Nun Sakinah followed by Ha.',
          choices: [
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: true },
            { id: 'iqlab', label: 'Iqlab (Change)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-7',
          prompt: 'Identify the rule:',
          promptArabic: 'مَنْ يَعْمَل',
          promptNote: 'Nun Sakinah followed by Ya.',
          choices: [
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: true },
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-8',
          prompt: 'Identify the rule:',
          promptArabic: 'مِنْ وَالٍ',
          promptNote: 'Nun Sakinah followed by Waw.',
          choices: [
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: true },
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-9',
          prompt: 'Identify the rule:',
          promptArabic: 'مِمَّالٍ',
          promptNote: 'Nun Sakinah (in Min) followed by Mim.',
          choices: [
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: true },
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-10',
          prompt: 'Identify the rule:',
          promptArabic: 'لَن يَنَالَ',
          promptNote: 'Nun Sakinah followed by Ya.',
          choices: [
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: true },
            { id: 'iqlab', label: 'Iqlab (Change)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-11',
          prompt: 'Identify the rule:',
          promptArabic: 'أَنفُسِكُم',
          promptNote: 'Nun Sakinah followed by Fa.',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: true },
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-12',
          prompt: 'Identify the rule:',
          promptArabic: 'مِنْ شَرِّ',
          promptNote: 'Nun Sakinah followed by Shin.',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: true },
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-13',
          prompt: 'Identify the rule:',
          promptArabic: 'مِنْ دُونِ',
          promptNote: 'Nun Sakinah followed by Dal.',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: true },
            { id: 'izhar', label: 'Izhar (Clear)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-14',
          prompt: 'Identify the rule:',
          promptArabic: 'مَنْ كَانَ',
          promptNote: 'Nun Sakinah followed by Kaf.',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: true },
            { id: 'iqlab', label: 'Iqlab (Change)', isCorrect: false }
          ]
        },
        {
          id: 'tj-nun-15',
          prompt: 'Identify the rule:',
          promptArabic: 'عَن صَلَاتِهِم',
          promptNote: 'Nun Sakinah followed by Sad.',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa (Hide)', isCorrect: true },
            { id: 'idgham', label: 'Idgham (Merge)', isCorrect: false }
          ]
        },
      ]
    }
  ]
}

// --- Qur'anic Reading Practice (Expert Stage)
function buildQuranicReadingLessons(): Lesson[] {
  return QURANIC_SURAHS.map((surah) => {
    const exercises: Exercise[] = surah.verses.map((verse) => ({
      id: `quran-${surah.number}-${verse.verseNumber}`,
      prompt: 'اقرأ هذه الآية',
      promptArabic: verse.arabic,
      choices: [
        { id: 'read', label: '✓', isCorrect: true },
      ],
    }))
    return {
      id: `quran-surah-${surah.number}`,
      title: surah.nameArabic,
      category: 'quran-reading' as LessonCategory,
      description: `${surah.verses.length} آيات`,
      objectives: [],
      exercises,
    }
  })
}

// --- Assemble full curriculum
export const curriculum: Level[] = [
  {
    id: 'huruf-identification',
    title: 'Huruf Identification',
    stageLabel: 'Beginner',
    description: 'Introduce all Arabic letters from Alif to Yaa — clear visuals, correct articulation, and beginner-friendly explanations.',
    focus: 'Letter names, shapes, and sounds from Alif to Ya.',
    colorClass: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/40',
    lessons: buildHurufIdentificationLessons(),
  },
  {
    id: 'huruf-positions',
    title: 'Huruf Positions',
    stageLabel: 'Beginner',
    description: 'Teach how each letter appears at the beginning, middle, and end of words — side-by-side comparisons and guided examples.',
    focus: 'Initial, medial, and final forms.',
    colorClass: 'from-sky-500/20 to-sky-500/5 border-sky-500/40',
    lessons: buildPositionsLessons(),
  },
  {
    id: 'arakat-mastery',
    title: 'Arakat (Harakat) Mastery',
    stageLabel: 'Intermediate',
    description: 'Cover all vowel marks in depth: Fatha, Kasra, Damma, Sukūn, Tanwīn, Shadda, and Maddah.',
    focus: 'All vowel marks and signs.',
    colorClass: 'from-amber-500/20 to-amber-500/5 border-amber-500/40',
    lessons: buildHarakatLessons(),
  },
  {
    id: 'sound-application',
    title: 'Sound Application',
    stageLabel: 'Intermediate',
    description: 'Demonstrate how each haraka changes the sound of every letter — slow, precise pronunciation and repeat-after-me.',
    focus: 'Letter + vowel combinations.',
    colorClass: 'from-teal-500/20 to-teal-500/5 border-teal-500/40',
    lessons: buildSoundApplicationLessons(),
  },
  {
    id: 'letter-combination',
    title: 'Letter Combination',
    stageLabel: 'Advanced',
    description: 'Progress from two-letter combinations to longer word constructions — scaffolded for fluency.',
    focus: 'Syllables and short words.',
    colorClass: 'from-violet-500/20 to-violet-500/5 border-violet-500/40',
    lessons: buildCombinationLessons(),
  },
  {
    id: 'tajweed-rules',
    title: 'Tajweed Rules',
    stageLabel: 'Advanced',
    description: 'Essential rules for beautiful recitation: Moon/Sun letters and the Name of Allah.',
    focus: 'Correct pronunciation rules.',
    colorClass: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/40',
    lessons: buildTajweedLessons(),
  },
  {
    id: 'quranic-reading',
    title: 'Qur\'anic Reading',
    stageLabel: 'Expert',
    description: 'Applied reading with real Qur\'anic verses — from Surah An-Nas to Al-Adiyat, pure Arabic without transliteration.',
    focus: 'Verse reading practice.',
    colorClass: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/40',
    lessons: buildQuranicReadingLessons(),
  },
]
