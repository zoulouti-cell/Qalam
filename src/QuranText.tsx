import { useState, type ReactNode } from 'react'
import type { Lang } from './i18n'

const SURAH_NUMBER: Record<string, number> = {
  'الفاتحة': 1, 'البقرة': 2, 'ال عمران': 3, 'النساء': 4, 'المائدة': 5,
  'الانعام': 6, 'الاعراف': 7, 'الانفال': 8, 'التوبة': 9, 'يونس': 10,
  'هود': 11, 'يوسف': 12, 'الرعد': 13, 'ابراهيم': 14, 'الحجر': 15,
  'النحل': 16, 'الاسراء': 17, 'الكهف': 18, 'مريم': 19, 'طه': 20,
  'الانبياء': 21, 'الحج': 22, 'المؤمنون': 23, 'النور': 24, 'الفرقان': 25,
  'الشعراء': 26, 'النمل': 27, 'القصص': 28, 'العنكبوت': 29, 'الروم': 30,
  'لقمان': 31, 'السجدة': 32, 'الاحزاب': 33, 'سبا': 34, 'فاطر': 35,
  'يس': 36, 'الصافات': 37, 'ص': 38, 'الزمر': 39, 'غافر': 40,
  'فصلت': 41, 'الشورى': 42, 'الزخرف': 43, 'الدخان': 44, 'الجاثية': 45,
  'الاحقاف': 46, 'محمد': 47, 'الفتح': 48, 'الحجرات': 49, 'ق': 50,
  'الذاريات': 51, 'النجم': 53, 'القمر': 54, 'الرحمن': 55, 'الواقعة': 56,
  'الحديد': 57, 'المجادلة': 58, 'الحشر': 59, 'الممتحنة': 60, 'الصف': 61,
  'الجمعة': 62, 'المنافقون': 63, 'التغابن': 64, 'الطلاق': 65, 'التحريم': 66,
  'الملك': 67, 'القلم': 68, 'الحاقة': 69, 'المعارج': 70, 'نوح': 71,
  'الجن': 72, 'المزمل': 73, 'المدثر': 74, 'القيامة': 75, 'الانسان': 76,
  'المرسلات': 77, 'النبأ': 78, 'النازعات': 79, 'عبس': 80, 'التكوير': 81,
  'الانفطار': 82, 'المطففين': 83, 'الانشقاق': 84, 'البروج': 85, 'الطارق': 86,
  'الاعلى': 87, 'الغاشية': 88, 'الفجر': 89, 'البلد': 90, 'الشمس': 91,
  'الليل': 92, 'الضحى': 93, 'الشرح': 94, 'التين': 95, 'العلق': 96,
  'القدر': 97, 'البينة': 98, 'الزلزلة': 99, 'العاديات': 100, 'القارعة': 101,
  'التكاثر': 102, 'العصر': 103, 'الهمزة': 104, 'الفيل': 105, 'قريش': 106,
  'الماعون': 107, 'الكوثر': 108, 'الكافرون': 109, 'النصر': 110, 'المسد': 111,
  'الاخلاص': 112, 'الفلق': 113, 'الناس': 114,
}

function normalizeSurahName(name: string) {
  return name.replace(/^سورة\s*/u, '').normalize('NFD').replace(/[\u064B-\u065F\u0670\u0640]/gu, '').replace(/[أإآٱ]/gu, 'ا').replace(/ى/gu, 'ي').replace(/\s+/gu, ' ').trim()
}

function audioUrl(surah: number, ayah: number) {
  return `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`
}

function QuranAudio({ urls }: { urls: string[] }) {
  const [failed, setFailed] = useState(false)
  if (!urls.length) return null
  return <span className="quran-audio-wrap" dir="rtl">
    <span className="quran-audio-label">تلاوة مشاري العفاسي</span>
    {urls.map((url, index) => <audio key={url} controls preload="none" aria-label={`تلاوة الآية ${index + 1}`} src={url} onError={() => setFailed(true)}/>) }
    {failed && <small className="quran-audio-error" role="status">تعذر تحميل التسجيل. تحقق من اتصال الإنترنت، أو افتح ملف التلاوة مباشرةً.</small>}
    <a className="quran-audio-source" href={urls[0]} target="_blank" rel="noreferrer">EveryAyah</a>
  </span>
}

/** Keep Quran quotations intact and visually distinct inside Arabic article prose. */
export default function QuranText({ text, lang }: { text: string; lang: Lang }) {
  if (lang !== 'ar' || !/﴿[^﴾]+﴾/u.test(text)) return <>{text}</>

  const parts: ReactNode[] = []
  const quote = /﴿[^﴾]+﴾(?:\s*\[[^\]]+\])?/gu
  const references = [...text.matchAll(/\[([^\]:]+):\s*(\d+)(?:[–-](\d+))?\]|سورة\s+([^:،.]+):\s*(\d+)(?:[–-](\d+))?/gu)]
  let cursor = 0
  let match: RegExpExecArray | null
  let referenceIndex = 0
  while ((match = quote.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index))
    const reference = references[referenceIndex++]
    const surahName = reference?.[1] ?? reference?.[4]
    const startNumber = reference?.[2] ?? reference?.[5]
    const endNumber = reference?.[3] ?? reference?.[6]
    const surah = surahName ? SURAH_NUMBER[normalizeSurahName(surahName)] : undefined
    const firstAyah = startNumber ? Number(startNumber) : 0
    const lastAyah = endNumber ? Number(endNumber) : firstAyah
    const urls = surah && firstAyah > 0 && lastAyah >= firstAyah && lastAyah - firstAyah <= 9
      ? Array.from({ length: lastAyah - firstAyah + 1 }, (_, i) => audioUrl(surah, firstAyah + i))
      : []
    parts.push(<span className="quran-verse" lang="ar" dir="rtl" key={`verse-${match.index}`}>
      <span className="quran-verse-text">{match[0]}</span>
      <QuranAudio urls={urls}/>
    </span>)
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return <>{parts}</>
}
