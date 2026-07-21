// Shared placeholder for tool pages that aren't built yet.
export default function ToolPlaceholder({ title, description }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="mt-4 card">
        <p className="text-gray-600">{description}</p>
        <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          Coming soon
        </span>
      </div>
    </div>
  );
}
