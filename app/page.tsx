'use client';

import Navbar from '@/app/components/Navbar';
import Logo from '@/app/components/logo';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';

export default function Page() {
  const { isConnected } = useAccount();

  // const dummyOffers = [
  //   "🔥 Premium Healthcare Dataset - 50% OFF - Limited Time!",
  //   "💎 Financial Analytics Data - New Arrival - $299 ETH",
  //   "⚡ Real-time IoT Sensor Data - Live Feed Available",
  //   "🎯 Consumer Behavior Dataset - 10K+ Records - $199 USDC",
  //   "🚀 AI Training Dataset - Computer Vision - $499 ETH",
  //   "📊 Market Research Data - Global Trends - 30% OFF",
  //   "🔬 Scientific Research Dataset - Peer Reviewed - $399 USDC",
  //   "🌟 Social Media Analytics - Trending Now - $249 ETH"
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Ticker Banner */}
      <div className="bg-blue-700 text-white h-8 overflow-hidden relative z-10">
        <div className="ticker-animation whitespace-nowrap text-sm py-1 px-4">
          {/* {dummyOffers.map((offer, index) => (
            <span key={index} className="mx-8">
              {offer}
            </span>
          ))} */}
        </div>
      </div>

      {/* Logo - Fixed Top Left when not connected */}
      {!isConnected && (
        <div className="mt-4 ml-4 z-50">
            <Logo />
        </div>
      )}

      <Navbar />
      <main className={`transition-all duration-300 ${isConnected ? 'lg:ml-64 pt-16 lg:pt-0' : 'pt-16 lg:pt-0'}`}>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
              <div className="mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3">
                  🚀 Build the Future of Ecommerce Consumer Data
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                OYD Protocol
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                dataDAO of Ecommerce Consumer Behaviour Dataset
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                The first protocol where companies monetize encrypted datasets and developers access
                premium data through blockchain technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Upload Dataset
                  <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  Explore Datasets
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">500+</div>
                  <div className="text-slate-600 font-medium">Premium Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">$2.5M+</div>
                  <div className="text-slate-600 font-medium">In Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">10K+</div>
                  <div className="text-slate-600 font-medium">Active Developers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-50 to-transparent opacity-50"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-50 to-transparent opacity-50"></div>
          </div>
        </section>

        {/* Company Ticker */}
        <div className="bg-white border-y border-slate-200 py-4 overflow-hidden">
          <div className="ticker-container">
            <div className="ticker">
              <Image src="/Google.webp" alt="Google" width={120} height={40} className="ticker-logo" />
              <Image src="/Netflix.png" alt="Netflix" width={120} height={40} className="ticker-logo" />
              <Image src="/Amazon_icon.svg" alt="Amazon" width={120} height={40} className="ticker-logo" />
              <Image src="/Spotify-Icon-Logo.wine.svg" alt="Spotify" width={120} height={40} className="ticker-logo" />
              <Image src="/Airbnb_logo.png" alt="Airbnb" width={120} height={40} className="ticker-logo" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Three simple steps to start monetizing or accessing premium datasets
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">1. Upload & Encrypt</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Companies upload their datasets with advanced encryption. Data is stored securely
                    on IPFS with immutable proof of authenticity.
                  </p>
                </div>
                {/* Connection Line */}
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200"></div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">2. Smart Payments</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Developers discover and purchase datasets using ETH or USDC. Smart contracts
                    ensure transparent, instant, and secure transactions.
                  </p>
                </div>
                {/* Connection Line */}
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200"></div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">3. Access & Build</h3>
                <p className="text-slate-600 leading-relaxed">
                  Instant access to decrypted datasets upon payment confirmation. Build amazing
                  applications with premium, verified data sources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Data Trading?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of developers and companies already building the future of decentralized data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
              >
                Get Started Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
