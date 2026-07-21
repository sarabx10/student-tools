// Lightweight markdown renderer for headings, bullets, and **bold**.
// Not a full parser — just enough for the Research Assistant output.

function renderInline(text, keyPrefix) {
  // Split on **bold** markers.
  return text.split('**').map((seg, i) =>
    i % 2 === 1 ? <strong key={`${keyPrefix}-${i}`}>{seg}</strong> : <span key={`${keyPrefix}-${i}`}>{seg}</span>
  );
}

export default function Markdownish({ text }) {
  const lines = (text || '').split('\n');
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (list) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-2 ml-5 list-disc space-y-1">
          {list}
        </ul>
      );
      list = null;
    }
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);

    if (heading) {
      flushList();
      blocks.push(
        <h3 key={idx} className="mb-1 mt-4 text-lg font-semibold text-indigo-600">
          {renderInline(heading[2], idx)}
        </h3>
      );
    } else if (bullet) {
      list = list || [];
      list.push(<li key={idx}>{renderInline(bullet[1], idx)}</li>);
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={idx} className="my-1 leading-relaxed">
          {renderInline(line, idx)}
        </p>
      );
    }
  });
  flushList();

  return <div>{blocks}</div>;
}
