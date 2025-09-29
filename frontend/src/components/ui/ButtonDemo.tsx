import React, { useState } from 'react';
import { Button, SignInButton, GetStartedButton, AuthButtonGroup } from './index';

const ButtonDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Auth Button Group - Matching your design */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Auth Button Group</h3>
          <p className="text-gray-600">Matching the Sign In / Get Started design</p>
        </div>
        <div className="flex justify-center">
          <AuthButtonGroup
            onSignIn={() => console.log('Sign In clicked')}
            onGetStarted={() => console.log('Get Started clicked')}
            signInLoading={loading}
            getStartedLoading={loading}
          />
        </div>
      </div>

      {/* Individual Buttons */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Individual Button Components</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <SignInButton onClick={() => console.log('Sign In')} />
            <GetStartedButton onClick={() => console.log('Get Started')} />
          </div>
        </div>
      </div>

      {/* Button Variants */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Button Variants</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Button Sizes</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Loading States</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button loading>Loading Button</Button>
            <Button variant="secondary" loading>Secondary Loading</Button>
            <Button variant="outline" loading>Outline Loading</Button>
          </div>
          <Button onClick={handleLoadingDemo} className="btn-primary">
            {loading ? 'Loading...' : 'Trigger Loading Demo'}
          </Button>
        </div>
      </div>

      {/* With Icons */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Buttons with Icons</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button leftIcon={<span>🔐</span>}>Sign In</Button>
            <Button rightIcon={<span>→</span>}>Get Started</Button>
            <Button leftIcon={<span>📧</span>} rightIcon={<span>→</span>}>
              Send Email
            </Button>
          </div>
        </div>
      </div>

      {/* Full Width */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Full Width Buttons</h3>
        </div>
        <div className="space-y-3">
          <Button fullWidth>Full Width Primary</Button>
          <Button variant="outline" fullWidth>Full Width Outline</Button>
        </div>
      </div>
    </div>
  );
};

export default ButtonDemo;
