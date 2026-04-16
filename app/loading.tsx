import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/spinner.svg"
          alt="Logo"
          width={24}
          height={24}
          className="h-12 w-12 animate-spin"
        />
        <p className="font-bold text-xl">Loading...</p>
      </div>
    </div>
  );
}
