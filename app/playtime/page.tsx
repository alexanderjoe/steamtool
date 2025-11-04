import SteamPlaytimeTracker from '@/components/steam-playtime-tracker';
import Link from 'next/link';

export default function PlaytimePage() {
  return (
    <main className="">
      <div className="bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center gap-4 mb-8">
            <Link
              href="/"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Library Compare
            </Link>
            <Link
              href="/playtime"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Playtime Tracker
            </Link>
          </div>
          <SteamPlaytimeTracker />
        </div>
      </div>
    </main>
  );
}
