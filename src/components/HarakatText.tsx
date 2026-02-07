type HarakatTextProps = {
    text: string
    className?: string
    size?: 'normal' | 'large' | 'xl' | '2xl'
}

const HARAKAT_COLORS: Record<string, string> = {
    '\u064E': 'text-emerald-400', // Fatha
    '\u064B': 'text-emerald-400', // Fathatan
    '\u0650': 'text-sky-400',     // Kasra
    '\u064D': 'text-sky-400',     // Kasratan
    '\u064F': 'text-amber-400',   // Damma
    '\u064C': 'text-amber-400',   // Dammatan
    '\u0652': 'text-slate-400',   // Sukun
    '\u0651': 'text-rose-400',    // Shadda
    '\u0653': 'text-violet-400',  // Maddah
}

export function HarakatText({ text, className = '', size = 'large' }: HarakatTextProps) {
    const sizeClass = {
        normal: 'text-2xl',
        large: 'text-4xl',
        xl: 'text-5xl',
        '2xl': 'text-6xl',
    }[size]

    return (
        <span dir="rtl" className={`font-arabic ${sizeClass} ${className} leading-loose`}>
            {text.split('').map((char, index) => {
                const colorClass = HARAKAT_COLORS[char]
                if (colorClass) {
                    // Harakat marks need to be wrapped to apply color
                    // We use a span, but to minimize shaping issues we ensure no extra whitespace
                    return (
                        <span key={index} className={colorClass}>
                            {char}
                        </span>
                    )
                }
                // Letters are rendered as-is. 
                // Note: consecutive alphanumeric chars will be separated by React spans if we wrap them all.
                // But here we ONLY wrap Haraka. Letters are just text nodes in the array?
                // Actually map returns an array of elements. React renders them side-by-side.
                // { 'ب', <span ...>َ</span>, 'ت' }
                // This usually preserves shaping better than wrapping letters.
                return char
            })}
        </span>
    )
}
