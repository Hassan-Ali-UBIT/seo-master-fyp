import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  disabled?: boolean;
}

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // TODO: Replace with actual data from API
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingCycle: 'monthly',
      features: [
        'LinkedIn profile view',
        'Basic profile analysis',
        '1 optimization per month',
        'Community support',
      ],
    },
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? 29 : 290,
      billingCycle,
      features: [
        'Everything in Free',
        'Advanced profile analysis',
        '10 optimizations per month',
        'Keyword suggestions',
        'Email support',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingCycle === 'monthly' ? 79 : 790,
      billingCycle,
      popular: true,
      features: [
        'Everything in Basic',
        'Unlimited optimizations',
        'AI-powered content suggestions',
        'Competitor analysis',
        'Priority support',
        'Export reports',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 199 : 1990,
      billingCycle,
      features: [
        'Everything in Premium',
        'Team collaboration',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced analytics',
        'White-label options',
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    // TODO: Implement payment flow with Stripe
    console.log('Selected plan:', planId);
    // For now, navigate to a mock payment page
    navigate(`/user/payment/checkout?plan=${planId}&billing=${billingCycle}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">
            Select the perfect plan to optimize your LinkedIn profile
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'yearly'
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={plan.disabled}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${plan.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            All plans include a 14-day money-back guarantee. Need help choosing?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlansPage;
