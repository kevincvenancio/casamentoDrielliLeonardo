import { wedding } from "@/config/wedding";
import { PhotoGallery } from "@/components/PhotoGallery";

export const metadata = { title: "Nossa Historia" };

export default function StoryPage() {
  const { story } = wedding;
  return (
    <div className="container-page py-16">
      <header className="mb-12 text-center">
        <h1 className="section-title">{story.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-stone">{story.intro}</p>
      </header>

      {story.timeline.length > 0 ? (
        <ol className="relative mx-auto max-w-2xl border-l border-sand pl-8">
          {story.timeline.map((item, i) => (
            <li key={i} className="relative mb-10 last:mb-0">
              <span className="absolute -left-[42px] mt-2 h-5 w-5 rounded-full border-2 border-cream bg-stone" />
              <p className="text-xs uppercase tracking-widest text-stone">
                {item.date}
              </p>
              <h3 className="mt-1 font-serif text-2xl text-ink">{item.title}</h3>
              {item.text ? <p className="mt-2 text-stone">{item.text}</p> : null}
            </li>
          ))}
        </ol>
      ) : null}

      {/* Galeria do ensaio: fecha a pagina depois da linha do tempo.
          A borda de cima separa as duas secoes, que dividem o mesmo fundo. */}
      {story.gallery.photos.length > 0 ? (
        <section className="mt-16 border-t border-sand pt-16">
          <header className="mb-8 text-center">
            <h2 className="section-title">{story.gallery.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-stone">
              {story.gallery.intro}
            </p>
          </header>
          <PhotoGallery photos={story.gallery.photos} />
        </section>
      ) : null}
    </div>
  );
}
