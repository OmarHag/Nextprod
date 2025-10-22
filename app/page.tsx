export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        Omar Hagaley
      </h1>
      <p className="text-lg text-gray-700 text-center max-w-xl mb-8">
        This website is <span className="font-semibold">deployed with Vercel</span> 🚀
      </p>
      <a
        href="https://vercel.com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
      >
        Learn More About Vercel
      </a>
    </main>
  );
}