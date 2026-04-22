import { PortfolioPageContent } from './_components/PortfolioPageContent';

const PORTFOLIO_IMAGES = [
  '/images/portfolio/korean/1.jpg',
  '/images/portfolio/fairy/3.jpg',
  '/images/portfolio/clean/2.jpg',
  '/images/portfolio/natural/4.jpg',
  '/images/portfolio/gentle/1.jpg',
  '/images/portfolio/sweet/5.jpg',
];

export default function PortfolioPage() {
  return <PortfolioPageContent images={PORTFOLIO_IMAGES} />;
}
