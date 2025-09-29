#!/bin/bash

# Install Tailwind CSS and dependencies
echo "Installing Tailwind CSS and dependencies..."
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind (if not already done)
echo "Initializing Tailwind CSS..."
npx tailwindcss init -p

echo "Tailwind CSS installation complete!"
echo "You can now run 'npm run dev' to start the development server."
