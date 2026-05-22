export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 pt-8 pb-6">
      <header className="mb-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-on-surface">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-on-surface-variant">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}
