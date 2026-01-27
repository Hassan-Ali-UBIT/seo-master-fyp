import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import { clearTokens } from '@utils/tokenStorage';
import { getPricePlans, createCheckoutSession } from '@/services/api/paymentService';
import type { Plan } from '@/services/api/paymentService';

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    // Check for redirect message
    if (location.state && location.state.message) {
      alert(location.state.message); // Simple alert for now, replacing with toast is better
      // Clear state to prevent showing on refresh
      window.history.replaceState({}, document.title);
    }

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

  const handleSelectPlan = async (plan: Plan) => {
    try {
      setProcessingId(plan.id);
      const { url } = await createCheckoutSession(plan.id);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to start checkout", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    clearTokens();
    navigate('/');
  };

  const filteredPlans = plans.filter(p => p.billing_period === billingCycle || p.billing_type === 'one_time');

  if (loading) {
    return (
      <DashboardLayout onLogout={handleLogout}>
        <div className="flex justify-center items-center h-full">Loading plans...</div>
      </DashboardLayout>
    )
  }

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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 flex flex-col`}
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
                    <span className="text-gray-700 text-sm">{plan.credits} Credits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-700 text-sm">{plan.ai_words_limit} AI Words</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-700 text-sm">{plan.keywords_limit} Keywords</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-700 text-sm">{plan.pages_limit} Pages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-700 text-sm">{plan.max_users} Users</span>
                  </li>
                </ul>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={processingId === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700 ${processingId === plan.id ? 'opacity-70 cursor-wait' : ''
                    }`}
                >
                  {processingId === plan.id ? 'Processing...' : (plan.price === 0 ? 'Get Started' : 'Subscribe Now')}
                </button>
              </div>
            </div>
          ))}
          {filteredPlans.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              No plans available for this billing period.
            </div>
          )}
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
