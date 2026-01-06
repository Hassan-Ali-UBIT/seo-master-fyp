import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@components/layout/DashboardLayout';

type Step = 1 | 2 | 3 | 4 | 5;

interface LinkedInData {
  // Step 1: Connection
  connectionMethod: 'linkedin' | 'manual' | null;
  linkedinConnected: boolean;
  currentProfileData?: {
    headline: string;
    about: string;
    experience: string;
    skills: string[];
  };

  // Step 2: Target Information
  targetRole: string;
  location: string;
  industry: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' | '';
  targetSkills: string[];

  // Step 3: Analysis Results
  analysisComplete: boolean;
  competitorProfiles?: {
    count: number;
    topHeadlines: string[];
    topSkills: string[];
    commonKeywords: string[];
  };
  keywordMap?: {
    industryKeywords: string[];
    roleKeywords: string[];
    locationKeywords: string[];
    skillKeywords: string[];
  };
  gapAnalysis?: {
    missingKeywords: string[];
    keywordUsageComparison: string;
    profileCompleteness: number;
  };

  // Step 4: Optimization Output
  optimizedContent?: {
    headline: string;
    about: string;
    experienceBullets: string[];
    suggestedSkills: string[];
  };
  seoScore?: {
    total: number;
    breakdown: {
      keywords: number;
      structure: number;
      completeness: number;
      gaps: number;
    };
  };
}

const LinkedInToolPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<LinkedInData>({
    connectionMethod: null,
    linkedinConnected: false,
    targetRole: '',
    location: '',
    industry: '',
    experienceLevel: '',
    targetSkills: [],
    analysisComplete: false,
  });

  const handleLogout = () => {
    navigate('/');
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleLinkedInConnect = async () => {
    // TODO: Implement LinkedIn OAuth
    console.log('Connecting to LinkedIn...');
    // Simulate OAuth and data retrieval
    setData({
      ...data,
      connectionMethod: 'linkedin',
      linkedinConnected: true,
      currentProfileData: {
        headline: 'Software Engineer | Full Stack Developer',
        about: 'Passionate about building scalable web applications...',
        experience: '5 years in web development',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      },
    });
    nextStep();
  };

  const handleManualEntry = () => {
    setData({ ...data, connectionMethod: 'manual' });
    nextStep();
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    nextStep();

    // TODO: Call backend API for analysis
    // Simulate API call
    setTimeout(() => {
      setData({
        ...data,
        analysisComplete: true,
        competitorProfiles: {
          count: 30,
          topHeadlines: [
            'Senior Software Engineer | Cloud Architecture | AWS Certified',
            'Full Stack Developer | React & Node.js Expert | Tech Lead',
            'Software Engineer | Building Scalable Systems | Ex-FAANG',
          ],
          topSkills: ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript', 'Python', 'Docker', 'Kubernetes'],
          commonKeywords: ['Cloud', 'Scalable', 'Agile', 'Microservices', 'CI/CD', 'DevOps'],
        },
        keywordMap: {
          industryKeywords: ['SaaS', 'Cloud Computing', 'Enterprise Software', 'B2B', 'API Development'],
          roleKeywords: ['Software Engineer', 'Full Stack', 'Backend', 'Frontend', 'Tech Lead'],
          locationKeywords: ['Remote', 'San Francisco', 'Silicon Valley', 'US-Based'],
          skillKeywords: ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'TypeScript', 'MongoDB'],
        },
        gapAnalysis: {
          missingKeywords: ['Cloud Architecture', 'Kubernetes', 'Microservices', 'CI/CD', 'DevOps'],
          keywordUsageComparison: 'Your profile uses 45% of top keywords vs competitors who use 85%',
          profileCompleteness: 72,
        },
        optimizedContent: {
          headline: 'Senior Software Engineer | Cloud Architecture & Scalable Systems | AWS Certified | React & Node.js Expert',
          about: `Passionate Software Engineer with 5+ years of experience building scalable, cloud-native applications. Specialized in full-stack development with React, Node.js, and AWS.

🚀 Key Achievements:
• Architected and deployed microservices handling 1M+ daily requests
• Reduced infrastructure costs by 40% through AWS optimization
• Led team of 5 developers in successful product launches

💡 Core Expertise:
Cloud Architecture | Scalable Systems | Microservices | CI/CD | Agile Development

🔧 Tech Stack:
React, Node.js, TypeScript, AWS, Docker, Kubernetes, MongoDB, PostgreSQL

Always excited to tackle challenging problems and build innovative solutions that make a difference.`,
          experienceBullets: [
            '• Architected and deployed cloud-native microservices architecture handling 1M+ daily requests with 99.9% uptime',
            '• Led migration from monolithic to microservices architecture, reducing deployment time by 70%',
            '• Implemented CI/CD pipelines using GitHub Actions and AWS, enabling 20+ deployments per week',
            '• Optimized AWS infrastructure, reducing monthly costs by 40% ($50k savings annually)',
            '• Mentored 5 junior developers, improving team velocity by 35%',
          ],
          suggestedSkills: [
            'Kubernetes',
            'Docker',
            'Microservices Architecture',
            'CI/CD',
            'DevOps',
            'GraphQL',
            'REST APIs',
            'Agile Methodologies',
            'Cloud Architecture',
            'System Design',
          ],
        },
        seoScore: {
          total: 78,
          breakdown: {
            keywords: 72,
            structure: 85,
            completeness: 80,
            gaps: 75,
          },
        },
      });
      setIsAnalyzing(false);
      nextStep();
    }, 3000);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Connect' },
      { number: 2, label: 'Target Info' },
      { number: 3, label: 'Analysis' },
      { number: 4, label: 'Results' },
      { number: 5, label: 'Modules' },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.number}
                </div>
                <span className="text-sm mt-2 text-gray-600">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Step 1: Connect LinkedIn or Manual Entry
  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your LinkedIn Profile</h2>
      <p className="text-gray-600 mb-8">
        Choose how you'd like to provide your LinkedIn profile information.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn OAuth Option */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect via LinkedIn</h3>
            <p className="text-sm text-gray-600 mb-4">
              Automatically import your profile data in seconds
            </p>
            <button
              onClick={handleLinkedInConnect}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect LinkedIn
            </button>
          </div>
        </div>

        {/* Manual/Paste Option */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-600 transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Paste Profile Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Copy and paste your LinkedIn profile information
            </p>
            <button
              onClick={handleManualEntry}
              className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Manual Entry
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Safe Fallback:</strong> Both methods work perfectly. Connecting via LinkedIn is
          faster, but manual entry gives you full control over what data is analyzed.
        </p>
      </div>
    </div>
  );

  // Step 2: Target Profile Information
  const renderStep2 = () => {
    if (data.connectionMethod === 'linkedin' && data.currentProfileData) {
      return (
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Profile Retrieved</h2>
          <p className="text-gray-600 mb-6">
            We've retrieved your LinkedIn profile. Now tell us about your target role.
          </p>

          {/* Current Profile Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-semibold">Profile Connected Successfully!</span>
            </div>
            <div className="ml-9 text-sm text-green-700">
              <p className="mb-1"><strong>Current Headline:</strong> {data.currentProfileData.headline}</p>
              <p><strong>Skills:</strong> {data.currentProfileData.skills.join(', ')}</p>
            </div>
          </div>

          {renderTargetInfoForm()}
        </div>
      );
    }

    // Manual entry
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Your Current Profile</h2>
        <p className="text-gray-600 mb-6">
          Paste your current LinkedIn profile information and target role details.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Headline
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer | Full Stack Developer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current About Section
            </label>
            <textarea
              placeholder="Paste your current about/summary section..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., React, Node.js, Python, AWS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="border-t border-gray-300 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Role Information</h3>
            {renderTargetInfoForm()}
          </div>
        </form>
      </div>
    );
  };

  const renderTargetInfoForm = () => (
    <>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.targetRole}
            onChange={(e) => setData({ ...data, targetRole: e.target.value })}
            placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => setData({ ...data, location: e.target.value })}
              placeholder="e.g., San Francisco, Remote, New York"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.industry}
              onChange={(e) => setData({ ...data, industry: e.target.value })}
              placeholder="e.g., Technology, Finance, Healthcare"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level <span className="text-red-500">*</span>
          </label>
          <select
            value={data.experienceLevel}
            onChange={(e) => setData({ ...data, experienceLevel: e.target.value as LinkedInData['experienceLevel'] })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select experience level</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior Level (6-10 years)</option>
            <option value="executive">Executive Level (10+ years)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Skills <span className="text-gray-500">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Kubernetes, Machine Learning, Product Strategy (comma-separated)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Skills you want to highlight or acquire for your target role
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleStartAnalysis}
          disabled={!data.targetRole || !data.location || !data.industry || !data.experienceLevel}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Start Analysis
        </button>
      </div>
    </>
  );

  // Step 3: Analysis in Progress
  const renderStep3 = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Profile</h2>
      <p className="text-gray-600 mb-8">
        Our AI is working hard to optimize your LinkedIn profile for maximum impact.
      </p>

      {/* Analysis Steps */}
      <div className="space-y-6">
        {/* Competitor Discovery */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? (
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                A) Competitor Discovery
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Using Tavily AI to find and analyze 30 top LinkedIn profiles matching your target role, location, and industry.
              </p>
              {data.competitorProfiles && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                  ✓ Found {data.competitorProfiles.count} top profiles and extracted key insights
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Keyword Mapping */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? (
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                B) Keyword Map Creation
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Identifying industry, role, location, and skill-specific keywords from top performers.
              </p>
              {data.keywordMap && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                  ✓ Created comprehensive keyword map with {data.keywordMap.industryKeywords.length + data.keywordMap.roleKeywords.length + data.keywordMap.skillKeywords.length} keywords
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? (
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                C) Gap Analysis
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Comparing your profile against top competitors to identify improvement opportunities.
              </p>
              {data.gapAnalysis && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                  ✓ Identified {data.gapAnalysis.missingKeywords.length} missing keywords and optimization opportunities
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Optimization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? (
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                D) AI Optimization
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Generating optimized content for headline, about section, experience bullets, and skill suggestions.
              </p>
              {data.optimizedContent && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                  ✓ Generated optimized profile content with keyword-rich sections
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">This may take 30-60 seconds...</p>
        </div>
      )}
    </div>
  );

  // Step 4: Optimization Results
  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Optimized LinkedIn Profile</h2>
      <p className="text-gray-600 mb-8">
        Here's your AI-optimized profile content based on competitor analysis and SEO best practices.
      </p>

      {/* SEO Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 mb-8 text-white">
        <div className="text-center mb-6">
          <h3 className="text-xl mb-2">Your LinkedIn SEO Score</h3>
          <div className="text-7xl font-bold mb-2">{data.seoScore?.total}/100</div>
          <p className="text-blue-100">
            {data.seoScore && data.seoScore.total >= 80
              ? 'Excellent! Your profile is highly optimized'
              : data.seoScore && data.seoScore.total >= 60
              ? 'Good! Room for improvement'
              : 'Needs work - Follow our recommendations'}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{data.seoScore?.breakdown.keywords}</div>
            <div className="text-sm text-blue-100">Keywords</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.seoScore?.breakdown.structure}</div>
            <div className="text-sm text-blue-100">Structure</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.seoScore?.breakdown.completeness}</div>
            <div className="text-sm text-blue-100">Completeness</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.seoScore?.breakdown.gaps}</div>
            <div className="text-sm text-blue-100">Gap Score</div>
          </div>
        </div>
      </div>

      {/* Optimized Content */}
      <div className="space-y-6">
        {/* Optimized Headline */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">📝 Optimized Headline</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <p className="text-gray-900">{data.optimizedContent?.headline}</p>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Why this works:</strong> Includes target role, key skills, certifications, and industry keywords for maximum searchability.
          </div>
        </div>

        {/* Optimized About */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">✍️ Optimized About Section</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <pre className="whitespace-pre-wrap text-gray-900 font-sans text-sm">
              {data.optimizedContent?.about}
            </pre>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Why this works:</strong> Structured with achievements, emoji bullets for readability, quantifiable metrics, and keyword density.
          </div>
        </div>

        {/* Optimized Experience Bullets */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">💼 Optimized Experience Bullets</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Copy All
            </button>
          </div>
          <div className="bg-gray-50 rounded p-4 space-y-2">
            {data.optimizedContent?.experienceBullets.map((bullet, index) => (
              <div key={index} className="text-gray-900 text-sm">
                {bullet}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Why this works:</strong> Action verbs, quantifiable results, technical keywords, and business impact.
          </div>
        </div>

        {/* Suggested Skills */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Suggested Skills to Add</h3>
          <div className="flex flex-wrap gap-2">
            {data.optimizedContent?.suggestedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <strong>Why these skills:</strong> Based on competitor analysis and industry trends for your target role.
          </div>
        </div>

        {/* Gap Analysis */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">⚠️ Key Gaps Identified</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Missing Keywords:</strong> {data.gapAnalysis?.missingKeywords.join(', ')}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Comparison:</strong> {data.gapAnalysis?.keywordUsageComparison}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Profile Completeness:</strong> {data.gapAnalysis?.profileCompleteness}% (aim for 90%+)
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
        >
          Back to Analysis
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Extra Modules →
        </button>
      </div>
    </div>
  );

  // Step 5: Extra Modules
  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">LinkedIn Growth Modules</h2>
      <p className="text-gray-600 mb-8">
        Boost your LinkedIn presence with these AI-powered modules for real ranking improvement.
      </p>

      <div className="space-y-6">
        {/* Module 1: Weekly Posting AI */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-600 transition-colors">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Module 1: Weekly Posting AI</h3>
              <p className="text-gray-600 mb-4">
                Get 5 AI-generated post ideas every week tailored to your industry and expertise.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• 5 weekly post ideas based on trending topics</li>
                  <li>• Auto-generated posts with hooks and CTAs</li>
                  <li>• Industry-specific content calendar</li>
                  <li>• Engagement optimization suggestions</li>
                </ul>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Activate Module ($19/month)
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: Engagement AI */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-600 transition-colors">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Module 2: Engagement AI</h3>
              <p className="text-gray-600 mb-4">
                AI-powered comment templates and daily engagement recommendations.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Smart comment templates for different post types</li>
                  <li>• Daily list of posts to engage with</li>
                  <li>• Engagement analytics and tracking</li>
                  <li>• Relationship building strategies</li>
                </ul>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Activate Module ($15/month)
              </button>
            </div>
          </div>
        </div>

        {/* Module 3: Network Growth */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-600 transition-colors">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Module 3: Network Growth</h3>
              <p className="text-gray-600 mb-4">
                Strategic networking recommendations and personalized connection messages.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Daily top people to connect with in your industry</li>
                  <li>• Personalized connection request messages</li>
                  <li>• Follow-up message templates</li>
                  <li>• Network growth analytics</li>
                </ul>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Activate Module ($15/month)
              </button>
            </div>
          </div>
        </div>

        {/* Bundle Offer */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">All Modules Bundle</h3>
            <p className="text-blue-100 mb-4">
              Get all 3 modules at a discounted price
            </p>
            <div className="text-5xl font-bold mb-2">
              $39<span className="text-2xl">/month</span>
            </div>
            <p className="text-sm text-blue-100 mb-4">Save $10/month (20% off)</p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Activate All Modules
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-6 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
        >
          Back to Results
        </button>
        <button
          onClick={() => navigate('/user/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Complete & Go to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout onLogout={handleLogout}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn Profile Optimizer</h1>
        <p className="text-gray-600 mb-8">
          AI-powered LinkedIn optimization using competitor analysis and industry insights
        </p>

        {renderStepIndicator()}

        <div className="bg-gray-50 rounded-lg p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LinkedInToolPage;
