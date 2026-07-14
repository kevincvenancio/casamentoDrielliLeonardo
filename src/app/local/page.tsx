import { wedding } from "@/config/wedding";

export const metadata = { title: "Local" };

function VenueCard({
  label,
  venue,
}: {
  label: string;
  venue: {
    name: string;
    address: string;
    time: string;
    mapEmbedUrl: string;
    mapLink: string;
  };
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-white">
      <div className="aspect-video w-full">
        <iframe
          title={`Mapa - ${venue.name}`}
          src={venue.mapEmbedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="p-6">
        <p className="text-xs uppercase tracking-widest text-stone">{label}</p>
        <h2 className="mt-1 font-serif text-2xl">{venue.name}</h2>
        <p className="mt-2 text-stone">{venue.address}</p>
        <p className="mt-1 text-sm text-stone">As {venue.time}</p>
        <a
          href={venue.mapLink}
          target="_blank"
          rel="noreferrer"
          className="btn-outline mt-4 py-2 text-xs"
        >
          Abrir no Google Maps
        </a>
      </div>
    </div>
  );
}

export default function VenuePage() {
  const { venue } = wedding;
  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">Cerimonia & Festa</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">
          Confira os enderecos e horarios. Sera uma alegria ter voce conosco.
        </p>
      </header>
      <div className="grid gap-8 md:grid-cols-2">
        <VenueCard label="Cerimonia" venue={venue.ceremony} />
        <VenueCard label="Festa" venue={venue.party} />
      </div>
    </div>
  );
}
