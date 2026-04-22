import Image from 'next/image';

const PORTFOLIO_IMAGES = [
  '/images/portfolio/korean/1.jpg',
  '/images/portfolio/fairy/3.jpg',
  '/images/portfolio/clean/2.jpg',
  '/images/portfolio/natural/4.jpg',
  '/images/portfolio/gentle/1.jpg',
  '/images/portfolio/sweet/5.jpg',
];

export default function PortfolioPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl text-brand-700">Portfolio</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {PORTFOLIO_IMAGES.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-md">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    </main>
  );
}
