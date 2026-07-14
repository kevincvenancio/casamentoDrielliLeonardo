import { wedding } from "@/config/wedding";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand bg-cream">
      <div className="container-page flex flex-col items-center gap-2 py-8 text-center text-sm text-stone">
        <p className="font-serif text-base text-ink">
          {wedding.couple.bride} & {wedding.couple.groom}
        </p>
        <p>{wedding.dateLabel}</p>
        {wedding.couple.hashtag ? (
          <p className="text-xs">{wedding.couple.hashtag}</p>
        ) : null}
      </div>
    </footer>
  );
}
