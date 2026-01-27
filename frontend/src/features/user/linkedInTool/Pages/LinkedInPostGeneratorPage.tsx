import React, { useState } from 'react';
import DashboardLayout from '@components/layout/DashboardLayout';
import { generateLinkedInPost, savePost, type GeneratePostResponse } from '@/services/api/linkedinOptimizerService';
import { useNavigate } from 'react-router-dom';

const LinkedInPostGeneratorPage: React.FC = () => {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedData, setGeneratedData] = useState<GeneratePostResponse['data'] | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Edit states
    const [editedHook, setEditedHook] = useState('');
    const [editedBody, setEditedBody] = useState('');
    const [editedKeywords, setEditedKeywords] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsGenerating(true);
        setGeneratedData(null);
        try {
            const res = await generateLinkedInPost(topic);
            setGeneratedData(res);
            setEditedHook(res.hook);
            setEditedBody(res.body);
            setEditedKeywords(res.keywords);
        } catch (error) {
            console.error("Failed to generate", error);
            alert("Failed to generate post. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedData) return;
        setIsSaving(true);
        try {
            await savePost({
                topic: generatedData.topic,
                description: editedBody,
                keywords: editedKeywords,
                hook: editedHook,
                image_base64: generatedData.image_base64
            });
            alert("Post saved successfully!");
            navigate('/user/linkedin-tool/posts/saved');
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save post.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">LinkedIn Post Generator</h1>
                    <button
                        onClick={() => navigate('/user/linkedin-tool/posts/saved')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        View Saved Posts
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <form onSubmit={handleGenerate} className="flex gap-4">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="What do you want to post about? (e.g., 'The future of AI in marketing')"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isGenerating || !topic}
                            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </button>
                    </form>
                </div>

                {generatedData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Text Content */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Hook</h2>
                                <textarea
                                    value={editedHook}
                                    onChange={(e) => setEditedHook(e.target.value)}
                                    placeholder="Catchy first line..."
                                    className="w-full h-24 p-4 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-sans text-gray-700 leading-relaxed"
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Body</h2>
                                <textarea
                                    value={editedBody}
                                    onChange={(e) => setEditedBody(e.target.value)}
                                    placeholder="Main content..."
                                    className="w-full h-64 p-4 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-sans text-gray-700 leading-relaxed"
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Keywords/Hashtags</h2>
                                <textarea
                                    value={editedKeywords}
                                    onChange={(e) => setEditedKeywords(e.target.value)}
                                    placeholder="#Keywords..."
                                    className="w-full h-24 p-4 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-sans text-gray-700 leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Image Preview */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Image</h2>
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                    {generatedData.image_base64 ? (
                                        <img
                                            src={generatedData.image_base64}
                                            alt="Generated LinkedIn Post"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400">Image placeholder</span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LinkedInPostGeneratorPage;
