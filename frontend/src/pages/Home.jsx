import { Link } from 'react-router-dom';

const tools = [
  ['✍️', 'Writing Improvement', 'Rewrite and polish your academic text.'],
  ['🔍', 'Writing Checker', 'Find mistakes in your essay and get a corrected version.'],
  ['📄', 'Summarizer', 'Turn long PDFs and notes into short summaries.'],
  ['📚', 'Citation Generator', 'Create APA / MLA references instantly.'],
  ['🗓️', 'Study Planner', 'Organize your revision schedule.'],
  ['🪄', 'Humanizer', 'Rewrite text to read more naturally.'],
  ['🔎', 'Research Assistant', 'Get a structured overview of any topic.'],
  ['🎓', 'AI Tutor', 'Learn any topic through a chat conversation.'],
];

export default function Home() {
  return (
    <div>
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold">Study smarter with AI-powered tools</h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Student Tools helps university students improve writing, summarize lectures,
          generate citations, and plan study time — all in one place.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/register" className="btn-primary">Get started</Link>
          <Link to="/login" className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100">
            I have an account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(([icon, title, desc]) => (
          <div key={title} className="card">
            <div className="text-3xl">{icon}</div>
            <h3 className="mt-2 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
