export function SchoolCampusMap({
  embedSrc,
  openUrl,
  title,
  openLabel,
  light = false,
}: {
  embedSrc: string;
  openUrl: string | null;
  title: string;
  openLabel: string;
  light?: boolean;
}) {
  return (
    <div className="space-y-2">
      <iframe
        title={title}
        src={embedSrc}
        className="h-56 w-full border-0 bg-stone-100 sm:h-64"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {openUrl && (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            light
              ? "text-xs font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
              : "text-xs font-medium text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
          }
        >
          {openLabel}
        </a>
      )}
    </div>
  );
}
