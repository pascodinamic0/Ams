type JsonLdNode = Record<string, unknown>;

function toGraphNodes(items: JsonLdNode[]): JsonLdNode[] {
  return items.map((item) => {
    const { ["@context"]: _context, ...rest } = item;
    return rest;
  });
}

function serializeJsonLd(data: object | object[] | null): string | null {
  if (!data) return null;

  const items = (Array.isArray(data) ? data : [data]).filter(
    (item): item is JsonLdNode =>
      item != null && typeof item === "object" && !Array.isArray(item)
  );

  if (items.length === 0) return null;
  if (items.length === 1) return JSON.stringify(items[0]);

  // Safari throws when JSON-LD is a top-level array; use @graph instead.
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": toGraphNodes(items),
  });
}

export function JsonLdScript({ data }: { data: object | object[] | null }) {
  const json = serializeJsonLd(data);
  if (!json) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
