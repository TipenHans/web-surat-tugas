import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-4">
      <Link
        href="/generate-surat"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white"
      >
        Generate Surat
      </Link>

      <Link
        href="/surat-tugas-mahasiswa"
        className="rounded-lg bg-green-600 px-6 py-3 text-white"
      >
        Surat Tugas Mahasiswa
      </Link>
    </main>
  );
}