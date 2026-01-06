import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleHeader, Footer } from '@components/layout';

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isActive: boolean;
  maxOptimizations: number;
}

const AdminPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // TODO: Replace with actual data from API
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: '1',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ['LinkedIn profile view', 'Basic analysis', '1 optimization/month'],
      isActive: true,
      maxOptimizations: 1,
    },
    {
      id: '2',
      name: 'Basic',
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: ['Everything in Free', 'Advanced analysis', '10 optimizations/month'],
      isActive: true,
      maxOptimizations: 10,
    },
    {
      id: '3',
      name: 'Premium',
      monthlyPrice: 79,
      yearlyPrice: 790,
      features: ['Everything in Basic', 'Unlimited optimizations', 'AI suggestions'],
      isActive: true,
      maxOptimizations: -1,
    },
    {
      id: '4',
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: ['Everything in Premium', 'Team features', 'Dedicated support'],
      isActive: true,
      maxOptimizations: -1,
    },
  ]);

  const [editForm, setEditForm] = useState<Plan | null>(null);

  const handleEdit = (plan: Plan) => {
    setIsEditing(plan.id);
    setEditForm({ ...plan });
  };

  const handleSave = () => {
    if (editForm) {
      setPlans(plans.map((p) => (p.id === editForm.id ? editForm : p)));
      setIsEditing(null);
      setEditForm(null);
      // TODO: Save to API
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditForm(null);
  };

  const handleToggleActive = (planId: string) => {
    setPlans(
      plans.map((p) =>
        p.id === planId ? { ...p, isActive: !p.isActive } : p
      )
    );
    // TODO: Update API
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter((p) => p.id !== planId));
      // TODO: Delete from API
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
            <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add New Plan
          </button>
        </div>

        {/* Plans Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yearly Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Optimizations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing === plan.id ? (
                      <input
                        type="text"
                        value={editForm?.name || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm!, name: e.target.value })
                        }
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing === plan.id ? (
                      <input
                        type="number"
                        value={editForm?.monthlyPrice || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            monthlyPrice: Number(e.target.value),
                          })
                        }
                        className="border border-gray-300 rounded px-2 py-1 w-24"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">${plan.monthlyPrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing === plan.id ? (
                      <input
                        type="number"
                        value={editForm?.yearlyPrice || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            yearlyPrice: Number(e.target.value),
                          })
                        }
                        className="border border-gray-300 rounded px-2 py-1 w-24"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">${plan.yearlyPrice}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing === plan.id ? (
                      <input
                        type="number"
                        value={editForm?.maxOptimizations || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            maxOptimizations: Number(e.target.value),
                          })
                        }
                        className="border border-gray-300 rounded px-2 py-1 w-24"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {plan.maxOptimizations === -1 ? 'Unlimited' : plan.maxOptimizations}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(plan.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditing === plan.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Plan Details Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${plan.monthlyPrice}
                </span>
                <span className="text-gray-600">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
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
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPlansPage;
