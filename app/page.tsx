import Link from "next/link";
import "../styles/skin.scss";
export default function HomePage() {
  return (
    <div className="HOME_WRAPPER flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center bg-gray-50 p-10 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Creative Marketplace
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Generate custom creative content like logos, business cards,
          invitations, and more.
        </p>
        <Link href="/create">
          <div className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Get Started
          </div>
        </Link>
      </div>
    </div>
  );
}
