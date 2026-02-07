// Qur'anic verses from Surah An-Nas (114) to Al-Mulk (67) for reading practice
// Organized by surah, from shortest to longest for progressive difficulty

export interface Verse {
  surahNumber: number
  verseNumber: number
  arabic: string
}

export interface Surah {
  number: number
  nameArabic: string
  verses: Verse[]
}

export const QURANIC_SURAHS: Surah[] = [
  {
    number: 114,
    nameArabic: 'سُورَةُ النَّاسِ',
    verses: [
      { surahNumber: 114, verseNumber: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
      { surahNumber: 114, verseNumber: 2, arabic: 'مَلِكِ النَّاسِ' },
      { surahNumber: 114, verseNumber: 3, arabic: 'إِلَٰهِ النَّاسِ' },
      { surahNumber: 114, verseNumber: 4, arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' },
      { surahNumber: 114, verseNumber: 5, arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ' },
      { surahNumber: 114, verseNumber: 6, arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ' },
    ],
  },
  {
    number: 113,
    nameArabic: 'سُورَةُ الْفَلَقِ',
    verses: [
      { surahNumber: 113, verseNumber: 1, arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
      { surahNumber: 113, verseNumber: 2, arabic: 'مِن شَرِّ مَا خَلَقَ' },
      { surahNumber: 113, verseNumber: 3, arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
      { surahNumber: 113, verseNumber: 4, arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ' },
      { surahNumber: 113, verseNumber: 5, arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' },
    ],
  },
  {
    number: 112,
    nameArabic: 'سُورَةُ الْإِخْلَاصِ',
    verses: [
      { surahNumber: 112, verseNumber: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { surahNumber: 112, verseNumber: 2, arabic: 'اللَّهُ الصَّمَدُ' },
      { surahNumber: 112, verseNumber: 3, arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
      { surahNumber: 112, verseNumber: 4, arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' },
    ],
  },
  {
    number: 111,
    nameArabic: 'سُورَةُ الْمَسَدِ',
    verses: [
      { surahNumber: 111, verseNumber: 1, arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ' },
      { surahNumber: 111, verseNumber: 2, arabic: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ' },
      { surahNumber: 111, verseNumber: 3, arabic: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ' },
      { surahNumber: 111, verseNumber: 4, arabic: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ' },
      { surahNumber: 111, verseNumber: 5, arabic: 'فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ' },
    ],
  },
  {
    number: 110,
    nameArabic: 'سُورَةُ النَّصْرِ',
    verses: [
      { surahNumber: 110, verseNumber: 1, arabic: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ' },
      { surahNumber: 110, verseNumber: 2, arabic: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا' },
      { surahNumber: 110, verseNumber: 3, arabic: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا' },
    ],
  },
  {
    number: 109,
    nameArabic: 'سُورَةُ الْكَافِرُونَ',
    verses: [
      { surahNumber: 109, verseNumber: 1, arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ' },
      { surahNumber: 109, verseNumber: 2, arabic: 'لَا أَعْبُدُ مَا تَعْبُدُونَ' },
      { surahNumber: 109, verseNumber: 3, arabic: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ' },
      { surahNumber: 109, verseNumber: 4, arabic: 'وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ' },
      { surahNumber: 109, verseNumber: 5, arabic: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ' },
      { surahNumber: 109, verseNumber: 6, arabic: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ' },
    ],
  },
  {
    number: 108,
    nameArabic: 'سُورَةُ الْكَوْثَرِ',
    verses: [
      { surahNumber: 108, verseNumber: 1, arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ' },
      { surahNumber: 108, verseNumber: 2, arabic: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ' },
      { surahNumber: 108, verseNumber: 3, arabic: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ' },
    ],
  },
  {
    number: 107,
    nameArabic: 'سُورَةُ الْمَاعُونِ',
    verses: [
      { surahNumber: 107, verseNumber: 1, arabic: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ' },
      { surahNumber: 107, verseNumber: 2, arabic: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ' },
      { surahNumber: 107, verseNumber: 3, arabic: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ' },
      { surahNumber: 107, verseNumber: 4, arabic: 'فَوَيْلٌ لِّلْمُصَلِّينَ' },
      { surahNumber: 107, verseNumber: 5, arabic: 'الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ' },
      { surahNumber: 107, verseNumber: 6, arabic: 'الَّذِينَ هُمْ يُرَاءُونَ' },
      { surahNumber: 107, verseNumber: 7, arabic: 'وَيَمْنَعُونَ الْمَاعُونَ' },
    ],
  },
  {
    number: 106,
    nameArabic: 'سُورَةُ قُرَيْشٍ',
    verses: [
      { surahNumber: 106, verseNumber: 1, arabic: 'لِإِيلَافِ قُرَيْشٍ' },
      { surahNumber: 106, verseNumber: 2, arabic: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ' },
      { surahNumber: 106, verseNumber: 3, arabic: 'فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ' },
      { surahNumber: 106, verseNumber: 4, arabic: 'الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ' },
    ],
  },
  {
    number: 105,
    nameArabic: 'سُورَةُ الْفِيلِ',
    verses: [
      { surahNumber: 105, verseNumber: 1, arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ' },
      { surahNumber: 105, verseNumber: 2, arabic: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ' },
      { surahNumber: 105, verseNumber: 3, arabic: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ' },
      { surahNumber: 105, verseNumber: 4, arabic: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ' },
      { surahNumber: 105, verseNumber: 5, arabic: 'فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ' },
    ],
  },
  {
    number: 104,
    nameArabic: 'سُورَةُ الْهُمَزَةِ',
    verses: [
      { surahNumber: 104, verseNumber: 1, arabic: 'وَيْلٌ لِّكُلِّ هُمَزَةٍ لُّمَزَةٍ' },
      { surahNumber: 104, verseNumber: 2, arabic: 'الَّذِي جَمَعَ مَالًا وَعَدَّدَهُ' },
      { surahNumber: 104, verseNumber: 3, arabic: 'يَحْسَبُ أَنَّ مَالَهُ أَخْلَدَهُ' },
      { surahNumber: 104, verseNumber: 4, arabic: 'كَلَّا ۖ لَيُنبَذَنَّ فِي الْحُطَمَةِ' },
      { surahNumber: 104, verseNumber: 5, arabic: 'وَمَا أَدْرَاكَ مَا الْحُطَمَةُ' },
      { surahNumber: 104, verseNumber: 6, arabic: 'نَارُ اللَّهِ الْمُوقَدَةُ' },
      { surahNumber: 104, verseNumber: 7, arabic: 'الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ' },
      { surahNumber: 104, verseNumber: 8, arabic: 'إِنَّهَا عَلَيْهِم مُّؤْصَدَةٌ' },
      { surahNumber: 104, verseNumber: 9, arabic: 'فِي عَمَدٍ مُّمَدَّدَةٍ' },
    ],
  },
  {
    number: 103,
    nameArabic: 'سُورَةُ الْعَصْرِ',
    verses: [
      { surahNumber: 103, verseNumber: 1, arabic: 'وَالْعَصْرِ' },
      { surahNumber: 103, verseNumber: 2, arabic: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ' },
      { surahNumber: 103, verseNumber: 3, arabic: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ' },
    ],
  },
  {
    number: 102,
    nameArabic: 'سُورَةُ التَّكَاثُرِ',
    verses: [
      { surahNumber: 102, verseNumber: 1, arabic: 'أَلْهَاكُمُ التَّكَاثُرُ' },
      { surahNumber: 102, verseNumber: 2, arabic: 'حَتَّىٰ زُرْتُمُ الْمَقَابِرَ' },
      { surahNumber: 102, verseNumber: 3, arabic: 'كَلَّا سَوْفَ تَعْلَمُونَ' },
      { surahNumber: 102, verseNumber: 4, arabic: 'ثُمَّ كَلَّا سَوْفَ تَعْلَمُونَ' },
      { surahNumber: 102, verseNumber: 5, arabic: 'كَلَّا لَوْ تَعْلَمُونَ عِلْمَ الْيَقِينِ' },
      { surahNumber: 102, verseNumber: 6, arabic: 'لَتَرَوُنَّ الْجَحِيمَ' },
      { surahNumber: 102, verseNumber: 7, arabic: 'ثُمَّ لَتَرَوُنَّهَا عَيْنَ الْيَقِينِ' },
      { surahNumber: 102, verseNumber: 8, arabic: 'ثُمَّ لَتُسْأَلُنَّ يَوْمَئِذٍ عَنِ النَّعِيمِ' },
    ],
  },
  {
    number: 101,
    nameArabic: 'سُورَةُ الْقَارِعَةِ',
    verses: [
      { surahNumber: 101, verseNumber: 1, arabic: 'الْقَارِعَةُ' },
      { surahNumber: 101, verseNumber: 2, arabic: 'مَا الْقَارِعَةُ' },
      { surahNumber: 101, verseNumber: 3, arabic: 'وَمَا أَدْرَاكَ مَا الْقَارِعَةُ' },
      { surahNumber: 101, verseNumber: 4, arabic: 'يَوْمَ يَكُونُ النَّاسُ كَالْفَرَاشِ الْمَبْثُوثِ' },
      { surahNumber: 101, verseNumber: 5, arabic: 'وَتَكُونُ الْجِبَالُ كَالْعِهْنِ الْمَنفُوشِ' },
      { surahNumber: 101, verseNumber: 6, arabic: 'فَأَمَّا مَن ثَقُلَتْ مَوَازِينُهُ' },
      { surahNumber: 101, verseNumber: 7, arabic: 'فَهُوَ فِي عِيشَةٍ رَّاضِيَةٍ' },
      { surahNumber: 101, verseNumber: 8, arabic: 'وَأَمَّا مَنْ خَفَّتْ مَوَازِينُهُ' },
      { surahNumber: 101, verseNumber: 9, arabic: 'فَأُمُّهُ هَاوِيَةٌ' },
      { surahNumber: 101, verseNumber: 10, arabic: 'وَمَا أَدْرَاكَ مَا هِيَهْ' },
      { surahNumber: 101, verseNumber: 11, arabic: 'نَارٌ حَامِيَةٌ' },
    ],
  },
  {
    number: 100,
    nameArabic: 'سُورَةُ الْعَادِيَاتِ',
    verses: [
      { surahNumber: 100, verseNumber: 1, arabic: 'وَالْعَادِيَاتِ ضَبْحًا' },
      { surahNumber: 100, verseNumber: 2, arabic: 'فَالْمُورِيَاتِ قَدْحًا' },
      { surahNumber: 100, verseNumber: 3, arabic: 'فَالْمُغِيرَاتِ صُبْحًا' },
      { surahNumber: 100, verseNumber: 4, arabic: 'فَأَثَرْنَ بِهِ نَقْعًا' },
      { surahNumber: 100, verseNumber: 5, arabic: 'فَوَسَطْنَ بِهِ جَمْعًا' },
      { surahNumber: 100, verseNumber: 6, arabic: 'إِنَّ الْإِنسَانَ لِرَبِّهِ لَكَنُودٌ' },
      { surahNumber: 100, verseNumber: 7, arabic: 'وَإِنَّهُ عَلَىٰ ذَٰلِكَ لَشَهِيدٌ' },
      { surahNumber: 100, verseNumber: 8, arabic: 'وَإِنَّهُ لِحُبِّ الْخَيْرِ لَشَدِيدٌ' },
      { surahNumber: 100, verseNumber: 9, arabic: 'أَفَلَا يَعْلَمُ إِذَا بُعْثِرَ مَا فِي الْقُبُورِ' },
      { surahNumber: 100, verseNumber: 10, arabic: 'وَحُصِّلَ مَا فِي الصُّدُورِ' },
      { surahNumber: 100, verseNumber: 11, arabic: 'إِنَّ رَبَّهُم بِهِمْ يَوْمَئِذٍ لَّخَبِيرٌ' },
    ],
  },
]
