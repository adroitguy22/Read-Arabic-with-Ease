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
        audioUrl: `https://read-arabic-with-ease-backend.onrender.com/api/audio/letter/${letter.id}`,
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
  { id: 'positions-rest', title: 'Remaining letters', ids: ['siin', 'shiin', 'saad', 'daad', 'taa-heavy', 'dhaa', 'ain', 'ghain', 'faa', 'qaaf', 'kaaf', 'laam', 'miim', 'nuun', 'haa-light', 'waaw', 'yaa'] },
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
        audioUrl: `https://read-arabic-with-ease-backend.onrender.com/api/audio/haraka/${correctHaraka.id}`, // Generic audio if available
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
    audioUrl: `https://read-arabic-with-ease-backend.onrender.com/api/audio/sound/${l.id}/fatha`,
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
    // Stage 1: Two-letter combinations with Long Vowels (Madd)
    {
      id: 'combo-two-letter',
      title: 'Alif-madd, Waaw Sukun and Yaa Sukun',
      category: 'combination',
      description: 'Learn the three long vowels: Alif-madd (aa), Waaw Sukun (uu), and Yaa Sukun (ii). Combining a letter with these extends its sound.',
      objectives: [
        'Recognize Alif-madd (َا) - extends Fatha.',
        'Recognize Waaw Sukun (ُو) - extends Damma.',
        'Recognize Yaa Sukun (ِي) - extends Kasra.'
      ],
      practiceWords: ['بَا', 'بُو', 'بِي'],
      exercises: [
        // --- Alif-madd (aa) Group ---
        { id: 'two-1', prompt: 'Select the correct reading:', promptArabic: 'بَا', choices: [{ id: 'baa', label: 'Baa (long)', isCorrect: true }, { id: 'ba', label: 'Ba (short)', isCorrect: false }, { id: 'bu', label: 'Bu', isCorrect: false }] },
        { id: 'two-4', prompt: 'Select the correct reading:', promptArabic: 'لَا', choices: [{ id: 'laa', label: 'Laa (long)', isCorrect: true }, { id: 'la', label: 'La (short)', isCorrect: false }, { id: 'lu', label: 'Lu', isCorrect: false }] },
        { id: 'two-9', prompt: 'Select the correct reading:', promptArabic: 'قَا', choices: [{ id: 'qaa', label: 'Qaa (long)', isCorrect: true }, { id: 'qa', label: 'Qa (short)', isCorrect: false }, { id: 'qi', label: 'Qi', isCorrect: false }] },
        { id: 'two-13', prompt: 'Select the correct reading:', promptArabic: 'شَا', choices: [{ id: 'shaa', label: 'Shaa (long)', isCorrect: true }, { id: 'sha', label: 'Sha (short)', isCorrect: false }, { id: 'shu', label: 'Shu', isCorrect: false }] },
        { id: 'two-14', prompt: 'Select the correct reading:', promptArabic: 'يَا', choices: [{ id: 'yaa', label: 'Yaa (long)', isCorrect: true }, { id: 'ya', label: 'Ya (short)', isCorrect: false }, { id: 'yu', label: 'Yu', isCorrect: false }] },

        // --- Waaw Sukun (uu) Group ---
        { id: 'two-3', prompt: 'Select the correct reading:', promptArabic: 'نُو', choices: [{ id: 'noo', label: 'Noo (long)', isCorrect: true }, { id: 'nu', label: 'Nu (short)', isCorrect: false }, { id: 'ni', label: 'Ni', isCorrect: false }] },
        { id: 'two-6', prompt: 'Select the correct reading:', promptArabic: 'سُو', choices: [{ id: 'suu', label: 'Suu (long)', isCorrect: true }, { id: 'su', label: 'Su (short)', isCorrect: false }, { id: 'sa', label: 'Sa', isCorrect: false }] },
        { id: 'two-8', prompt: 'Select the correct reading:', promptArabic: 'فُو', choices: [{ id: 'foo', label: 'Foo (long)', isCorrect: true }, { id: 'fu', label: 'Fu (short)', isCorrect: false }, { id: 'fi', label: 'Fi', isCorrect: false }] },
        { id: 'two-11', prompt: 'Select the correct reading:', promptArabic: 'دُو', choices: [{ id: 'duu', label: 'Duu (long)', isCorrect: true }, { id: 'du', label: 'Du (short)', isCorrect: false }, { id: 'da', label: 'Da', isCorrect: false }] },
        { id: 'two-15', prompt: 'Select the correct reading:', promptArabic: 'خُو', choices: [{ id: 'khuu', label: 'Khuu (long)', isCorrect: true }, { id: 'khu', label: 'Khu (short)', isCorrect: false }, { id: 'khi', label: 'Khi', isCorrect: false }] }, // Fixed Arabic from Khu (short) to Khuu (long)

        // --- Yaa Sukun (ii) Group ---
        { id: 'two-2', prompt: 'Select the correct reading:', promptArabic: 'تِي', choices: [{ id: 'tee', label: 'Tee (long)', isCorrect: true }, { id: 'ti', label: 'Ti (short)', isCorrect: false }, { id: 'tu', label: 'Tu', isCorrect: false }] },
        { id: 'two-5', prompt: 'Select the correct reading:', promptArabic: 'رِي', choices: [{ id: 'ree', label: 'Ree (long)', isCorrect: true }, { id: 'ri', label: 'Ri (short)', isCorrect: false }, { id: 'ru', label: 'Ru', isCorrect: false }] },
        { id: 'two-7', prompt: 'Select the correct reading:', promptArabic: 'هِي', choices: [{ id: 'hee', label: 'Hee (long)', isCorrect: true }, { id: 'hi', label: 'Hi (short)', isCorrect: false }, { id: 'hu', label: 'Hu', isCorrect: false }] },
        { id: 'two-10', prompt: 'Select the correct reading:', promptArabic: 'جِي', choices: [{ id: 'jii', label: 'Jii (long)', isCorrect: true }, { id: 'ji', label: 'Ji (short)', isCorrect: false }, { id: 'ju', label: 'Ju', isCorrect: false }] },
        { id: 'two-12', prompt: 'Select the correct reading:', promptArabic: 'زِي', choices: [{ id: 'zii', label: 'Zii (long)', isCorrect: true }, { id: 'zi', label: 'Zi (short)', isCorrect: false }, { id: 'za', label: 'Za', isCorrect: false }] },
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
    // Stage 8: Five+ letter words
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
    // Stage 9: Mixed review
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

// --- Waqf (Quranic Stoppage Symbols)
function buildWaqfLessons(): Lesson[] {
  return [
    // Lesson 1: Introduction to Waqf
    {
      id: 'waqf-introduction',
      title: 'Introduction to Waqf',
      category: 'tajweed',
      description: 'Learn the importance of pausing correctly in Quranic recitation and the basic concept of Waqf (stoppage).',
      objectives: [
        'Understand why proper pausing matters.',
        'Learn the difference between mandatory and optional stops.',
        'Recognize that wrong stops can change meaning.'
      ],
      practiceWords: [],
      exercises: [
        {
          id: 'waqf-intro-1',
          prompt: 'What is Waqf in Tajweed?',
          promptArabic: '—',
          choices: [
            { id: 'stop', label: 'Stopping/Pausing at appropriate places', isCorrect: true },
            { id: 'fast', label: 'Reading quickly', isCorrect: false },
            { id: 'memorize', label: 'Memorizing the Quran', isCorrect: false }
          ]
        },
        {
          id: 'waqf-intro-2',
          prompt: 'Why is proper pausing important?',
          promptArabic: '—',
          choices: [
            { id: 'meaning', label: 'Wrong stops can change the meaning', isCorrect: true },
            { id: 'speed', label: 'To read faster', isCorrect: false },
            { id: 'style', label: 'For better pronunciation only', isCorrect: false }
          ]
        },
        {
          id: 'waqf-intro-3',
          prompt: 'Which is better: stopping at every word or connecting?',
          promptArabic: '—',
          choices: [
            { id: 'connect', label: 'Connect where possible, stop only when needed', isCorrect: true },
            { id: 'stop-all', label: 'Stop at every word', isCorrect: false },
            { id: 'never', label: 'Never stop while reading', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 2: Stop Completely (م - Waqf al-Mutlaq)
    {
      id: 'waqf-mutlaq',
      title: 'Stop Completely (م)',
      category: 'tajweed',
      description: 'The "م" symbol indicates a complete stop. Learn when and how to apply this strongest stopping signal.',
      objectives: [
        'Recognize the "م" (Meem) symbol.',
        'Apply complete stops appropriately.',
        'Distinguish from lighter pauses.'
      ],
      practiceWords: ['الرحمنْ', 'ربّ العالمينْ', 'اللهْ'],
      exercises: [
        {
          id: 'waqf-m-1',
          prompt: 'What does this symbol indicate?',
          promptArabic: 'الرحمنْ م',
          choices: [
            { id: 'stop-complete', label: 'Stop completely', isCorrect: true },
            { id: 'continue', label: 'Continue reading', isCorrect: false },
            { id: 'pause-light', label: 'Light pause only', isCorrect: false }
          ]
        },
        {
          id: 'waqf-m-2',
          prompt: 'Identify this waqf symbol:',
          promptArabic: 'م',
          choices: [
            { id: 'mutlaq', label: 'Waqf al-Mutlaq - Stop completely', isCorrect: true },
            { id: 'breath', label: 'Breath mark', isCorrect: false },
            { id: 'continue', label: 'Continue', isCorrect: false }
          ]
        },
        {
          id: 'waqf-m-3',
          prompt: 'Apply the rule: You see "اللهْ م" - what do you do?',
          promptArabic: 'اللهْ م',
          choices: [
            { id: 'full-stop', label: 'Come to a complete stop', isCorrect: true },
            { id: 'connect', label: 'Connect to next word', isCorrect: false },
            { id: 'breathe', label: 'Take a breath and continue', isCorrect: false }
          ]
        },
        {
          id: 'waqf-m-4',
          prompt: 'The "م" symbol is also called:',
          promptArabic: 'م',
          choices: [
            { id: 'silent', label: 'Waqf al-Silent (السكت)', isCorrect: true },
            { id: 'breath', label: 'Breath mark', isCorrect: false },
            { id: 'continue', label: 'Continuation mark', isCorrect: false }
          ]
        },
        {
          id: 'waqf-m-5',
          prompt: 'When you see "م", you should:',
          promptArabic: '—',
          choices: [
            { id: 'stop', label: 'Stop like ending a sentence', isCorrect: true },
            { id: 'run', label: 'Keep reading without pausing', isCorrect: false },
            { id: 'skip', label: 'Skip the word entirely', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 3: Light Pause (ج - Breath Mark)
    {
      id: 'waqf-breath',
      title: 'Light Pause (ج)',
      category: 'tajweed',
      description: 'The "ج" symbol is the breath mark - a very slight pause like catching your breath.',
      objectives: [
        'Recognize the "ج" (Jeeem) symbol.',
        'Apply the lightest of pauses.',
        'Distinguish from complete stops.'
      ],
      practiceWords: [],
      exercises: [
        {
          id: 'waqf-j-1',
          prompt: 'What does "ج" indicate?',
          promptArabic: 'ج',
          choices: [
            { id: 'breath', label: 'Very slight pause - catch your breath', isCorrect: true },
            { id: 'stop', label: 'Complete stop', isCorrect: false },
            { id: 'continue', label: 'Continue immediately', isCorrect: false }
          ]
        },
        {
          id: 'waqf-j-2',
          prompt: 'The breath mark "ج" is:',
          promptArabic: '—',
          choices: [
            { id: 'lightest', label: 'The lightest pause in Quran', isCorrect: true },
            { id: 'heaviest', label: 'A complete stop', isCorrect: false },
            { id: 'optional', label: 'Same as complete stop', isCorrect: false }
          ]
        },
        {
          id: 'waqf-j-3',
          prompt: 'When should you use the breath mark?',
          promptArabic: '—',
          choices: [
            { id: 'catch-breath', label: 'When you need to catch your breath', isCorrect: true },
            { id: 'every-word', label: 'At every word', isCorrect: false },
            { id: 'never', label: 'Never use it while reading', isCorrect: false }
          ]
        },
        {
          id: 'waqf-j-4',
          prompt: 'Which is lighter: "م" or "ج"?',
          promptArabic: '—',
          choices: [
            { id: 'j', label: 'ج (lighter)', isCorrect: true },
            { id: 'm', label: 'م (lighter)', isCorrect: false },
            { id: 'same', label: 'They are the same', isCorrect: false }
          ]
        },
        {
          id: 'waqf-j-5',
          prompt: 'The breath mark comes from the letter:',
          promptArabic: 'ج',
          choices: [
            { id: 'jeem', label: 'Jeem (ج)', isCorrect: true },
            { id: 'meem', label: 'Meem (م)', isCorrect: false },
            { id: 'ha', label: 'Ha (ه)', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 4: Qif - Expected Stop (ق)
    {
      id: 'waqf-qif',
      title: 'Expected Stop (ق)',
      category: 'tajweed',
      description: 'The "ق" symbol (Qif) indicates it is permissible and expected to stop at this point.',
      objectives: [
        'Recognize the "ق" (Qaf) symbol.',
        'Understand it indicates optional stopping.',
        'Apply appropriately in recitation.'
      ],
      practiceWords: [],
      exercises: [
        {
          id: 'waqf-q-1',
          prompt: 'What does "ق" indicate?',
          promptArabic: 'ق',
          choices: [
            { id: 'expected', label: 'It is expected/permissible to stop here', isCorrect: true },
            { id: 'must', label: 'Must stop here', isCorrect: false },
            { id: 'never', label: 'Never stop here', isCorrect: false }
          ]
        },
        {
          id: 'waqf-q-2',
          prompt: '"ق" comes from the Arabic word:',
          promptArabic: 'ق',
          choices: [
            { id: 'qif', label: 'Qif (قِف) - Stop!', isCorrect: true },
            { id: 'qalam', label: 'Qalam - Pen', isCorrect: false },
            { id: 'quran', label: 'Quran', isCorrect: false }
          ]
        },
        {
          id: 'waqf-q-3',
          prompt: 'With "ق", you should:',
          promptArabic: '—',
          choices: [
            { id: 'optional', label: 'Stop if needed - it is allowed here', isCorrect: true },
            { id: 'mandatory', label: 'Must stop - no choice', isCorrect: false },
            { id: 'forbidden', label: 'Cannot stop here', isCorrect: false }
          ]
        },
        {
          id: 'waqf-q-4',
          prompt: 'How does "ق" compare to "م"?',
          promptArabic: '—',
          choices: [
            { id: 'lighter', label: 'ق is lighter than م (less strong)', isCorrect: true },
            { id: 'heavier', label: 'ق is stronger than م', isCorrect: false },
            { id: 'same', label: 'They mean the same thing', isCorrect: false }
          ]
        },
        {
          id: 'waqf-q-5',
          prompt: 'If you see "ق", stopping is:',
          promptArabic: '—',
          choices: [
            { id: 'good', label: 'Good/Acceptable choice', isCorrect: true },
            { id: 'wrong', label: 'Always wrong', isCorrect: false },
            { id: 'required', label: 'Required', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 5: Continuation Symbols (ص، ل، ع)
    {
      id: 'waqf-continue',
      title: 'Continue Reading (ص، ل، ع)',
      category: 'tajweed',
      description: 'Three symbols indicate you should continue: ص (Sadal), ل (Lam), and ع (Ain). Learn when NOT to stop.',
      objectives: [
        'Recognize all three continuation symbols.',
        'Understand they mean "do not stop here".',
        'Apply to maintain flow in recitation.'
      ],
      practiceWords: [],
      exercises: [
        {
          id: 'waqf-cont-1',
          prompt: 'What does "ص" (Sadal) indicate?',
          promptArabic: 'ص',
          choices: [
            { id: 'continue', label: 'Continue - do not stop', isCorrect: true },
            { id: 'stop', label: 'Stop here', isCorrect: false },
            { id: 'breathe', label: 'Take a breath only', isCorrect: false }
          ]
        },
        {
          id: 'waqf-cont-2',
          prompt: 'What does "ل" (Lam) indicate?',
          promptArabic: 'ل',
          choices: [
            { id: 'breathe', label: 'Take a breath and continue', isCorrect: true },
            { id: 'stop', label: 'Stop completely', isCorrect: false },
            { id: 'optional', label: 'Optional to stop', isCorrect: false }
          ]
        },
        {
          id: 'waqf-cont-3',
          prompt: 'What does "ع" (Ain) indicate?',
          promptArabic: 'ع',
          choices: [
            { id: 'continue', label: 'Continue - general continuation', isCorrect: true },
            { id: 'stop', label: 'Stop here', isCorrect: false },
            { id: 'light', label: 'Light pause only', isCorrect: false }
          ]
        },
        {
          id: 'waqf-cont-4',
          prompt: 'All three symbols (ص، ل، ع) mean:',
          promptArabic: '—',
          choices: [
            { id: 'continue', label: 'Continue - do not stop', isCorrect: true },
            { id: 'stop', label: 'Stop here', isCorrect: false },
            { id: 'optional', label: 'Optional stopping', isCorrect: false }
          ]
        },
        {
          id: 'waqf-cont-5',
          prompt: 'If you see "ص" over a word, you should:',
          promptArabic: 'ص',
          choices: [
            { id: 'read-on', label: 'Keep reading to the next word', isCorrect: true },
            { id: 'stop', label: 'Stop immediately', isCorrect: false },
            { id: 'repeat', label: 'Repeat the word', isCorrect: false }
          ]
        },
        {
          id: 'waqf-cont-6',
          prompt: 'The difference between "ل" and "ع" is:',
          promptArabic: '—',
          choices: [
            { id: 'breath', label: 'ل includes a breath, ع is seamless', isCorrect: true },
            { id: 'stop', label: 'ل means stop, ع means continue', isCorrect: false },
            { id: 'none', label: 'No practical difference', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 6: Small Ta (ۚ) - Stop and Continue
    {
      id: 'waqf-ta',
      title: 'Stop & Continue (ۚ)',
      category: 'tajweed',
      description: 'The small Ta (ۚ) indicates a pause like a comma - stop briefly then continue.',
      objectives: [
        'Recognize the "ۚ" (Small Ta) symbol.',
        'Apply brief pauses appropriately.',
        'Understand it is like a comma in English.'
      ],
      practiceWords: [],
      exercises: [
        {
          id: 'waqf-ta-1',
          prompt: 'What does "ۚ" (Small Ta) indicate?',
          promptArabic: 'ۚ',
          choices: [
            { id: 'comma', label: 'Stop briefly (like a comma), then continue', isCorrect: true },
            { id: 'end', label: 'End of the verse', isCorrect: false },
            { id: 'continue', label: 'Continue without stopping', isCorrect: false }
          ]
        },
        {
          id: 'waqf-ta-2',
          prompt: 'Small Ta is similar to:',
          promptArabic: '—',
          choices: [
            { id: 'comma', label: 'A comma in English', isCorrect: true },
            { id: 'period', label: 'A period (full stop)', isCorrect: false },
            { id: 'question', label: 'A question mark', isCorrect: false }
          ]
        },
        {
          id: 'waqf-ta-3',
          prompt: 'After seeing "ۚ", you should:',
          promptArabic: '—',
          choices: [
            { id: 'resume', label: 'Stop briefly then continue to next sentence', isCorrect: true },
            { id: 'end', label: 'End your recitation', isCorrect: false },
            { id: 'repeat', label: 'Repeat from the beginning', isCorrect: false }
          ]
        },
        {
          id: 'waqf-ta-4',
          prompt: 'How long is the pause with "ۚ"?',
          promptArabic: '—',
          choices: [
            { id: 'short', label: 'Very short - like a comma', isCorrect: true },
            { id: 'long', label: 'Very long - like a period', isCorrect: false },
            { id: 'none', label: 'No pause at all', isCorrect: false }
          ]
        },
        {
          id: 'waqf-ta-5',
          prompt: 'The small Ta looks like:',
          promptArabic: 'ۚ',
          choices: [
            { id: 'tiny-ta', label: 'A tiny version of the letter Ta', isCorrect: true },
            { id: 'large-ta', label: 'A large Ta', isCorrect: false },
            { id: 'ha', label: 'The letter Ha', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 7: Laa (لا) - Do Not Stop
    {
      id: 'waqf-laa',
      title: 'Do Not Stop (لا)',
      category: 'tajweed',
      description: 'The "لا" symbol is critical - it warns you NOT to stop here as it would change the meaning.',
      objectives: [
        'Recognize the "لا" warning symbol.',
        'Understand stopping would change meaning.',
        'Apply to maintain correct meaning.'
      ],
      practiceWords: [],
      exercises: [
        {
          id: 'waqf-laa-1',
          prompt: 'What does "لا" indicate?',
          promptArabic: 'لا',
          choices: [
            { id: 'do-not-stop', label: 'Do NOT stop here - it changes meaning!', isCorrect: true },
            { id: 'stop', label: 'Must stop here', isCorrect: false },
            { id: 'optional', label: 'Optional to stop', isCorrect: false }
          ]
        },
        {
          id: 'waqf-laa-2',
          prompt: 'Why is "لا" important?',
          promptArabic: '—',
          choices: [
            { id: 'meaning', label: 'Stopping would change the meaning incorrectly', isCorrect: true },
            { id: 'respect', label: 'Show respect to Allah', isCorrect: false },
            { id: 'speed', label: 'To read faster', isCorrect: false }
          ]
        },
        {
          id: 'waqf-laa-3',
          prompt: 'If you see "لا", you should:',
          promptArabic: '—',
          choices: [
            { id: 'connect', label: 'Connect to next word - never stop!', isCorrect: true },
            { id: 'stop', label: 'Stop immediately', isCorrect: false },
            { id: 'breathe', label: 'Take a breath and continue', isCorrect: false }
          ]
        },
        {
          id: 'waqf-laa-4',
          prompt: '"لا" is the most important waqf rule because:',
          promptArabic: '—',
          choices: [
            { id: 'meaning', label: 'Wrong stops can completely change the message', isCorrect: true },
            { id: 'rhythm', label: 'It sounds better', isCorrect: false },
            { id: 'easy', label: 'It is the easiest rule', isCorrect: false }
          ]
        },
        {
          id: 'waqf-laa-5',
          prompt: 'Example: "لا إِلَهَ إِلَّا اللَّه" - where is "لا" placed?',
          promptArabic: '—',
          choices: [
            { id: 'between', label: 'Between parts to show connection needed', isCorrect: true },
            { id: 'end', label: 'At the end to stop', isCorrect: false },
            { id: 'start', label: 'At the start only', isCorrect: false }
          ]
        }
      ]
    },

    // Lesson 8: Comprehensive Review
    {
      id: 'waqf-review',
      title: 'Waqf Comprehensive Review',
      category: 'tajweed',
      description: 'Practice identifying and applying all waqf symbols in various contexts.',
      objectives: [
        'Identify all 8 waqf symbols.',
        'Apply correct pausing rules.',
        'Build confidence in recitation.'
      ],
      practiceWords: ['الرحمنْ', 'ربّ العالمينْ', 'اللهْ', 'الحمدْ'],
      exercises: [
        {
          id: 'waqf-rev-1',
          prompt: 'Which symbol means "stop completely"?',
          promptArabic: '—',
          choices: [
            { id: 'm', label: 'م', isCorrect: true },
            { id: 'j', label: 'ج', isCorrect: false },
            { id: 'sad', label: 'ص', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-2',
          prompt: 'Which symbol means "continue"?',
          promptArabic: '—',
          choices: [
            { id: 'sad-lam-ayn', label: 'ص، ل، or ع', isCorrect: true },
            { id: 'm', label: 'م', isCorrect: false },
            { id: 'q', label: 'ق', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-3',
          prompt: 'Which is the lightest pause?',
          promptArabic: '—',
          choices: [
            { id: 'j', label: 'ج (breath mark)', isCorrect: true },
            { id: 'm', label: 'م (complete stop)', isCorrect: false },
            { id: 'ta', label: 'ۚ (small ta)', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-4',
          prompt: 'What does this indicate: ۚ',
          promptArabic: '—',
          choices: [
            { id: 'comma', label: 'Stop like a comma, then continue', isCorrect: true },
            { id: 'stop', label: 'Complete stop', isCorrect: false },
            { id: 'continue', label: 'Continue without pause', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-5',
          prompt: 'You see "لا" - what should you do?',
          promptArabic: '—',
          choices: [
            { id: 'never-stop', label: 'Never stop here - connect to next word', isCorrect: true },
            { id: 'stop', label: 'Stop here', isCorrect: false },
            { id: 'optional', label: 'Optional to stop', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-6',
          prompt: 'Which symbol means "take a breath and continue"?',
          promptArabic: '—',
          choices: [
            { id: 'lam', label: 'ل (Lam)', isCorrect: true },
            { id: 'sad', label: 'ص (Sadal)', isCorrect: false },
            { id: 'ayn', label: 'ع (Ain)', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-7',
          prompt: '"ق" indicates:',
          promptArabic: '—',
          choices: [
            { id: 'expected', label: 'Expected/permissible to stop', isCorrect: true },
            { id: 'forbidden', label: 'Forbidden to stop', isCorrect: false },
            { id: 'complete', label: 'Complete stop required', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-8',
          prompt: 'How many main waqf symbols are there?',
          promptArabic: '—',
          choices: [
            { id: 'eight', label: '8 symbols', isCorrect: true },
            { id: 'three', label: '3 symbols', isCorrect: false },
            { id: 'twenty', label: '20 symbols', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-9',
          prompt: '"ص" comes from the letter:',
          promptArabic: '—',
          choices: [
            { id: 'sad', label: 'Sad (ص)', isCorrect: true },
            { id: 'sin', label: 'Sin (س)', isCorrect: false },
            { id: 'shin', label: 'Shin (ش)', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-10',
          prompt: 'The "لا" symbol prevents:',
          promptArabic: '—',
          choices: [
            { id: 'wrong-meaning', label: 'Stopping that changes meaning incorrectly', isCorrect: true },
            { id: 'fast-reading', label: 'Reading too fast', isCorrect: false },
            { id: 'memorization', label: 'Memorizing the verse', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-11',
          prompt: 'Identify: م',
          promptArabic: '—',
          choices: [
            { id: 'silent', label: 'Waqf al-Mutlaq - Stop completely', isCorrect: true },
            { id: 'breath', label: 'Breath mark', isCorrect: false },
            { id: 'continue', label: 'Continue', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-12',
          prompt: 'Identify: ج',
          promptArabic: '—',
          choices: [
            { id: 'breath', label: 'Breath mark - very light pause', isCorrect: true },
            { id: 'stop', label: 'Complete stop', isCorrect: false },
            { id: 'continue', label: 'Continue', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-13',
          prompt: 'Identify: ص',
          promptArabic: '—',
          choices: [
            { id: 'continue', label: 'Continue - do not stop', isCorrect: true },
            { id: 'stop', label: 'Stop here', isCorrect: false },
            { id: 'breathe', label: 'Take a breath', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-14',
          prompt: 'Identify: ۚ',
          promptArabic: '—',
          choices: [
            { id: 'small-ta', label: 'Small Ta - stop briefly like a comma', isCorrect: true },
            { id: 'stop', label: 'Complete stop', isCorrect: false },
            { id: 'continue', label: 'Continue', isCorrect: false }
          ]
        },
        {
          id: 'waqf-rev-15',
          prompt: 'Which symbols indicate "continue"?',
          promptArabic: '—',
          choices: [
            { id: 'sad-lam-ayn', label: 'ص، ل، ع', isCorrect: true },
            { id: 'm-j', label: 'م and ج', isCorrect: false },
            { id: 'q-ta', label: 'ق and ۚ', isCorrect: false }
          ]
        }
      ]
    }
  ]
}
function buildTajweedLessons(): Lesson[] {
  return [
    // ============================================
    // STAGE 6: TAJWEED RULES - Individual Lessons
    // ============================================

    // Stage 6.1: Madda Asli (Natural Madd)
    {
      id: 'tajweed-madda-asli',
      title: 'Madda Asli (Natural Elongation)',
      category: 'tajweed',
      description: 'Madda Asli is the natural elongation that occurs when a long vowel letter (Alif ا, Waaw و, or Yaa ي) follows its corresponding short vowel.',
      objectives: [
        'Recognize the 3 conditions for Madda Asli.',
        'Apply 2-count elongation correctly.',
        'Distinguish Madda Asli from other Madd types.'
      ],
      practiceWords: ['قَالَ', 'يَقُولُ', 'قِيلَ', 'خَلَقَ', 'زُيِّنَت', 'نِيلَ', 'سُبُحَان'],
      exercises: [
        // Concept: What is Madda Asli?
        {
          id: 'madd-asli-concept',
          prompt: 'What is Madda Asli (Natural Madd)?',
          promptArabic: 'قَالَ',
          promptNote: 'Look at the Alif (ا) with Fatha (َ) before it.',
          choices: [
            { id: '2-counts', label: 'Natural elongation held for 2 counts', isCorrect: true },
            { id: '4-5-counts', label: 'Medium elongation for 4-5 counts', isCorrect: false },
            { id: '6-counts', label: 'Long elongation for 6 counts', isCorrect: false }
          ]
        },
        // Concept: The 3 conditions
        {
          id: 'madd-asli-conditions',
          prompt: 'Which of these creates Madda Asli?',
          promptArabic: '—',
          promptNote: 'Select the pattern that produces natural elongation.',
          choices: [
            { id: 'all-three', label: 'All: Fatha+ا, Damma+و, Kasra+ي', isCorrect: true },
            { id: 'only-alif', label: 'Only Fatha + Alif (َا)', isCorrect: false },
            { id: 'only-hamza', label: 'Only Madda (آ)', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'madd-asli-read-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'قَالَ',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'qaala', label: 'Qaala (long aa)', isCorrect: true },
            { id: 'qal', label: 'Qal (short)', isCorrect: false },
            { id: 'qaal', label: 'Qaal', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَقُولُ',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'yaqoolu', label: 'Yaqoolu (long uu)', isCorrect: true },
            { id: 'yaqul', label: 'Yaqul (short)', isCorrect: false },
            { id: 'yaqul', label: 'Yaqwl', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'قِيلَ',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'qeela', label: 'Qeela (long ii)', isCorrect: true },
            { id: 'qil', label: 'Qil (short)', isCorrect: false },
            { id: 'qil', label: 'Qeel', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'خَلَقَ',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'khalaqa', label: 'Khalaqa (long aa)', isCorrect: true },
            { id: 'khalqa', label: 'Khalqa', isCorrect: false },
            { id: 'khalaq', label: 'Khalaq', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'زُيِّنَت',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'zuyyina', label: 'Zuyyina (long uu)', isCorrect: true },
            { id: 'zayyina', label: 'Zayyina', isCorrect: false },
            { id: 'zina', label: 'Zina', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'نِيلَ',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'neela', label: 'Neela (long ii)', isCorrect: true },
            { id: 'nila', label: 'Nila', isCorrect: false },
            { id: 'neel', label: 'Neel', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'كَافِرِين',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'kafireen', label: 'Kafireen', isCorrect: true },
            { id: 'kafirin', label: 'Kafirin', isCorrect: false },
            { id: 'kafaran', label: 'Kafaran', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'سُبُحَان',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'subhana', label: 'Subhana (long uu)', isCorrect: true },
            { id: 'sabhan', label: 'Sabhan', isCorrect: false },
            { id: 'subhaan', label: 'Subhaan', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْكَافِرُونَ',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'alkafiroon', label: 'Al-Kafiroon', isCorrect: true },
            { id: 'alkafrun', label: 'Al-Kafrun', isCorrect: false },
            { id: 'alkafoor', label: 'Al-Kafoor', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'رَحِيم',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'raheem', label: 'Raheem', isCorrect: true },
            { id: 'rahim', label: 'Rahim', isCorrect: false },
            { id: 'rahiim', label: 'Rahiim', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-11',
          prompt: 'Select the correct reading:',
          promptArabic: 'كَرِيم',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'kareem', label: 'Kareem', isCorrect: true },
            { id: 'karim', label: 'Karim', isCorrect: false },
            { id: 'kariim', label: 'Kariim', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-read-12',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَظِيم',
          promptNote: 'Hold the Madda for 2 counts.',
          choices: [
            { id: 'adheem', label: 'Adheem', isCorrect: true },
            { id: 'adhim', label: 'Adhim', isCorrect: false },
            { id: 'adhiim', label: 'Adhiim', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'madd-asli-id-1',
          prompt: 'Identify the Madd type:',
          promptArabic: 'قَالَ',
          choices: [
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: true },
            { id: 'muttasil', label: 'Madda Muttasil (4-5)', isCorrect: false },
            { id: 'lazim', label: 'Madda Lazim (6)', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-id-2',
          prompt: 'Identify the Madd type:',
          promptArabic: 'يَقُولُ',
          choices: [
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: true },
            { id: 'muttasil', label: 'Madda Muttasil (4-5)', isCorrect: false },
            { id: 'lazim', label: 'Madda Lazim (6)', isCorrect: false }
          ]
        },
        {
          id: 'madd-asli-id-3',
          prompt: 'Identify the Madd type:',
          promptArabic: 'قِيلَ',
          choices: [
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: true },
            { id: 'muttasil', label: 'Madda Muttasil (4-5)', isCorrect: false },
            { id: 'munfasil', label: 'Madda Munfasil (4-5)', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.2: Madda Muttasil (Connected Madd)
    {
      id: 'tajweed-madda-muttasil',
      title: 'Madda Muttasil (Connected Elongation)',
      category: 'tajweed',
      description: 'Madda Muttasil occurs when Hamza (ء) and Madd letter (ا, و, ي) appear in the same word. The elongation is held for 4-5 counts.',
      objectives: [
        'Recognize Hamza + Madd in same word.',
        'Apply 4-5 count elongation correctly.',
        'Distinguish from Madda Munfasil.'
      ],
      practiceWords: ['جَاء', 'جَاءت', 'سُوء', 'شَيء', 'تَوْءَم', 'نَشُور'],
      exercises: [
        // Concept
        {
          id: 'madd-muttasil-concept',
          prompt: 'What is Madda Muttasil?',
          promptArabic: 'جَاء',
          promptNote: 'Hamza (ء) and Madd (ا) are in the SAME word.',
          choices: [
            { id: '4-5-counts', label: 'Connected Madd - 4-5 counts', isCorrect: true },
            { id: '2-counts', label: 'Natural Madd - 2 counts', isCorrect: false },
            { id: '6-counts', label: 'Obligatory Madd - 6 counts', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-concept-2',
          prompt: 'What makes Madd Muttasil different from Munfasil?',
          promptArabic: '—',
          promptNote: 'Think about where the Hamza and Madd are located.',
          choices: [
            { id: 'same-word', label: 'Hamza and Madd in SAME word', isCorrect: true },
            { id: 'diff-word', label: 'Hamza and Madd in DIFFERENT words', isCorrect: false },
            { id: 'sukun', label: 'Madd followed by Sukun', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'madd-muttasil-read-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'جَاء',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'jaa', label: 'Jaa\' (very long aa)', isCorrect: true },
            { id: 'ja', label: 'Ja (short)', isCorrect: false },
            { id: 'jaa-a', label: 'Jaa\'a', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'جَاءت',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'jaat', label: 'Jaa\'t (very long aa)', isCorrect: true },
            { id: 'jat', label: 'Jat (short)', isCorrect: false },
            { id: 'ja-at', label: 'Ja\'at', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَسُوء',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'yasuu', label: 'Yasuu\' (very long uu)', isCorrect: true },
            { id: 'yasu', label: 'Yasu (short)', isCorrect: false },
            { id: 'yaswu', label: 'Yaswu', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَشَاء',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'yashaa', label: 'Yashaa\' (very long aa)', isCorrect: true },
            { id: 'yasha', label: 'Yasha (short)', isCorrect: false },
            { id: 'yashaa-a', label: 'Yashaa\'a', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'تَوْءَم',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'taw-am', label: 'Taw\'am (very long uu)', isCorrect: true },
            { id: 'ta-am', label: 'Ta\'am (short)', isCorrect: false },
            { id: 'tu-am', label: 'Tu\'am', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَضِيء',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'yad-ii', label: 'Yadii\' (very long ii)', isCorrect: true },
            { id: 'yadi', label: 'Yadi (short)', isCorrect: false },
            { id: 'yad-ia', label: 'Yadi\'a', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'نَشُور',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'nashuu', label: 'Nashuu\' (very long uu)', isCorrect: true },
            { id: 'nashu', label: 'Nashu (short)', isCorrect: false },
            { id: 'nash-wu', label: 'Nash-wu\'', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'سُوء',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'suu', label: 'Suu\' (very long uu)', isCorrect: true },
            { id: 'su', label: 'Su (short)', isCorrect: false },
            { id: 'suu-a', label: 'Suu\'a', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'شَيء',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'shay', label: 'Shay\' (very long ii)', isCorrect: true },
            { id: 'shai', label: 'Shai (short)', isCorrect: false },
            { id: 'shay-i', label: 'Shay\'i', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-read-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَسُوءُهُم',
          promptNote: 'Hold for 4-5 counts (Madda Muttasil).',
          choices: [
            { id: 'yasuu-hum', label: 'Yasuu\'uhum (very long uu)', isCorrect: true },
            { id: 'yasu-hum', label: 'Yasu-hum (short)', isCorrect: false },
            { id: 'yaswu-hum', label: 'Yaswu-hum', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'madd-muttasil-id-1',
          prompt: 'Identify the Madd type:',
          promptArabic: 'جَاء',
          choices: [
            { id: 'muttasil', label: 'Madda Muttasil (4-5 counts)', isCorrect: true },
            { id: 'munfasil', label: 'Madda Munfasil (4-5 counts)', isCorrect: false },
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-id-2',
          prompt: 'Identify the Madd type:',
          promptArabic: 'سُوء',
          choices: [
            { id: 'muttasil', label: 'Madda Muttasil (4-5 counts)', isCorrect: true },
            { id: 'lazim', label: 'Madda Lazim (6 counts)', isCorrect: false },
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: false }
          ]
        },
        {
          id: 'madd-muttasil-id-3',
          prompt: 'Why is this Madda Muttasil?',
          promptArabic: 'شَيء',
          choices: [
            { id: 'same-word', label: 'Hamza and Madd in same word', isCorrect: true },
            { id: 'diff-word', label: 'Hamza and Madd in different words', isCorrect: false },
            { id: 'sukun-follows', label: 'Madd followed by Sukun', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.3: Madda Munfasil (Separated Madd)
    {
      id: 'tajweed-madda-munfasil',
      title: 'Madda Munfasil (Separated Elongation)',
      category: 'tajweed',
      description: 'Madda Munfasil occurs when a Madd letter (ا, و, ي) appears at the end of a word and Hamza (ء) appears at the beginning of the next word. The elongation is held for 4-5 counts.',
      objectives: [
        'Recognize Madd at word end + Hamza at next word start.',
        'Apply 4-5 count elongation correctly.',
        'Distinguish from Madda Muttasil.'
      ],
      practiceWords: ['إِنَّا أَعْطَيْنَاك', 'إِنَّا نَحْنُ', 'هَـٰذَا أَخِي', 'قَالُوا أَأَنت'],
      exercises: [
        // Concept
        {
          id: 'madd-munfasil-concept',
          prompt: 'What is Madda Munfasil?',
          promptArabic: 'إِنَّا أَعْطَيْنَاك',
          promptNote: 'Madd (ا) at end of word, Hamza (أ) at start of next.',
          choices: [
            { id: '4-5-counts', label: 'Separated Madd - 4-5 counts', isCorrect: true },
            { id: '2-counts', label: 'Natural Madd - 2 counts', isCorrect: false },
            { id: '6-counts', label: 'Obligatory Madd - 6 counts', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-concept-2',
          prompt: 'What makes Madd Munfasil different from Muttasil?',
          promptArabic: '—',
          promptNote: 'Think about word boundaries.',
          choices: [
            { id: 'diff-word', label: 'Madd and Hamza in DIFFERENT words', isCorrect: true },
            { id: 'same-word', label: 'Madd and Hamza in SAME word', isCorrect: false },
            { id: 'sukun', label: 'Madd followed by Sukun', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'madd-munfasil-read-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّا أَعْطَيْنَاك',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'inna-ataynaka', label: 'Innaa ataynaka (long aa)', isCorrect: true },
            { id: 'in-ataynaka', label: 'In ataynaka (short)', isCorrect: false },
            { id: 'inna-ataynaka', label: 'Inna ataynaka', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّا نَحْنُ',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'inna-nahnu', label: 'Innaa nahnu (long aa)', isCorrect: true },
            { id: 'in-nahnu', label: 'In nahnu (short)', isCorrect: false },
            { id: 'ina-nahnu', label: 'Ina nahnu', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'هَـٰذَا أَخِي',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'hadha-akhi', label: 'Hadhaa akhi (long aa)', isCorrect: true },
            { id: 'hadha-akhi', label: 'Hadha akhi (short)', isCorrect: false },
            { id: 'hadha-akhi', label: 'Haza akhi', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'قَالُوا أَأَنت',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'qaloo-a-anta', label: 'Qaloo a-anta (long uu)', isCorrect: true },
            { id: 'qalu-a-anta', label: 'Qalu a-anta (short)', isCorrect: false },
            { id: 'qalu-anta', label: 'Qalu anta', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَا أَيُّهَا',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'yaa-ayyuha', label: 'Yaaa ayyuha (long aa)', isCorrect: true },
            { id: 'ya-ayyuha', label: 'Ya ayyuha (short)', isCorrect: false },
            { id: 'yaa-ayyoha', label: 'Yaaa ayyoha', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'هَـٰؤُلَاء إِخْوَة',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'haa-ulaa-ikhwa', label: 'Haaa ulaaa ikhwa (long aa)', isCorrect: true },
            { id: 'ha-ula-ikhwa', label: 'Ha ula ikhwa (short)', isCorrect: false },
            { id: 'haulaa-ikhwa', label: 'Haulaaa ikhwa', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْحَمْدُ لِلَّه',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'alhamdu-lillah', label: 'Al-Hamdu lillaah (long aa)', isCorrect: true },
            { id: 'alhamdu-lillah', label: 'Al-Hamdu lillah (short)', isCorrect: false },
            { id: 'ahhamdu-lillah', label: 'Ahhhamdu lillaah', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'نَحْنُ نَزَّلْنَا',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'nahnu-nazzalnaa', label: 'Nahnu nazzalnaa (long aa)', isCorrect: true },
            { id: 'nahnu-nazzalna', label: 'Nahnu nazzalna (short)', isCorrect: false },
            { id: 'nahnu-nazzal-na', label: 'Nahnu nazzal-na', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'قَالُوا أَسْمِع',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'qaloo-a-isma', label: 'Qaloo a-isma\' (long uu)', isCorrect: true },
            { id: 'qalu-a-isma', label: 'Qalu a-isma\' (short)', isCorrect: false },
            { id: 'qalu-asma', label: 'Qalu asma\'', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-read-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّا أَنزَلْنَا',
          promptNote: 'Hold the Madd for 4-5 counts.',
          choices: [
            { id: 'innaa-anzalnaa', label: 'Inaaa anzalnaa (very long aa)', isCorrect: true },
            { id: 'ina-anzalna', label: 'Ina anzalna (short)', isCorrect: false },
            { id: 'inna-anzalnaa', label: 'Inna anzalnaa', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'madd-munfasil-id-1',
          prompt: 'Identify the Madd type:',
          promptArabic: 'إِنَّا أَعْطَيْنَاك',
          choices: [
            { id: 'munfasil', label: 'Madda Munfasil (4-5 counts)', isCorrect: true },
            { id: 'muttasil', label: 'Madda Muttasil (4-5 counts)', isCorrect: false },
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-id-2',
          prompt: 'Identify the Madd type:',
          promptArabic: 'هَـٰذَا أَخِي',
          choices: [
            { id: 'munfasil', label: 'Madda Munfasil (4-5 counts)', isCorrect: true },
            { id: 'lazim', label: 'Madda Lazim (6 counts)', isCorrect: false },
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: false }
          ]
        },
        {
          id: 'madd-munfasil-id-3',
          prompt: 'Why is this Madda Munfasil?',
          promptArabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا',
          choices: [
            { id: 'diff-word', label: 'Madd and Hamza in different words', isCorrect: true },
            { id: 'same-word', label: 'Madd and Hamza in same word', isCorrect: false },
            { id: 'sukun-follows', label: 'Madd followed by Sukun', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.4: Madda Lazim (Obligatory Madd)
    {
      id: 'tajweed-madda-lazim',
      title: 'Madda Lazim (Obligatory Elongation)',
      category: 'tajweed',
      description: 'Madda Lazim occurs when a Madd letter (ا, و, ي) is followed by Sukun (ْ) or Shadda (ّ) within the same word. This is the longest elongation, held for 6 counts.',
      objectives: [
        'Recognize Madd followed by Sukun or Shadda.',
        'Apply 6-count elongation correctly.',
        'Distinguish from other Madd types.'
      ],
      practiceWords: ['الضُّحَىٰ', 'الْآخِرَة', 'لَدَيْهِ', 'يُخَرِّج', 'الصِّرَاط'],
      exercises: [
        // Concept
        {
          id: 'madd-lazim-concept',
          prompt: 'What is Madda Lazim?',
          promptArabic: 'الضُّحَىٰ',
          promptNote: 'Alif Madd (ا) followed by Sukun (ىٰ).',
          choices: [
            { id: '6-counts', label: 'Obligatory Madd - 6 counts (longest)', isCorrect: true },
            { id: '2-counts', label: 'Natural Madd - 2 counts', isCorrect: false },
            { id: '4-5-counts', label: 'Connected/Separated Madd - 4-5 counts', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-concept-2',
          prompt: 'What causes Madda Lazim?',
          promptArabic: '—',
          promptNote: 'Select the condition that creates Madda Lazim.',
          choices: [
            { id: 'sukun-or-shadda', label: 'Madd followed by Sukun or Shadda', isCorrect: true },
            { id: 'hamza-same-word', label: 'Hamza and Madd in same word', isCorrect: false },
            { id: 'hamza-diff-word', label: 'Hamza and Madd in different words', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'madd-lazim-read-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'الضُّحَىٰ',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'adduhaa', label: 'Ad-Duhaaa (very long aa)', isCorrect: true },
            { id: 'adduha', label: 'Ad-duhaa', isCorrect: false },
            { id: 'adduh', label: 'Ad-duh', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْآخِرَة',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'al-aakhirah', label: 'Al-aaaakhirah (very long aa)', isCorrect: true },
            { id: 'al-aakirah', label: 'Al-aakhirah', isCorrect: false },
            { id: 'al-akhirah', label: 'Al-akhirah', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'لَدَيْهِ',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'ladayhi', label: 'Ladayyyhi (very long ii)', isCorrect: true },
            { id: 'ladayhi', label: 'Ladayhi', isCorrect: false },
            { id: 'laday-hi', label: 'Laday-hi', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'الصِّرَاطَ',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'assirataa', label: 'As-sirataa (very long aa)', isCorrect: true },
            { id: 'assirat', label: 'As-sirat', isCorrect: false },
            { id: 'as-siraa', label: 'As-siraa', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْقَارِئَة',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'qari-ah', label: 'Qaarii-ah (very long aa)', isCorrect: true },
            { id: 'qariah', label: 'Qariah', isCorrect: false },
            { id: 'qari', label: 'Qari', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْحَاقَة',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'haaqataa', label: 'Haaqataa (very long aa)', isCorrect: true },
            { id: 'haaqata', label: 'Haaqata', isCorrect: false },
            { id: 'haaqah', label: 'Haaqah', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'النَّبِي',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'an-nabiyy', label: 'An-nabiyy (very long ii)', isCorrect: true },
            { id: 'an-nabi', label: 'An-nabi', isCorrect: false },
            { id: 'an-nab', label: 'An-nab', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'يُخَرِّج',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'yukhriij', label: 'Yukhriij (very long ii)', isCorrect: true },
            { id: 'yukhrij', label: 'Yukhrij', isCorrect: false },
            { id: 'yukhrijj', label: 'Yukhrijj', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'تَنَاوِين',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'tanawiin', label: 'Tanawiin (very long aa)', isCorrect: true },
            { id: 'tanawin', label: 'Tanawin', isCorrect: false },
            { id: 'tanawwin', label: 'Tanawwin', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْمَأْوَى',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'al-maaa-wa', label: 'Al-maaawaa (very long aa)', isCorrect: true },
            { id: 'al-maw-a', label: 'Al-maw\'a', isCorrect: false },
            { id: 'al-ma-wa', label: 'Al-ma\'wa', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-11',
          prompt: 'Select the correct reading:',
          promptArabic: 'جَهَنَّم',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'jahannamaa', label: 'Jahannamaaa (very long aa)', isCorrect: true },
            { id: 'jahannam', label: 'Jahannam', isCorrect: false },
            { id: 'jahannama', label: 'Jahannama', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-read-12',
          prompt: 'Select the correct reading:',
          promptArabic: 'حَاقَّة',
          promptNote: 'Hold the Madd for 6 counts.',
          choices: [
            { id: 'haaqqah', label: 'Haaaqqah (very long aa)', isCorrect: true },
            { id: 'haqqah', label: 'Haqqah', isCorrect: false },
            { id: 'haa-qah', label: 'Haaa-qah', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'madd-lazim-id-1',
          prompt: 'Identify the Madd type:',
          promptArabic: 'الضُّحَىٰ',
          choices: [
            { id: 'lazim', label: 'Madda Lazim (6 counts)', isCorrect: true },
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: false },
            { id: 'muttasil', label: 'Madda Muttasil (4-5 counts)', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-id-2',
          prompt: 'Identify the Madd type:',
          promptArabic: 'لَدَيْهِ',
          choices: [
            { id: 'lazim', label: 'Madda Lazim (6 counts)', isCorrect: true },
            { id: 'munfasil', label: 'Madda Munfasil (4-5 counts)', isCorrect: false },
            { id: 'asli', label: 'Madda Asli (2 counts)', isCorrect: false }
          ]
        },
        {
          id: 'madd-lazim-id-3',
          prompt: 'Why is this Madda Lazim?',
          promptArabic: 'الْحَيَاة',
          choices: [
            { id: 'sukon-or-shadda', label: 'Madd followed by Sukun or Shadda', isCorrect: true },
            { id: 'hamza-same-word', label: 'Hamza and Madd in same word', isCorrect: false },
            { id: 'natural', label: 'It is a natural vowel', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.5: Ghunnah - Nun and Meem Mushaddadatayn
    {
      id: 'tajweed-ghunnah-mushaddad',
      title: 'Ghunnah: Nun & Meem Mushaddadatayn',
      category: 'tajweed',
      description: 'Ghunnah is a nasal sound produced from the nose. When Nun (ن) or Meem (م) have Shadda (ّ) - called *Nun/Meem Mushaddadah* - they are pronounced with Ghunnah held for 2 counts.',
      objectives: [
        'Recognize Nun and Meem with Shadda.',
        'Apply Ghunnah for exactly 2 counts.',
        'Understand the difference between regular and Ghunnah pronunciation.'
      ],
      practiceWords: ['إِنَّ', 'إِنَّا', 'حَتَّىٰ', 'إِنَّهُ', 'كَذَّبَت', 'إِنَّمَا', 'أَمَّا', 'رَحْمَة', 'عَظِيم'],
      exercises: [
        // Concept: What is Ghunnah?
        {
          id: 'ghunnah-concept-1',
          prompt: 'What is Ghunnah?',
          promptArabic: 'إِنَّ',
          promptNote: 'Nun with Shadda (نّ).',
          choices: [
            { id: 'nasal-2', label: 'Nasal sound (Ghunnah) for 2 counts', isCorrect: true },
            { id: 'clear', label: 'Clear pronunciation without nasal', isCorrect: false },
            { id: 'stop', label: 'Stop and pause', isCorrect: false }
          ]
        },
        {
          id: 'ghunnah-concept-2',
          prompt: 'Which letters have Ghunnah when Mushaddad?',
          promptArabic: '—',
          choices: [
            { id: 'nun-meem', label: 'Only Nun (ن) and Meem (م)', isCorrect: true },
            { id: 'all-letters', label: 'All letters with Shadda', isCorrect: false },
            { id: 'only-nun', label: 'Only Nun (ن)', isCorrect: false }
          ]
        },
        // Nun Mushaddadah Practice
        {
          id: 'nun-mushaddad-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّ',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'inna', label: 'Inna (with Ghunnah)', isCorrect: true },
            { id: 'ina', label: 'Ina (no Ghunnah)', isCorrect: false },
            { id: 'inn', label: 'Inn', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّا',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'innaa', label: 'Innaa (with Ghunnah)', isCorrect: true },
            { id: 'inaa', label: 'Inaa (no Ghunnah)', isCorrect: false },
            { id: 'innah', label: 'Innah', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'حَتَّىٰ',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'hatta', label: 'Hatta (with Ghunnah)', isCorrect: true },
            { id: 'hata', label: 'Hata (no Ghunnah)', isCorrect: false },
            { id: 'hataa', label: 'Hataa', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّهُ',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'innahu', label: 'Innahu (with Ghunnah)', isCorrect: true },
            { id: 'inahu', label: 'Inahu (no Ghunnah)', isCorrect: false },
            { id: 'innah', label: 'Innah', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'كَذَّبَت',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'kathabat', label: 'Kathabat (with Ghunnah)', isCorrect: true },
            { id: 'kazabat', label: 'Kazabat (no Ghunnah)', isCorrect: false },
            { id: 'kazab', label: 'Kazab', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَنِّع',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'yanna-u', label: 'Yanna\'u (with Ghunnah)', isCorrect: true },
            { id: 'yana-u', label: 'Yana\'u (no Ghunnah)', isCorrect: false },
            { id: 'yani-u', label: 'Yani\'u', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'فَإِنَّ',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'fainna', label: 'Fainna (with Ghunnah)', isCorrect: true },
            { id: 'faina', label: 'Faina (no Ghunnah)', isCorrect: false },
            { id: 'fain', label: 'Fain', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'لَنَسْفَعًا',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'lanas-fa-an', label: 'Lanasfa\'an (with Ghunnah)', isCorrect: true },
            { id: 'lasafaan', label: 'Lasafaan (no Ghunnah)', isCorrect: false },
            { id: 'lanasfan', label: 'Lanasfan', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّا أَعْطَيْنَاك',
          promptNote: 'Apply Ghunnah on both Nun letters.',
          choices: [
            { id: 'innaa-ataynaka', label: 'Innaa ataynaka (double Ghunnah)', isCorrect: true },
            { id: 'inaa-ataynaka', label: 'Inaaa ataynaka', isCorrect: false },
            { id: 'inna-ataynaka', label: 'Inna ataynaka', isCorrect: false }
          ]
        },
        {
          id: 'nun-mushaddad-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّهُمْ هُمُ',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'innahum-humu', label: 'Innahum humu (with Ghunnah)', isCorrect: true },
            { id: 'inahum-humu', label: 'Inahum humu', isCorrect: false },
            { id: 'innah-humu', label: 'Innah humu', isCorrect: false }
          ]
        },
        // Meem Mushaddadah Practice
        {
          id: 'meem-mushaddad-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'إِنَّمَا',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'innama', label: 'Innama (with Ghunnah)', isCorrect: true },
            { id: 'inama', label: 'Inama (no Ghunnah)', isCorrect: false },
            { id: 'innam', label: 'Innam', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَمَّا',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'amma', label: 'Amma (with Ghunnah)', isCorrect: true },
            { id: 'ama', label: 'Ama (no Ghunnah)', isCorrect: false },
            { id: 'am', label: 'Am', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'حَتَّمْنَا',
          promptNote: 'Apply Ghunnah for 2 counts on Meem and Nun.',
          choices: [
            { id: 'hattamna', label: 'Hattamna (double Ghunnah)', isCorrect: true },
            { id: 'hatamna', label: 'Hatamna', isCorrect: false },
            { id: 'hatmana', label: 'Hatmana', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'يُمَدُّون',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'yamaddoon', label: 'Yamaddoon (with Ghunnah)', isCorrect: true },
            { id: 'yamadoon', label: 'Yamadoon (no Ghunnah)', isCorrect: false },
            { id: 'yamudun', label: 'Yamudun', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'رَحْمَة',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'rahmah', label: 'Rahmah (with Ghunnah)', isCorrect: true },
            { id: 'rahah', label: 'Rahah (no Ghunnah)', isCorrect: false },
            { id: 'raha', label: 'Raha', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَظِيم',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'adheem', label: 'Adheem (with Ghunnah)', isCorrect: true },
            { id: 'adhiam', label: 'Adhiam (no Ghunnah)', isCorrect: false },
            { id: 'azim', label: 'Azim', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'كَرِيم',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'kareem', label: 'Kareem (with Ghunnah)', isCorrect: true },
            { id: 'kariim', label: 'Kariim (no Ghunnah)', isCorrect: false },
            { id: 'karim', label: 'Karim', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'رَحِيم',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'raheem', label: 'Raheem (with Ghunnah)', isCorrect: true },
            { id: 'rahiim', label: 'Rahiim (no Ghunnah)', isCorrect: false },
            { id: 'rahim', label: 'Rahim', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'أُمَّة',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'ummah', label: 'Ummah (with Ghunnah)', isCorrect: true },
            { id: 'umah', label: 'Umah (no Ghunnah)', isCorrect: false },
            { id: 'um-mah', label: 'Um-mah', isCorrect: false }
          ]
        },
        {
          id: 'meem-mushaddad-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'يُمِنُون',
          promptNote: 'Apply Ghunnah for 2 counts.',
          choices: [
            { id: 'yuminon', label: 'Yuminon (with Ghunnah)', isCorrect: true },
            { id: 'yuminon', label: 'Yuminon (no Ghunnah)', isCorrect: false },
            { id: 'yummun', label: 'Yummun', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'ghunnah-id-1',
          prompt: 'Identify the rule:',
          promptArabic: 'إِنَّ',
          choices: [
            { id: 'ghunnah-nun', label: 'Ghunnah - Nun Mushaddadah', isCorrect: true },
            { id: 'ghunnah-meem', label: 'Ghunnah - Meem Mushaddadah', isCorrect: false },
            { id: 'no-ghunnah', label: 'No Ghunnah', isCorrect: false }
          ]
        },
        {
          id: 'ghunnah-id-2',
          prompt: 'Identify the rule:',
          promptArabic: 'أَمَّا',
          choices: [
            { id: 'ghunnah-meem', label: 'Ghunnah - Meem Mushaddadah', isCorrect: true },
            { id: 'ghunnah-nun', label: 'Ghunnah - Nun Mushaddadah', isCorrect: false },
            { id: 'no-ghunnah', label: 'No Ghunnah', isCorrect: false }
          ]
        },
        {
          id: 'ghunnah-id-3',
          prompt: 'How many Ghunnah sounds here?',
          promptArabic: 'إِنَّمَا',
          choices: [
            { id: 'two', label: 'Two (Nun and Meem)', isCorrect: true },
            { id: 'one', label: 'One', isCorrect: false },
            { id: 'none', label: 'None', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.6: Meem Sakin - Ikhfa Shafawi
    {
      id: 'tajweed-meem-sakin-ikhfa',
      title: 'Meem Sakin: Ikhfa Shafawi',
      category: 'tajweed',
      description: 'Ikhfa Shafawi occurs when a Meem with Sukun (مْ) is followed by the letter Ba (ب). The Meem is hidden and pronounced with Ghunnah (nasal sound) for 2 counts, but WITHOUT clearly saying the Meem.',
      objectives: [
        'Recognize Meem Sakin followed by Ba.',
        'Apply Ikhfa Shafawi with Ghunnah.',
        'Understand the difference from Izhar and Idgham.'
      ],
      practiceWords: ['أَعْوذُ بِ', 'هُمْ بِهِ', 'عَلَيْهِمُ بَيِّنَات', 'أَنْتُمْ بِه', 'يُرِيدُ بِهِم'],
      exercises: [
        // Concept
        {
          id: 'ikhfa-shafawi-concept',
          prompt: 'What is Ikhfa Shafawi?',
          promptArabic: 'أَعْوذُ بِ',
          promptNote: 'Meem Sakin (مْ) followed by Ba (ب).',
          choices: [
            { id: 'ikhfa', label: 'Hide Meem, pronounce Ghunnah (2 counts)', isCorrect: true },
            { id: 'izhar', label: 'Pronounce Meem clearly', isCorrect: false },
            { id: 'idgham', label: 'Merge into next letter', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-concept-2',
          prompt: `When does Ikhfa Shafawi occur?`,
          promptArabic: '—',
          promptNote: 'Select the correct condition.',
          choices: [
            { id: 'meem-ba', label: 'Meem Sakin followed by Ba', isCorrect: true },
            { id: 'meem-meem', label: 'Meem Sakin followed by Meem', isCorrect: false },
            { id: 'meem-other', label: 'Meem Sakin followed by other letters', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'ikhfa-shafawi-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَعُوذُ بِاللَّه',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'auzu-billah', label: 'A\'udhu billah (Ghunnah, no clear Meem)', isCorrect: true },
            { id: 'auzu-m-billah', label: 'A\'udhu m-billah (clear Meem)', isCorrect: false },
            { id: 'auzu-billah', label: 'A\'uzu billah', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمْ بِهِ',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'hum-bihi', label: 'Hum bihi (Ghunnah)', isCorrect: true },
            { id: 'hum-m-bihi', label: 'Hum m-bihi', isCorrect: false },
            { id: 'hum-bi', label: 'Hum bi', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'يُرِيدُ بِهِم',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'yuridu-bihim', label: 'Yuridu bihim (Ghunnah)', isCorrect: true },
            { id: 'yuridu-m-bihim', label: 'Yuridu m-bihim', isCorrect: false },
            { id: 'yuridu-bihmi', label: 'Yuridu bihmi', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَنْتُمْ بِه',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'antum-bihi', label: 'Antum bihi (Ghunnah)', isCorrect: true },
            { id: 'antum-m-bihi', label: 'Antum m-bihi', isCorrect: false },
            { id: 'antum-bi', label: 'Antum bi', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمْ بَيْنَ',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'hum-bayna', label: 'Hum bayna (Ghunnah)', isCorrect: true },
            { id: 'hum-m-bayna', label: 'Hum m-bayna', isCorrect: false },
            { id: 'hum-bayn', label: 'Hum bayn', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَلَيْهِمُ بَيِّنَات',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'alayhimu-bayyinaat', label: 'Alayhimu bayyinaat (Ghunnah)', isCorrect: true },
            { id: 'alayhimu-m-bayyinaat', label: 'Alayhimu m-bayyinaat', isCorrect: false },
            { id: 'alayhi-bayyinaat', label: 'Alayhi bayyinaat', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَرْسَلْنَاكَ بِالْحَق',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'arsalnaka-bilhaqq', label: 'Arsalnaka bilhaqq (Ghunnah)', isCorrect: true },
            { id: 'arsalnaka-m-bilhaqq', label: 'Arsalnaka m-bilhaqq', isCorrect: false },
            { id: 'arsalnaka-bil', label: 'Arsalnaka bil', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَخْرُجْ بُهْرُمَان',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'yakhruj-buhruman', label: 'Yakhruj buhruman (Ghunnah)', isCorrect: true },
            { id: 'yakhruj-m-buhruman', label: 'Yakhruj m-buhruman', isCorrect: false },
            { id: 'yakhru-buhruman', label: 'Yakhru buhruman', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَبْعَثُهُم بَعْد',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'yab-athuhum-bad', label: 'Yab\'athuhum bad (Ghunnah)', isCorrect: true },
            { id: 'yab-athuhum-m-bad', label: 'Yab\'athuhum m-bad', isCorrect: false },
            { id: 'yabathu-bad', label: 'Yabathu bad', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'تَرْبُصُونَ بِنَا',
          promptNote: 'Apply Ikhfa Shafawi.',
          choices: [
            { id: 'tarbusbuna-binaa', label: 'Tarbusbuna binaa (Ghunnah)', isCorrect: true },
            { id: 'tarbusbuna-m-binaa', label: 'Tarbusbuna m-binaa', isCorrect: false },
            { id: 'tarbus-binana', label: 'Tarbus binana', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'ikhfa-shafawi-id-1',
          prompt: 'Identify the rule:',
          promptArabic: 'هُمْ بِهِ',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa Shafawi', isCorrect: true },
            { id: 'idgham', label: 'Idgham Shafawi', isCorrect: false },
            { id: 'izhar', label: 'Izhar Shafawi', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-id-2',
          prompt: 'Identify the rule:',
          promptArabic: 'عَلَيْهِمُ بَيِّنَات',
          choices: [
            { id: 'ikhfa', label: 'Ikhfa Shafawi', isCorrect: true },
            { id: 'idgham', label: 'Idgham Shafawi', isCorrect: false },
            { id: 'izhar', label: 'Izhar Shafawi', isCorrect: false }
          ]
        },
        {
          id: 'ikhfa-shafawi-id-3',
          prompt: 'Why Ikhfa Shafawi here?',
          promptArabic: 'أَعُوذُ بِاللَّه',
          choices: [
            { id: 'meem-sakin-ba', label: 'Meem Sakin followed by Ba', isCorrect: true },
            { id: 'meem-sakin-meem', label: 'Meem Sakin followed by Meem', isCorrect: false },
            { id: 'meem-sakin-other', label: 'Meem Sakin followed by other', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.7: Meem Sakin - Idgham Shafawi
    {
      id: 'tajweed-meem-sakin-idgham',
      title: 'Meem Sakin: Idgham Shafawi',
      category: 'tajweed',
      description: 'Idgham Shafawi occurs when a Meem with Sukun (مْ) is followed by another Meem (م). The first Meem is merged into the second Meem, and pronounced with Ghunnah for 2 counts.',
      objectives: [
        'Recognize Meem Sakin followed by Meem.',
        'Apply Idgham Shafawi (merge + Ghunnah).',
        'Distinguish from Ikhfa and Izhar Shafawi.'
      ],
      practiceWords: ['هُمَ الْمُؤْمِنُونَ', 'مِنْ مَال', 'أَنْتُمْ مُسْلِمُونَ', 'لَكُمْ مَثَل', 'هُمْ مُصْلِحُونَ'],
      exercises: [
        // Concept
        {
          id: 'idgham-shafawi-concept',
          prompt: 'What is Idgham Shafawi?',
          promptArabic: 'هُمَ الْمُؤْمِنُونَ',
          promptNote: 'Meem Sakin (مْ) followed by Meem (م).',
          choices: [
            { id: 'idgham', label: 'Merge Meems with Ghunnah (2 counts)', isCorrect: true },
            { id: 'izhar', label: 'Pronounce both Meems separately', isCorrect: false },
            { id: 'ikhfa', label: 'Hide the sound', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-concept-2',
          prompt: 'When does Idgham Shafawi occur?',
          promptArabic: '—',
          promptNote: 'Select the correct condition.',
          choices: [
            { id: 'meem-meem', label: 'Meem Sakin followed by Meem', isCorrect: true },
            { id: 'meem-ba', label: 'Meem Sakin followed by Ba', isCorrect: false },
            { id: 'meem-other', label: 'Meem Sakin followed by other letters', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'idgham-shafawi-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمَ الْمُؤْمِنُونَ',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'humul-muminoon', label: 'Humul-muminoon (merged + Ghunnah)', isCorrect: true },
            { id: 'hum-muminoon', label: 'Hum muminoon', isCorrect: false },
            { id: 'humu-muminoon', label: 'Humu muminoon', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'مِنْ مَال',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'mim-mal', label: 'Mim-maal (merged + Ghunnah)', isCorrect: true },
            { id: 'min-mal', label: 'Min-maal', isCorrect: false },
            { id: 'mi-mal', label: 'Mi-maal', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَنْتُمْ مُسْلِمُونَ',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'antum-muslimoon', label: 'Antum muslimoon (merged + Ghunnah)', isCorrect: true },
            { id: 'antum-muslimoon', label: 'Antum-muslimoon', isCorrect: false },
            { id: 'antu-muslimoon', label: 'Antu muslimoon', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'لَكُمْ مَثَل',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'lakum-mathal', label: 'Lakum mathal (merged + Ghunnah)', isCorrect: true },
            { id: 'lakum-mathal', label: 'Lakum-mathal', isCorrect: false },
            { id: 'laku-mathal', label: 'Laku mathal', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمْ مُصْلِحُونَ',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'hum-muslihoon', label: 'Hum muslihoon (merged + Ghunnah)', isCorrect: true },
            { id: 'hum-muslihoon', label: 'Hum-muslihoon', isCorrect: false },
            { id: 'humu-muslihoon', label: 'Humu muslihoon', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'مِنْ مُوسِىٰ',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'mim-moosa', label: 'Mim-Moosaa (merged + Ghunnah)', isCorrect: true },
            { id: 'min-moosa', label: 'Min-Moosaa', isCorrect: false },
            { id: 'mi-moosa', label: 'Mi-Moosaa', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'مِنْ مَّا',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'mim-maa', label: 'Mim-maa (merged + Ghunnah)', isCorrect: true },
            { id: 'min-maa', label: 'Min-maa', isCorrect: false },
            { id: 'min-ma', label: 'Min-ma', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَلَيْكُمْ مَعْرُوف',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'alaykum-maroof', label: 'Alaykum maroof (merged + Ghunnah)', isCorrect: true },
            { id: 'alaykum-maroof', label: 'Alaykum-maroof', isCorrect: false },
            { id: 'alayku-maroof', label: 'Alayku maroof', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'مِنْ مُنْكَر',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'mim-munkar', label: 'Mim-munkar (merged + Ghunnah)', isCorrect: true },
            { id: 'min-munkar', label: 'Min-munkar', isCorrect: false },
            { id: 'min-munkar', label: 'Min-munkar', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمْ مُخْلِصُونَ',
          promptNote: 'Apply Idgham Shafawi.',
          choices: [
            { id: 'hum-mukhlisoon', label: 'Hum mukhlisoon (merged + Ghunnah)', isCorrect: true },
            { id: 'hum-mukhlisoon', label: 'Hum-mukhlisoon', isCorrect: false },
            { id: 'humu-mukhlisoon', label: 'Humu mukhlisoon', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'idgham-shafawi-id-1',
          prompt: 'Identify the rule:',
          promptArabic: 'هُمَ الْمُؤْمِنُونَ',
          choices: [
            { id: 'idgham', label: 'Idgham Shafawi', isCorrect: true },
            { id: 'ikhfa', label: 'Ikhfa Shafawi', isCorrect: false },
            { id: 'izhar', label: 'Izhar Shafawi', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-id-2',
          prompt: 'Identify the rule:',
          promptArabic: 'مِنْ مَال',
          choices: [
            { id: 'idgham', label: 'Idgham Shafawi', isCorrect: true },
            { id: 'izhar', label: 'Izhar Shafawi', isCorrect: false },
            { id: 'ikhfa', label: 'Ikhfa Shafawi', isCorrect: false }
          ]
        },
        {
          id: 'idgham-shafawi-id-3',
          prompt: 'Why Idgham Shafawi here?',
          promptArabic: 'أَنْتُمْ مُسْلِمُونَ',
          choices: [
            { id: 'meem-sakin-meem', label: 'Meem Sakin followed by Meem', isCorrect: true },
            { id: 'meem-sakin-ba', label: 'Meem Sakin followed by Ba', isCorrect: false },
            { id: 'meem-sakin-other', label: 'Meem Sakin followed by other', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.8: Meem Sakin - Izhar Shafawi
    {
      id: 'tajweed-meem-sakin-izhar',
      title: 'Meem Sakin: Izhar Shafawi',
      category: 'tajweed',
      description: 'Izhar Shafawi occurs when a Meem with Sukun (مْ) is followed by any letter other than Ba (ب) or Meem (م). The Meem is pronounced clearly without Ghunnah.',
      objectives: [
        'Recognize Meem Sakin followed by other letters.',
        'Apply Izhar Shafawi (clear pronunciation).',
        'Distinguish from Ikhfa and Idgham Shafawi.'
      ],
      practiceWords: ['أَمْ عَلِم', 'أَمْ لَمْ', 'عَلَيْهِمْ ذِكْرٌ', 'أَنْعَمْتَ', 'هُمْ فِي', 'يَمْحَقُ'],
      exercises: [
        // Concept
        {
          id: 'izhar-shafawi-concept',
          prompt: 'What is Izhar Shafawi?',
          promptArabic: 'أَمْ عَلِم',
          promptNote: 'Meem Sakin (مْ) followed by Ain (not Ba or Meem).',
          choices: [
            { id: 'izhar', label: 'Clear pronunciation, no Ghunnah', isCorrect: true },
            { id: 'ikhfa', label: 'Hidden with Ghunnah', isCorrect: false },
            { id: 'idgham', label: 'Merged with Ghunnah', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-concept-2',
          prompt: 'When does Izhar Shafawi occur?',
          promptArabic: '—',
          promptNote: 'Select the correct condition.',
          choices: [
            { id: 'meem-other', label: 'Meem Sakin + letters other than Ba/Meem', isCorrect: true },
            { id: 'meem-ba', label: 'Meem Sakin followed by Ba', isCorrect: false },
            { id: 'meem-meem', label: 'Meem Sakin followed by Meem', isCorrect: false }
          ]
        },
        // Reading exercises
        {
          id: 'izhar-shafawi-1',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَمْ عَلِم',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'am-alima', label: 'Am alima (clear Meem, no Ghunnah)', isCorrect: true },
            { id: 'ammalima', label: 'Ammalima (merged)', isCorrect: false },
            { id: 'am-alima', label: 'Am alima (with Ghunnah)', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-2',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَمْ لَمْ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'am-lam', label: 'Am lam (clear Meem, no Ghunnah)', isCorrect: true },
            { id: 'ammalamm', label: 'Ammalamm (merged)', isCorrect: false },
            { id: 'amlam', label: 'Amlam', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-3',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَلَيْهِمْ ذِكْرٌ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'alayhim-zikr', label: 'Alayhim zikr (clear Meem)', isCorrect: true },
            { id: 'alayhi-zikr', label: 'Alayhi zikr', isCorrect: false },
            { id: 'alayhim-zikr', label: 'Alayhim zikr (Ghunnah)', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-4',
          prompt: 'Select the correct reading:',
          promptArabic: 'أَنْعَمْتَ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'an-amta', label: 'An-amta (clear Meem)', isCorrect: true },
            { id: 'an-amta', label: 'An\'amta (merged)', isCorrect: false },
            { id: 'annamta', label: 'Annamta', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمْ فِي',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'hum-fi', label: 'Hum fi (clear Meem)', isCorrect: true },
            { id: 'humufi', label: 'Humufi (merged)', isCorrect: false },
            { id: 'hum-fi', label: 'Hum fi (Ghunnah)', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-6',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَمْحَقُ اللَّه',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'yamhaqu-allah', label: 'Yamhaqu Allah (clear Meem)', isCorrect: true },
            { id: 'yahaqu-allah', label: 'Yahaqu Allah', isCorrect: false },
            { id: 'yamhaqullah', label: 'Yamhaqullah', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-7',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَنْهُمْ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'anhumu', label: 'Anhumu (clear Meem)', isCorrect: true },
            { id: 'annahumu', label: 'Annhumu', isCorrect: false },
            { id: 'an-hum', label: 'An-hum', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-8',
          prompt: 'Select the correct reading:',
          promptArabic: 'هُمْثَلاثَة',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'humthalathah', label: 'Humthalathah (clear Meem)', isCorrect: true },
            { id: 'humthalatha', label: 'Humthalatha', isCorrect: false },
            { id: 'humthalata', label: 'Humthalata', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-9',
          prompt: 'Select the correct reading:',
          promptArabic: 'يَمْحَقُ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'yamhaqu', label: 'Yamhaqu (clear Meem)', isCorrect: true },
            { id: 'yahaqu', label: 'Yahaqu', isCorrect: false },
            { id: 'yamha-qu', label: 'Yamha-qu', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-10',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَلَيْهِمْقِطْنٌ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'alayhim-qitn', label: 'Alayhim qitn (clear Meem)', isCorrect: true },
            { id: 'alayhi-qitn', label: 'Alayhi qitn', isCorrect: false },
            { id: 'alayhim-qit', label: 'Alayhim qit', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-11',
          prompt: 'Select the correct reading:',
          promptArabic: 'عَنْهُمْجَنَّات',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'anhumu-jannaat', label: 'Anhumu jannaat (clear Meem)', isCorrect: true },
            { id: 'annahumu-jannaat', label: 'Annhumu jannaat', isCorrect: false },
            { id: 'anhu-jannaat', label: 'Anhu jannaat', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-12',
          prompt: 'Select the correct reading:',
          promptArabic: 'لَدَيْهِمْعِلْمٌ',
          promptNote: 'Apply Izhar Shafawi.',
          choices: [
            { id: 'ladayhim-ilm', label: 'Ladayhim ilm (clear Meem)', isCorrect: true },
            { id: 'ladayhi-ilm', label: 'Ladayhi ilm', isCorrect: false },
            { id: 'ladayhim-ilm', label: 'Ladayhim ilm (Ghunnah)', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'izhar-shafawi-id-1',
          prompt: 'Identify the rule:',
          promptArabic: 'أَمْ عَلِم',
          choices: [
            { id: 'izhar', label: 'Izhar Shafawi', isCorrect: true },
            { id: 'ikhfa', label: 'Ikhfa Shafawi', isCorrect: false },
            { id: 'idgham', label: 'Idgham Shafawi', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-id-2',
          prompt: 'Identify the rule:',
          promptArabic: 'هُمْ فِي',
          choices: [
            { id: 'izhar', label: 'Izhar Shafawi', isCorrect: true },
            { id: 'idgham', label: 'Idgham Shafawi', isCorrect: false },
            { id: 'ikhfa', label: 'Ikhfa Shafawi', isCorrect: false }
          ]
        },
        {
          id: 'izhar-shafawi-id-3',
          prompt: 'Why Izhar Shafawi here?',
          promptArabic: 'عَلَيْهِمْ ذِكْرٌ',
          choices: [
            { id: 'meem-other', label: 'Meem Sakin + other letter (Dhal)', isCorrect: true },
            { id: 'meem-ba', label: 'Meem Sakin + Ba', isCorrect: false },
            { id: 'meem-meem', label: 'Meem Sakin + Meem', isCorrect: false }
          ]
        }
      ]
    },

    // Stage 6.9: Lam Fihil - Moon and Sun Letters (Al-)
    {
      id: 'tajweed-lam-fihil',
      title: 'Lam Fihil: Moon & Sun Letters in "Al-"',
      category: 'tajweed',
      description: 'Lam Fihil rules apply to the letter Lam (ل) in the definite article "Al-" (ال). With Moon letters, Lam is pronounced clearly. With Sun letters, Lam is silent/merged into the following letter.',
      objectives: [
        'Memorize the 14 Moon letters.',
        'Memorize the 14 Sun letters.',
        'Apply the correct pronunciation for "Al-" with any letter.'
      ],
      practiceWords: ['الْقَمَر', 'الشَّمْس', 'الْحَمْدُ', 'الرَّحْمَن', 'النَّاس', 'الْبَيْت'],
      exercises: [
        // Concept: What are Moon and Sun letters?
        {
          id: 'lam-fihil-concept-1',
          prompt: 'What happens to Lam in "Al-" with Moon letters?',
          promptArabic: 'الْقَمَر',
          promptNote: 'Qaf is a Moon letter.',
          choices: [
            { id: 'pronounced', label: 'Lam is PRONOUNCED clearly', isCorrect: true },
            { id: 'silent', label: 'Lam is SILENT/merged', isCorrect: false },
            { id: 'ghunnah', label: 'Lam has Ghunnah', isCorrect: false }
          ]
        },
        {
          id: 'lam-fihil-concept-2',
          prompt: 'What happens to Lam in "Al-" with Sun letters?',
          promptArabic: 'الشَّمْس',
          promptNote: 'Shin is a Sun letter.',
          choices: [
            { id: 'silent', label: 'Lam is SILENT/merged into next letter', isCorrect: true },
            { id: 'pronounced', label: 'Lam is PRONOUNCED', isCorrect: false },
            { id: 'ghunnah', label: 'Lam has Ghunnah', isCorrect: false }
          ]
        },
        // Moon Letters Practice (Pronounced Lam)
        {
          id: 'moon-lam-1',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْقَمَر',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Qamar', isCorrect: true },
            { id: 'silent', label: 'Silent - Al-Qamar', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-2',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْبَيْت',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Bayt', isCorrect: true },
            { id: 'silent', label: 'Silent - Abbayt', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-3',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْجَنَّة',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Jannah', isCorrect: true },
            { id: 'silent', label: 'Silent - Aj-jannah', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-4',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْحَمْدُ',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Hamdu', isCorrect: true },
            { id: 'silent', label: 'Silent - Ahhamdu', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-5',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْخَيْر',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Khayr', isCorrect: true },
            { id: 'silent', label: 'Silent - Akh-khayr', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-6',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْعَالَمِين',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Aalameen', isCorrect: true },
            { id: 'silent', label: 'Silent - Aal-aalameen', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-7',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْفَاتِحَة',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Fatihah', isCorrect: true },
            { id: 'silent', label: 'Silent - Affatihah', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-8',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْقِيَامَة',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Qiyamah', isCorrect: true },
            { id: 'silent', label: 'Silent - Aqqiyamah', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-9',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْكَافِرُونَ',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Kafiroon', isCorrect: true },
            { id: 'silent', label: 'Silent - Ak-kafiroon', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-10',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الْمُسْلِمُونَ',
          choices: [
            { id: 'pronounced', label: 'Pronounced - Al-Muslimoon', isCorrect: true },
            { id: 'silent', label: 'Silent - Am-muslimoon', isCorrect: false }
          ]
        },
        {
          id: 'moon-lam-11',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْحَمْدُ لِلَّه',
          choices: [
            { id: 'alhamdu-lillah', label: 'Al-Hamdu lillah (pronounced Lam)', isCorrect: true },
            { id: 'ahhamdu-lillah', label: 'Ahhhamdu lillah', isCorrect: false },
            { id: 'alhamdullah', label: 'Alhamdullah', isCorrect: false }
          ]
        },
        // Sun Letters Practice (Silent Lam)
        {
          id: 'sun-lam-1',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الشَّمْس',
          choices: [
            { id: 'silent', label: 'Silent - Ash-Shams', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Shams', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-2',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'النَّاس',
          choices: [
            { id: 'silent', label: 'Silent - An-Naas', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Naas', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-3',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الرَّحْمَن',
          choices: [
            { id: 'silent', label: 'Silent - Ar-Rahman', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Rahman', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-4',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الصَّلَاة',
          choices: [
            { id: 'silent', label: 'Silent - As-Salah', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Salah', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-5',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'التَّوْبَة',
          choices: [
            { id: 'silent', label: 'Silent - At-Tawbah', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Tawbah', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-6',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الدُّعَاء',
          choices: [
            { id: 'silent', label: 'Silent - Ad-Du\'aa', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Du\'aa', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-7',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الذِّكْر',
          choices: [
            { id: 'silent', label: 'Silent - Adh-Dhikr', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Dhikr', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-8',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الزَّكَاة',
          choices: [
            { id: 'silent', label: 'Silent - Az-Zakah', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Zakah', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-9',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'السَّلَام',
          choices: [
            { id: 'silent', label: 'Silent - As-Salaam', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Salaam', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-10',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الشَّيْطَان',
          choices: [
            { id: 'silent', label: 'Silent - Ash-Shaytan', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Shaytan', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-11',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الضُّحَى',
          choices: [
            { id: 'silent', label: 'Silent - Ad-Duhaa', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Duhaa', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-12',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الظَّلَام',
          choices: [
            { id: 'silent', label: 'Silent - Adh-Zalam', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Zalam', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-13',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'الطَّرِيق',
          choices: [
            { id: 'silent', label: 'Silent - At-Tariq', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Tariq', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-14',
          prompt: 'How is the Lam pronounced?',
          promptArabic: 'النُّور',
          choices: [
            { id: 'silent', label: 'Silent - An-Nur', isCorrect: true },
            { id: 'pronounced', label: 'Pronounced - Al-Nur', isCorrect: false }
          ]
        },
        {
          id: 'sun-lam-15',
          prompt: 'Select the correct reading:',
          promptArabic: 'بِسْمِ اللَّهِ الرَّحْمَن',
          choices: [
            { id: 'bismillahi-arrirahman', label: 'Bismillaahi Ar-Rahmaan', isCorrect: true },
            { id: 'bismillah-alrahman', label: 'Bismillah Al-Rahman', isCorrect: false },
            { id: 'bismi-allahi-arrahman', label: 'Bismi Allaahi Ar-Rahman', isCorrect: false }
          ]
        },
        // Identification exercises
        {
          id: 'lam-id-1',
          prompt: 'Is this a Moon or Sun letter?',
          promptArabic: 'الْقَمَر',
          choices: [
            { id: 'moon', label: 'Moon (Qaf) - Lam is pronounced', isCorrect: true },
            { id: 'sun', label: 'Sun (Qaf) - Lam is silent', isCorrect: false }
          ]
        },
        {
          id: 'lam-id-2',
          prompt: 'Is this a Moon or Sun letter?',
          promptArabic: 'الشَّمْس',
          choices: [
            { id: 'sun', label: 'Sun (Shin) - Lam is silent', isCorrect: true },
            { id: 'moon', label: 'Moon (Shin) - Lam is pronounced', isCorrect: false }
          ]
        },
        {
          id: 'lam-id-3',
          prompt: 'Is this a Moon or Sun letter?',
          promptArabic: 'الْحَمْدُ',
          choices: [
            { id: 'moon', label: 'Moon (Haa) - Lam is pronounced', isCorrect: true },
            { id: 'sun', label: 'Sun (Haa) - Lam is silent', isCorrect: false }
          ]
        },
        {
          id: 'lam-id-4',
          prompt: 'Is this a Moon or Sun letter?',
          promptArabic: 'الرَّحْمَن',
          choices: [
            { id: 'sun', label: 'Sun (Raa) - Lam is silent', isCorrect: true },
            { id: 'moon', label: 'Moon (Raa) - Lam is pronounced', isCorrect: false }
          ]
        },
        {
          id: 'lam-id-5',
          prompt: 'Select the correct reading:',
          promptArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِين',
          promptNote: 'Apply Moon and Sun letter rules.',
          choices: [
            { id: 'alhamdu-lillahi-rabbil-alameen', label: 'Al-Hamdu lillaahi Rabbil-aalameen', isCorrect: true },
            { id: 'alhamdu-lillahi-rabb-al-alamin', label: 'Al-Hamdu lillaahi Rabb al-aalamin', isCorrect: false },
            { id: 'ahhamdu-lillahi-rabbil-alamin', label: 'Ahhhamdu lillaahi Rabbil-aalamin', isCorrect: false }
          ]
        }
      ]
    },
    // Stage 7: Tanwin words
    {
      id: 'combo-tanwin-words',
      title: 'Words with Tanwin',
      category: 'tajweed',
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
      audioUrl: `https://read-arabic-with-ease-backend.onrender.com/api/audio/quran/${surah.number}/${verse.verseNumber}`,
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
    description: 'Applied reading with real Qur\'anic verses — from Surah Al-Jinn (72) to An-Nas (114), pure Arabic without transliteration.',
    focus: 'Verse reading practice.',
    colorClass: 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/40',
    lessons: buildQuranicReadingLessons(),
  },
  {
    id: 'waqf-rules',
    title: 'Waqf (Stoppage Signs)',
    stageLabel: 'Expert',
    description: 'Master the Quranic stoppage symbols that indicate where to pause during recitation — essential for correct meaning.',
    focus: 'Stop and continue signs.',
    colorClass: 'from-orange-500/20 to-orange-500/5 border-orange-500/40',
    lessons: buildWaqfLessons(),
  },
]
