import { wedding } from "@/config/wedding";

export const metadata = { title: "Dress Code" };

type Foto = { src: string; alt: string };

function CartaoLook({
  titulo,
  texto,
  fotos,
}: {
  titulo: string;
  texto: string;
  fotos: readonly Foto[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-white">
      {fotos.length > 0 && (
        // Sem aspect-ratio fixo de proposito: as fotos de referencia vem com
        // proporcoes diferentes e um recorte forcado cortava os rostos.
        <div className="grid grid-cols-1 gap-px bg-sand">
          {fotos.map((foto) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={foto.src}
              src={foto.src}
              alt={foto.alt}
              className="h-auto w-full bg-sand"
              loading="lazy"
            />
          ))}
        </div>
      )}
      <div className="p-8">
        <p className="text-xs uppercase tracking-widest text-stone">{titulo}</p>
        <p className="mt-3 text-stone">{texto}</p>
      </div>
    </div>
  );
}

export default function DressCodePage() {
  const { dressCode } = wedding;

  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">{dressCode.title}</h1>
        <p className="mt-4 font-serif text-2xl text-ink">{dressCode.style}</p>
        <p className="mx-auto mt-4 max-w-2xl text-stone">{dressCode.intro}</p>
      </header>

      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <CartaoLook
          titulo="Elas"
          texto={dressCode.women}
          fotos={dressCode.womenPhotos}
        />
        <CartaoLook
          titulo="Eles"
          texto={dressCode.men}
          fotos={dressCode.menPhotos}
        />
      </div>

      {/* Cores a evitar */}
      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-sand bg-white p-8">
        <p className="text-xs uppercase tracking-widest text-stone">
          Cores a evitar
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {dressCode.avoidColors.map((color) => (
            <li key={color.label} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-7 w-7 shrink-0 rounded-full border border-sand"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-stone">{color.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-stone">{dressCode.avoidNote}</p>
      </div>

      {/* Inspiracao de cores */}
      {dressCode.palettePhoto && (
        <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-sand bg-white">
          <div className="p-8 pb-6">
            <p className="text-xs uppercase tracking-widest text-stone">
              Inspiração de cores
            </p>
            <p className="mt-3 text-stone">
              Fora as cores acima, sinta-se livre. Vale de verde a vinho,
              passando por azul, mostarda e terracota.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dressCode.palettePhoto.src}
            alt={dressCode.palettePhoto.alt}
            className="w-full bg-sand"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
