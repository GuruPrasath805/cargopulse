export interface AccentStyle {
  badge: string;
  iconWrap: string;
  iconText: string;
  ring: string;
  button: string;
  gradient: string;
  text: string;
  dot: string;
}

export const ACCENT_STYLES: Record<string, AccentStyle> = {
  purple: {
    badge: 'bg-purple-50 text-purple-700 border border-purple-200',
    iconWrap: 'bg-purple-100 text-purple-600 border border-purple-200',
    iconText: 'text-purple-600',
    ring: 'focus:border-purple-500 focus:ring-purple-500/20',
    button: 'bg-purple-600 hover:bg-purple-700 text-white font-bold',
    gradient: 'from-purple-600 via-purple-500 to-fuchsia-500',
    text: 'text-purple-600',
    dot: 'bg-purple-500',
  },
  amber: {
    badge: 'bg-orange-50 text-orange-700 border border-orange-200',
    iconWrap: 'bg-orange-100 text-orange-600 border border-orange-200',
    iconText: 'text-orange-600',
    ring: 'focus:border-orange-500 focus:ring-orange-500/20',
    button: 'bg-orange-500 hover:bg-orange-600 text-white font-bold',
    gradient: 'from-orange-500 to-amber-500',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    iconWrap: 'bg-blue-100 text-blue-600 border border-blue-200',
    iconText: 'text-blue-600',
    ring: 'focus:border-blue-500 focus:ring-blue-500/20',
    button: 'bg-blue-600 hover:bg-blue-700 text-white font-bold',
    gradient: 'from-blue-600 via-sky-500 to-cyan-500',
    text: 'text-blue-600',
    dot: 'bg-blue-600',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    iconWrap: 'bg-emerald-100 text-emerald-600 border border-emerald-200',
    iconText: 'text-emerald-600',
    ring: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold',
    gradient: 'from-emerald-600 via-teal-500 to-emerald-400',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  cyan: {
    badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    iconWrap: 'bg-cyan-100 text-cyan-600 border border-cyan-200',
    iconText: 'text-cyan-600',
    ring: 'focus:border-cyan-500 focus:ring-cyan-500/20',
    button: 'bg-cyan-600 hover:bg-cyan-700 text-white font-bold',
    gradient: 'from-cyan-600 via-sky-500 to-blue-500',
    text: 'text-cyan-600',
    dot: 'bg-cyan-500',
  },
  brand: {
    badge: 'bg-orange-50 text-orange-700 border border-orange-200',
    iconWrap: 'bg-orange-100 text-orange-600 border border-orange-200',
    iconText: 'text-orange-600',
    ring: 'focus:border-orange-500 focus:ring-orange-500/20',
    button: 'bg-orange-500 hover:bg-orange-600 text-white font-bold',
    gradient: 'from-orange-600 via-orange-500 to-amber-400',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
  },
};

export const getAccent = (accent: string): AccentStyle => ACCENT_STYLES[accent] || ACCENT_STYLES.brand;
