"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const now = Date.now();
  const delta = Math.max(0, target - now);
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  const seconds = Math.floor((delta % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ dateIso }: { dateIso: string }) {
  const target = new Date(dateIso).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = [
    { label: "dias", value: t.days },
    { label: "horas", value: t.hours },
    { label: "min", value: t.minutes },
    { label: "seg", value: t.seconds },
  ];

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8">
      {items.map((it) => (
        <div key={it.label} className="text-center">
          <div className="font-serif text-3xl text-ink md:text-5xl">
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="text-xs uppercase tracking-widest text-stone">
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
}
