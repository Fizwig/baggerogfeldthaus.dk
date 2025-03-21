import { redirect } from 'next/navigation';
import AboutUs from './components/AboutUs';
import TourDates from './components/TourDates';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-center text-neupink-600 mb-8">
          Strik & Drik
        </h1>
        <TourDates />
      </section>
      
      <section className="mb-12">
        <AboutUs />
      </section>
    </main>
  );
} 