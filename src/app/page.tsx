import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/marketing/HeroSection'
import SocialProof from '@/components/marketing/SocialProof'
import PainPoints from '@/components/marketing/PainPoints'
import Process from '@/components/marketing/Process'
import ReportFeatures from '@/components/marketing/ReportFeatures'
import FinalCTA from '@/components/marketing/FinalCTA'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <SocialProof />
      <PainPoints />
      <Process />
      <ReportFeatures />
      <FinalCTA />
    </>
  )
}