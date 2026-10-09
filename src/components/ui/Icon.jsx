import {
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Database,
  FileText,
  Globe,
  Handshake,
  HeartPulse,
  Infinity as InfinityIcon,
  KeyRound,
  Layers,
  LifeBuoy,
  Megaphone,
  Phone,
  ShieldCheck,
  Sprout,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'

/**
 * Icon keys referenced from src/data (siteContent.js, pricingData.js).
 * Sections may import lucide-react icons directly for mock-UI details.
 */
const ICONS = {
  briefcase: Briefcase,
  building: Building2,
  calendarClock: CalendarClock,
  calendarDays: CalendarDays,
  barChart: ChartColumn,
  clipboardList: ClipboardList,
  database: Database,
  fileText: FileText,
  globe: Globe,
  handshake: Handshake,
  heartPulse: HeartPulse,
  infinity: InfinityIcon,
  keyRound: KeyRound,
  layers: Layers,
  lifeBuoy: LifeBuoy,
  megaphone: Megaphone,
  phone: Phone,
  shield: ShieldCheck,
  sprout: Sprout,
  trendingUp: TrendingUp,
  userPlus: UserPlus,
  users: Users,
}

export default function Icon({ name, size = 20, strokeWidth = 1.75, ...rest }) {
  const Component = ICONS[name]
  if (!Component) return null
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />
}
