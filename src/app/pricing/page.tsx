import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="heading-1 text-center mb-8">Pricing</h1>
        <p className="text-xl text-navy-600 text-center max-w-3xl mx-auto mb-16">
          Choose the plan that fits your needs
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="card-premium p-8">
            <h2 className="heading-3 mb-4">Single Report</h2>
            <div className="text-4xl font-bold text-navy-900 mb-2">$497</div>
            <p className="text-navy-600 mb-6">One-time payment</p>
            <Button  className="w-full">
              <Link href="/generate">Get Started</Link>
            </Button>
          </div>
          <div className="card-premium p-8 border-gold-500 border-2">
            <h2 className="heading-3 mb-4">Monthly</h2>
            <div className="text-4xl font-bold text-navy-900 mb-2">$197</div>
            <p className="text-navy-600 mb-6">per month</p>
            <Button asChild className="w-full bg-gold-600 hover:bg-gold-500">
              <Link href="/generate?plan=monthly">Subscribe</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}