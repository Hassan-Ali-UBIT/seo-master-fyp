import React, { useEffect, useState } from 'react';
import DashboardLayout from '@components/layout/DashboardLayout';
import { getSavedPosts, deletePost, type LinkedInPost } from '@/services/api/linkedinOptimizerService';
import { useNavigate } from 'react-router-dom';

const LinkedInSavedPostsPage: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<LinkedInPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await getSavedPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deletePost(id);
            setPosts(posts.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post.");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Saved Posts</h1>
                    <button
                        onClick={() => navigate('/user/linkedin-tool/posts')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create New Post
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-500 mb-4">No saved posts found.</p>
                        <button
                            onClick={() => navigate('/user/linkedin-tool/posts')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create your first post
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                                {post.image && (
                                    <div className="h-48 bg-gray-100 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.topic}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">{post.topic}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                        {post.description}
                                    </p>
                                    <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-100">
                                        <span className="text-gray-400">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LinkedInSavedPostsPage;
