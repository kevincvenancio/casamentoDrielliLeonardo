import { wedding } from "@/config/wedding";

export const metadata = { title: "Local" };

export default function VenuePage() {
  const { venue, dateLabel } = wedding;

  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">Cerimônia &amp; Festa</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">
          A cerimônia e a festa acontecem no mesmo endereço. Será uma alegria
          ter você conosco.
        </p>
      </header>

      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-sand bg-white">
        <div className="aspect-video w-full">
          <iframe
            title="Mapa do local"
            src={venue.mapEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-stone">
            Cerimônia e Festa
          </p>
          {venue.name ? (
            <h2 className="mt-1 font-serif text-2xl">{venue.name}</h2>
          ) : null}
          <p className="mt-2 text-stone">{venue.address}</p>
          <p className="mt-1 text-sm text-stone">
            {dateLabel} &middot; às {venue.time}
          </p>
          <a
            href={venue.mapLink}
            target="_blank"
            rel="noreferrer"
            className="btn-outline mt-6 py-2 text-xs"
          >
            Abrir no Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
