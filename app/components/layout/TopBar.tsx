export default function TopBar({ title }: { title: React.ReactNode }) {
  return (
    <header className="flex h-16 items-center border-b border-primary/20 px-4 sm:px-6 bg-white">
      <h1 className="text-base font-semibold sm:text-lg border-l-4 border-primary px-4">
        {title}
      </h1>
    </header>
  );
}
