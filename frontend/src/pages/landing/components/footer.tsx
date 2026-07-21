export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 lg:px-8">
        <span className="font-heading text-[18px] font-semibold leading-6 tracking-tight text-foreground">
          RhOps AI
        </span>
        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} RhOps AI
        </span>
      </div>
    </footer>
  );
}
