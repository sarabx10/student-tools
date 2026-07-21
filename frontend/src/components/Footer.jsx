function Social({ label, href, background, glyphColor = '#fff', children }) {
  const isMail = href.startsWith('mailto:');
  const extra = isMail ? {} : { target: '_blank', rel: 'noopener' };
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...extra}
      className="social-btn grid h-[38px] w-[38px] place-items-center rounded-[11px]"
      style={{ background, color: glyphColor }}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 min-[520px]:flex-row min-[520px]:items-center min-[520px]:justify-between">
        <p className="text-sm text-gray-500">
          © {year} <span className="font-semibold text-gray-700">Student Tools</span> · Built by Ali
        </p>

        <div className="flex items-center gap-3">
          {/* WhatsApp */}
          <Social label="WhatsApp" href="https://wa.me/60187699193" background="#25d366">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 15.5a12.8 12.8 0 0 1-4-.63 1 1 0 0 0-1 .24l-1.6 1.6a15.4 15.4 0 0 1-6.5-6.5l1.6-1.6a1 1 0 0 0 .24-1A12.8 12.8 0 0 1 8.5 4a1 1 0 0 0-1-1H4.5a1 1 0 0 0-1 1A16.5 16.5 0 0 0 20 20.5a1 1 0 0 0 1-1V16.5a1 1 0 0 0-1-1Z" />
            </svg>
          </Social>

          {/* Instagram */}
          <Social
            label="Instagram"
            href="https://www.instagram.com/sarabx10"
            background="linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </Social>

          {/* Snapchat */}
          <Social label="Snapchat" href="https://www.snapchat.com/add/sarabx10" background="#fffc00" glyphColor="#0b1020">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3c2.5 0 4.3 1.9 4.4 4.4 0 .6 0 1.2-.1 1.8.5.3 1 .2 1.4 0 .2-.1.5 0 .6.2.2.3 0 .6-.3.8-.4.2-1 .4-1.3.6-.2.5.6 1.6 2.3 2.2.3.1.4.4.3.6-.2.6-1.4.8-2 .9-.1.3-.1.7-.4.8-.4.2-1.1-.1-1.9-.1-.7 0-1.2.5-2 .9-.6.3-1.1.4-1.5.4s-.9-.1-1.5-.4c-.8-.4-1.3-.9-2-.9-.8 0-1.5.3-1.9.1-.3-.1-.3-.5-.4-.8-.6-.1-1.8-.3-2-.9-.1-.2 0-.5.3-.6 1.7-.6 2.5-1.7 2.3-2.2-.3-.2-.9-.4-1.3-.6-.3-.2-.5-.5-.3-.8.1-.2.4-.3.6-.2.4.2.9.3 1.4 0-.1-.6-.1-1.2-.1-1.8C7.7 4.9 9.5 3 12 3Z" />
            </svg>
          </Social>

          {/* Email */}
          <Social label="Email" href="mailto:alialyzidi2019@gmail.com" background="linear-gradient(135deg,#6366f1,#4f46e5)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </Social>
        </div>
      </div>
    </footer>
  );
}
