# Nexus Banking App

A modern, responsive online banking application built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: Account balances, recent transactions, and quick actions
- **Account Management**: View and manage multiple accounts
- **Currency Conversion**: Swap between different currencies
- **Loan Management**: Apply for and manage loans
- **Transaction History**: Complete transaction history and filtering
- **Card Management**: Virtual and physical card management
- **Beneficiaries**: Manage saved payment recipients
- **Reports**: Financial reports and analytics
- **Settings**: Account preferences and security settings
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the web package:
   ```bash
   cd packages/web
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
packages/web/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Sidebar, Navbar, etc.)
│   │   └── dashboard/      # Dashboard-specific components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── lib/                # Utilities and helpers
│   ├── store/              # State management (Zustand)
│   └── assets/             # Static assets
├── public/                 # Public assets
└── dist/                   # Build output (generated)
```

## Deployment

This app is configured for deployment on Vercel. The `vercel.json` in the root configures the build process for the monorepo structure.

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the configuration and deploy

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Uses ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (via ESLint)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
