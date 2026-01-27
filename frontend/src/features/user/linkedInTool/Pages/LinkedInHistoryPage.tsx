import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';
import { getProfileHistory, type ProfileHistory } from '@/services/api/linkedinOptimizerService';

const LinkedInHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<ProfileHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getProfileHistory();
                setHistory(res.data.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Optimization History</h1>
                        <p className="mt-2 text-gray-600">
                            View your past LinkedIn profile optimizations
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/user/linkedin-tool')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + New Analysis
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500 mb-4">No optimization history found.</p>
                        <button
                            onClick={() => navigate('/user/linkedin-tool')}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Start your first analysis
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {history.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.optimization_results?.[0]?.optimized_headline ? item.optimization_results[0].optimized_headline.substring(0, 80) + "..." : (item.headline_text ? item.headline_text.substring(0, 80) + "..." : 'Profile Optimization')}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center">
                                                <span className="mr-1">📅</span>
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            {item.context?.target_role && (
                                                <span className="flex items-center">
                                                    <span className="mr-1">💼</span>
                                                    {item.context.target_role}
                                                </span>
                                            )}
                                            {item.optimization_results?.[0]?.seo_score && (
                                                <span className="flex items-center font-medium text-blue-600">
                                                    <span className="mr-1">📊</span>
                                                    Score: {item.optimization_results[0].seo_score}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/user/linkedin-tool?resultId=${item.optimization_results?.[0]?.id}`)}
                                        className="ml-4 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LinkedInHistoryPage;
