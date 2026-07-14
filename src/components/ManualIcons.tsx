/**
 * Icones do Manual do Convidado.
 *
 * Tracos finos, sem preenchimento, para conversar com a logo do casal.
 * A chave de cada icone e o campo `icon` de wedding.guestManual.items.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Check({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}

function Phone({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M10.5 5.5h3" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

function Envelope({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 7l9.5 6.5L21.5 7" />
    </svg>
  );
}

function Clock({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 1.9" />
    </svg>
  );
}

function Church({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2v4" />
      <path d="M10 3.7h4" />
      <path d="M12 6l5 4v11H7V10l5-4z" />
      <path d="M10.4 21v-4a1.6 1.6 0 013.2 0v4" />
    </svg>
  );
}

function Camera({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8.5A1.5 1.5 0 014.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0121 8.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-9z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

function Dress({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 3l3 2 3-2" />
      <path d="M9 3l-.6 4L12 9l3.6-2L15 3" />
      <path d="M8.4 7L5.5 19a1 1 0 001 1.3h11a1 1 0 001-1.3L15.6 7" />
    </svg>
  );
}

function Cake({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2.5v2" />
      <path d="M4.5 20.5v-6a2 2 0 012-2h11a2 2 0 012 2v6" />
      <path d="M3.5 20.5h17" />
      <path d="M4.5 16c1.5 0 1.5 1.4 3 1.4S9 16 10.5 16s1.5 1.4 3 1.4S15 16 16.5 16s1.5 1.4 3 1.4" />
      <path d="M12 12.5v-3" />
    </svg>
  );
}

function Flowers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="5.5" r="2.2" />
      <path d="M12 7.7v4.8" />
      <path d="M12 10c-1.6-1.4-3.4-1.6-4.6-1.2.3 1.5 1.6 2.8 3.2 3" />
      <path d="M12 10c1.6-1.4 3.4-1.6 4.6-1.2-.3 1.5-1.6 2.8-3.2 3" />
      <path d="M6.5 12.5h11l-1.2 7.2a1 1 0 01-1 .8H8.7a1 1 0 01-1-.8L6.5 12.5z" />
    </svg>
  );
}

function Chat({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 13.5a2.5 2.5 0 01-2.5 2.5H9l-4 3.5V6.5A2.5 2.5 0 017.5 4h10A2.5 2.5 0 0120 6.5v7z" />
      <path d="M9.5 10.5h5" />
    </svg>
  );
}

function Confetti({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20.5l3.4-9.4 6 6L4 20.5z" />
      <path d="M13.4 17.1L7.4 11.1" />
      <path d="M14 8.5V6.5" />
      <path d="M17.5 10l1.6-1.6" />
      <path d="M18.5 13.5h2" />
      <path d="M15.5 5.5l.8-1.6" />
    </svg>
  );
}

function Couple({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="6" r="2.3" />
      <circle cx="16" cy="6" r="2.3" />
      <path d="M4.5 20.5v-5a3.5 3.5 0 013.5-3.5 3.5 3.5 0 013.5 3.5v5" />
      <path d="M12.5 20.5v-5A3.5 3.5 0 0116 12a3.5 3.5 0 013.5 3.5v5" />
    </svg>
  );
}

export const manualIcons = {
  check: Check,
  phone: Phone,
  envelope: Envelope,
  clock: Clock,
  church: Church,
  camera: Camera,
  dress: Dress,
  cake: Cake,
  flowers: Flowers,
  chat: Chat,
  confetti: Confetti,
  couple: Couple,
} as const;

export type ManualIconKey = keyof typeof manualIcons;
