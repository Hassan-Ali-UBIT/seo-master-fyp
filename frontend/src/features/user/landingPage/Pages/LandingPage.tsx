import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';
import { Button } from '@components/ui';
import { cn } from '@utils/helpers';
import { getAccessToken } from '@utils/tokenStorage';
import { getPricePlans } from '@/services/api/paymentService';
import type { Plan } from '@/services/api/paymentService';
import { useState, useEffect } from 'react';
import logoSvg from '@assets/images/logo.svg';

const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPricePlans();
        const dataArray = Array.isArray(data) ? data : (data as any).results || [];
        setPlans(dataArray);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter(p => p.billing_period === billingCycle || p.billing_type === 'one_time');

  if (loading) return <div className="text-center py-10">Loading plans...</div>;

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Flexible Plans for Every Ambition</h2>
        <p className="text-lg text-gray-600 mb-8">
          Start optimizing specifically for your needs.
          <br className="hidden sm:block" />
          Transparent pricing, cancel anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'monthly'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${billingCycle === 'yearly'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 flex flex-col border border-gray-100`}
          >
            <div className="p-6 flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.sub_title}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                {plan.billing_type === 'subscription' && (
                  <span className="text-gray-600">/{plan.billing_period === 'monthly' ? 'mo' : 'yr'}</span>
                )}
                {plan.billing_type === 'one_time' && (
                  <span className="text-gray-600"> one-time</span>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-gray-700 text-sm">{plan.credits} Credits</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-gray-700 text-sm">{plan.ai_words_limit} AI Words</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-gray-700 text-sm">{plan.keywords_limit} Keywords</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-gray-700 text-sm">{plan.pages_limit} Pages</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-gray-700 text-sm">{plan.max_users} Users</span>
                </li>
              </ul>
            </div>
            <div className="p-6 pt-0 mt-auto">
              <button
                onClick={() => navigate('/signup')}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700`}
              >
                {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const seoTools = [
    {
      id: 'linkedin-profile',
      name: 'LinkedIn Profile Optimization',
      description: 'Optimize your LinkedIn profile for better visibility',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: 'blue',
      available: true
    },
    {
      id: 'linkedin-post-generator',
      name: 'LinkedIn Post Generator',
      description: 'Generate viral posts & AI images',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.06,9.02l0.92-0.92L13.92,7.04l-0.92,0.92L14.06,9.02 M13,3.87l3.6,3.6L7.1,16.96L3.5,13.38L13,3.87 M3,17.25l0,3.75 l3.75,0l0-1.5L5.25,19.5l-1.5-1.5L3.75,17.25 M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.47-0.47-1.12-0.29-1.41,0 l-1.83,1.83l3.75,3.75L20.71,7.04" />
        </svg>
      ),
      color: 'blue',
      available: true
    },
    {
      id: 'google-maps',
      name: 'Google Maps SEO',
      description: 'Optimize your local business presence',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      color: 'green',
      available: false
    },
    {
      id: 'social-profile',
      name: 'Social Media Profile SEO',
      description: 'Enhance your social profiles',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      color: 'purple',
      available: false
    },
    {
      id: 'social-post',
      name: 'Social Media Post SEO',
      description: 'Optimize your social content',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      color: 'pink',
      available: false
    },
    {
      id: 'youtube-channel',
      name: 'YouTube Channel SEO',
      description: 'Grow your YouTube presence',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      color: 'red',
      available: false
    },
    {
      id: 'youtube-video',
      name: 'YouTube Video SEO',
      description: 'Optimize individual videos',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ),
      color: 'orange',
      available: false
    },
    {
      id: 'article',
      name: 'Article SEO',
      description: 'Perfect your blog content',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      color: 'indigo',
      available: false
    },
    {
      id: 'website',
      name: 'Website SEO',
      description: 'Complete website optimization',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      color: 'cyan',
      available: false
    },
    {
      id: 'product',
      name: 'Product SEO',
      description: 'Boost product visibility',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z" />
        </svg>
      ),
      color: 'amber',
      available: false
    }
  ];

  const getColorClasses = (color: string, available: boolean) => {
    const colors = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        border: 'border-blue-300',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-300',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
        border: 'border-purple-300',
        iconBg: 'bg-purple-100',
        iconText: 'text-purple-600',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-700'
      },
      pink: {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
        border: 'border-pink-300',
        iconBg: 'bg-pink-100',
        iconText: 'text-pink-600',
        badgeBg: 'bg-pink-100',
        badgeText: 'text-pink-700'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-orange-50',
        border: 'border-red-300',
        iconBg: 'bg-red-100',
        iconText: 'text-red-600',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
        border: 'border-orange-300',
        iconBg: 'bg-orange-100',
        iconText: 'text-orange-600',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700'
      },
      indigo: {
        bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
        border: 'border-indigo-300',
        iconBg: 'bg-indigo-100',
        iconText: 'text-indigo-600',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-700'
      },
      cyan: {
        bg: 'bg-gradient-to-br from-cyan-50 to-teal-50',
        border: 'border-cyan-300',
        iconBg: 'bg-cyan-100',
        iconText: 'text-cyan-600',
        badgeBg: 'bg-cyan-100',
        badgeText: 'text-cyan-700'
      },
      amber: {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-300',
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleStartFreeAudit = () => {
    navigate('/signup');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const isAuthenticated = !!getAccessToken();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <SimpleHeader
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
        onLogoClick={handleLogoClick}
        onDashboardClick={handleDashboardClick}
        isAuthenticated={isAuthenticated}
      />

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(209 213 219 / 0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Logo Animation */}
          <div className="flex justify-center mb-8 animate-float">
            <img
              src={logoSvg}
              alt="SEO Master Pro"
              className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-2xl"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-700">AI-Powered SEO Optimization</span>
          </div>

          {/* Main Heading with Gradient */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-6 animate-fade-in-up animation-delay-200">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
              Master Your SEO Game
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
            Comprehensive SEO auditing and optimization tool powered by AI.
            <br className="hidden sm:block" />
            Boost your rankings across <span className="font-semibold text-primary-600">Google</span>, <span className="font-semibold text-blue-600">LinkedIn</span>, and beyond.
          </p>

          {/* CTA Button Group */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in-up animation-delay-600">
            <Button
              variant="primary"
              size="xl"
              onClick={handleStartFreeAudit}
              className="group relative bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free Audit
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required • 5-minute setup</span>
            </div>
          </div>

          {/* Trust Indicators with Icons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm animate-fade-in-up animation-delay-800">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">AI-Powered Analysis</span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Real-time Monitoring</span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Competitor Insights</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Add CSS animations in a style tag */}
        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
          }
          .animation-delay-600 {
            animation-delay: 0.6s;
            opacity: 0;
          }
          .animation-delay-800 {
            animation-delay: 0.8s;
            opacity: 0;
          }
        `}</style>
      </main>

      {/* Features Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Dominate SEO
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools and insights to boost your search rankings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comprehensive Audits
              </h3>
              <p className="text-gray-600">
                Get detailed insights into your website's SEO performance with our AI-powered analysis.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Monitoring
              </h3>
              <p className="text-gray-600">
                Track your rankings and performance metrics in real-time across all major search engines.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Competitor Analysis
              </h3>
              <p className="text-gray-600">
                Stay ahead of the competition with detailed insights into your competitors' strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Tools Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive SEO Tools Suite
            </h2>
            <p className="text-lg text-gray-600">
              Optimize every aspect of your digital presence with our specialized tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seoTools.map((tool) => {
              const colorClasses = getColorClasses(tool.color, tool.available);
              return (
                <div
                  key={tool.id}
                  className={cn(
                    'rounded-xl shadow-lg border-2 p-6 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl',
                    colorClasses.bg,
                    colorClasses.border
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={cn(
                      'p-3 rounded-full',
                      colorClasses.iconBg,
                      colorClasses.iconText
                    )}>
                      {tool.icon}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {tool.description}
                      </p>
                    </div>

                    <div className={cn(
                      'px-4 py-2 rounded-full text-xs font-medium',
                      tool.available ? colorClasses.badgeBg + ' ' + colorClasses.badgeText : 'bg-gray-200 text-gray-600'
                    )}>
                      {tool.available ? 'Available Now' : 'Coming Soon'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingSection />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
