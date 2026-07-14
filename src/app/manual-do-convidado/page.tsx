import Link from "next/link";
import { wedding } from "@/config/wedding";
import { manualIcons, type ManualIconKey } from "@/components/ManualIcons";

export const metadata = { title: "Manual do Convidado" };

export default function GuestManualPage() {
  const { guestManual } = wedding;

  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">{guestManual.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">{guestManual.intro}</p>
      </header>

      <ul className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {guestManual.items.map((item) => {
          const Icon = manualIcons[item.icon as ManualIconKey];
          return (
            <li
              key={item.title}
              className="flex gap-4 rounded-2xl border border-sand bg-white p-6"
            >
              <span className="shrink-0 text-stone">
                {Icon ? <Icon className="h-7 w-7" /> : null}
              </span>
              <div>
                <h2 className="font-serif text-lg text-ink">{item.title}</h2>
                <p className="mt-1 text-sm text-stone">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/rsvp" className="btn-primary w-full sm:w-auto">
          Confirmar presença
        </Link>
        <Link href="/dress-code" className="btn-outline w-full sm:w-auto">
          Ver o dress code
        </Link>
      </div>
    </div>
  );
}
