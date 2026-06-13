import {
  CTASection,
  FeaturesRow,
  Footer,
  Header,
  HeroSection,
  HomeUrlProvider,
  HowItWorks,
  SampleReportGrid,
} from "@/components/home";

export default function HomePage() {
  return (
    <HomeUrlProvider>
      <div className="bg-surface text-body-md text-on-surface selection:bg-secondary-fixed">
        <Header />
        <main>
          <HeroSection />
          <FeaturesRow />
          <HowItWorks />
          <SampleReportGrid />
          <CTASection />
        </main>
        <Footer />
      </div>
    </HomeUrlProvider>
  );
}
