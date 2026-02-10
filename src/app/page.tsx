import Link from 'next/link'
import PricingCard from '@/components/PricingCard'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Truth in Digital
              <span className="block text-blue-600">Transformation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              AI-powered Web3 strategy reports customized for your business location.
              National coverage. Expert insights. No guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/generate"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Get Your Strategy Report
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Veridian Group</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Location Intelligence</h3>
              <p className="text-gray-600">
                Get insights specific to your city and state, including local regulations, talent pools, and opportunities.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced AI generates comprehensive 5-page reports with actionable strategies for your business.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Regulatory Compliance</h3>
              <p className="text-gray-600">
                Stay compliant with state-specific crypto regulations and legal requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-4">01</div>
                <h3 className="text-xl font-semibold mb-3">Enter Your Details</h3>
                <p className="text-gray-600 mb-6">
                  Tell us about your business, location, and goals. Our system analyzes your specific situation.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-4">02</div>
                <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
                <p className="text-gray-600 mb-6">
                  Our AI analyzes location data, regulations, and market opportunities to create your custom strategy.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-4">03</div>
                <h3 className="text-xl font-semibold mb-3">Get Your Report</h3>
                <p className="text-gray-600 mb-6">
                  Receive a comprehensive 5-page PDF report with actionable strategies and implementation plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <PricingCard
              title="Single Report"
              price="$497"
              period="one-time"
              description="Perfect for initial Web3 assessment"
              features={[
                '5-page customized report',
                'Location-specific analysis',
                'State regulation review',
                '90-day action plan',
                'Email support',
                '30-day revision window'
              ]}
              buttonText="Get Report"
              buttonLink="/generate"
              featured={false}
            />
            <PricingCard
              title="Monthly Subscription"
              price="$197"
              period="per month"
              description="For ongoing Web3 strategy needs"
              features={[
                '2 reports per month',
                'Priority AI processing',
                'Team collaboration',
                'Monthly strategy reviews',
                'Phone support',
                'Unlimited revisions'
              ]}
              buttonText="Subscribe Now"
              buttonLink="/pricing"
              featured={true}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Navigate Web3 with Confidence?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join hundreds of businesses that have transformed their digital strategy with Veridian Group.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-lg hover:bg-gray-100"
          >
            Start Your Strategy Today
          </Link>
        </div>
      </section>
    </div>
  )
}