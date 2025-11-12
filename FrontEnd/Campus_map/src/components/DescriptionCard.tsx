import { useMemo, useState } from "react";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function DescriptionCard({ description }: { description?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const text = (description ?? "").trim();

  const html = useMemo(() => {
    if (!text) return "";
    const safe = escapeHtml(text);
    const withLinks = safe.replace(
      /\b(https?:\/\/[^\s)]+)\b/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">$1</a>'
    );
    return withLinks.replace(/\n/g, "<br/>");
  }, [text]);

  const collapsed = text.length > 220 && !expanded;

  if (!text) return null;

  return (
    <section className="border-gray-300 bg-white p-3 mt-2 pb-6">
      <h2 className="text-3xl font-semibold text-gray-800 text-left">About this place</h2>

      <div className="mt-2 text-[19px] leading-8 text-gray-700 text-left">
        <p
          className={collapsed ? "line-clamp-4" : ""}
          dangerouslySetInnerHTML={{ __html: collapsed ? html.slice(0, 220) + "…" : html }}
        />
      </div>

      {text.length > 220 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
}
