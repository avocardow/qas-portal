# TailAdmin Pro - Next.js (v2.0)

[![Vercel Deployment Status](https://vercel.com/avocardow/qas-portal/badge.svg)](https://vercel.com/avocardow/qas-portal)
**✅ Sign-in and callback URL verified working**

[TailAdmin](https://tailadmin.com) is a modern, responsive, and customizable admin dashboard template built using
Tailwind CSS and Next.js. It is designed to help developers build beautiful and functional dashboards quickly and
easily.

## Quick Links

- [✨ Visit Website](https://tailadmin.com)
- [📄 Documentation](https://tailadmin.com/docs)
- [⬇️ Download](https://tailadmin.com/download)
- [🌐 Live Site](https://nextjs-demo.tailadmin.com)

## Installation

### Prerequisites

To get started with TailAdmin, ensure you have the following prerequisites installed and set up:

- Node.js 18.x or later (recommended to use Node.js 20.x or later)

### Getting Started

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

   > Use `--legacy-peer-deps` flag if you face peer-dependency error during installation.

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Environment Variables

Copy `.env.example` to `.env.local` in the project root and fill in the following variables:

- ANTHROPIC_API_KEY (Required)
- PERPLEXITY_API_KEY (Optional)
- MODEL (e.g., claude-3-opus-20240229)
- PERPLEXITY_MODEL (Optional)
- MAX_TOKENS (e.g., 64000)
- TEMPERATURE (e.g., 0.2)
- DEBUG (true/false)
- LOG_LEVEL (debug | info | warn | error)
- DEFAULT_SUBTASKS (e.g., 5)
- DEFAULT_PRIORITY (high | medium | low)
- PROJECT_NAME (e.g., qas-portal)
- DATABASE_URL (Your PostgreSQL connection string)
- DIRECT_URL (Alternate DB connection string)
- NEXT_PUBLIC_SUPABASE_URL (Your Supabase project URL, e.g., `https://<project>.supabase.co`)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (Your Supabase anonymous public API key for client-side usage)
- NEXTAUTH_SECRET (Secret for NextAuth)
- AZURE_AD_CLIENT_ID
- AZURE_AD_CLIENT_SECRET
- AZURE_AD_TENANT_ID

### Vercel Deployment

For Vercel deployments, configure these variables under Settings > Environment Variables in your Vercel project. Ensure `.env.local` is added to `.gitignore` to prevent committing secrets.

### GitHub Actions Secrets

To enable the GitHub Actions CI workflow, add the following secrets in your repository (Settings > Secrets > Actions):

- NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL (e.g., `https://<project>.supabase.co`)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous public API key
- DATABASE_URL: Your PostgreSQL connection string (pooled)
- DIRECT_URL: Your direct DB connection string

### Security Best Practices for CI

- Avoid using `echo`, `printenv`, or `env` commands to output secrets in workflow logs.
- GitHub Actions automatically masks secrets stored in `Settings > Secrets`; do not store secrets in plain text.
- Do not enable verbose or debug flags (e.g., `set -x`) in run steps, as this may expose commands and environment variables.
- Always use the `env:` block or `secrets` context to reference credentials rather than embedding them directly in commands.

## Changelog

### Version 2.1.1 - [March 25, 2025]

- Updated to Next v15.2.3 for [CVE-2025-29927](https://nextjs.org/blog/cve-2025-29927) concerns
- Included overrides vectormaps for packages to prevent peer dependency errors during installation.
- Migrated from react-flatpickr to flatpickr package for React 19 support

### Version 2.1.0 - [March 10, 2025]

#### Update Overview

- Added new dashboard design for saas product.
- New Metrics card
- Product performance tab with charts

### Version 2.0.1 - [February 27, 2025]

#### Update Overview

- Upgraded to Tailwind CSS v4 for better performance and efficiency.
- Updated class usage to match the latest syntax and features.
- Replaced deprecated class and optimized styles.

#### Next Steps

- Run npm install or yarn install to update dependencies.
- Check for any style changes or compatibility issues.
- Refer to the Tailwind CSS v4 [Migration Guide](https://tailwindcss.com/docs/upgrade-guide) on this release. if needed.
- This update keeps the project up to date with the latest Tailwind improvements. 🚀

### v2.0.0 (February 2025)

A major update focused on Next.js 15 implementation and comprehensive redesign.

#### Major Improvements

- Complete redesign using Next.js 15 App Router and React Server Components
- Enhanced user interface with Next.js-optimized components
- Improved responsiveness and accessibility
- New features including collapsible sidebar, chat screens, and calendar
- Redesigned authentication using Next.js App Router and server actions
- Updated data visualization using ApexCharts for React

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

#### Breaking Changes

- Migrated from Next.js 14 to Next.js 15
- Chart components now use ApexCharts for React
- Authentication flow updated to use Server Actions and middleware

[Read more](https://tailadmin.com/docs/update-logs/nextjs) on this release.

### v1.3.4 (July 01, 2024)

- Fixed JSvectormap rendering issues

### v1.3.3 (June 20, 2024)

- Fixed build error related to Loader component

### v1.3.2 (June 19, 2024)

- Added ClickOutside component for dropdown menus
- Refactored sidebar components
- Updated Jsvectormap package

### v1.3.1 (Feb 12, 2024)

- Fixed layout naming consistency
- Updated styles

### v1.3.0 (Feb 05, 2024)

- Upgraded to Next.js 14
- Added Flatpickr integration
- Improved form elements
- Enhanced multiselect functionality
- Added default layout component

## License

Refer to our [LICENSE](https://tailadmin.com/license) page for more information.
