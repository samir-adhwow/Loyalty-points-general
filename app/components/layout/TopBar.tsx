export default function TopBar({ title }: { title: React.ReactNode }) {
  return (
    <header className="flex items-center border-b border-primary/20 px-4 sm:px-6 bg-white py-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-dark border-l-4 border-primary px-4">
        {title}
      </h1>
    </header>
  );
}
