# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Toshi Moto is a watch-only Bitcoin wallet aggregator app for [Umbrel](https://umbrel.com/). It's built as an Nx monorepo with a React frontend and NestJS backend.

## Development Commands

```bash
# Start development (both frontend and backend)
pnpm dev

# Start individual services
pnpm dev:ui          # Frontend only (React/Vite on port 5173)
pnpm dev:api         # Backend only (NestJS)
pnpm dev:mongo       # MongoDB database

# Build
pnpm build           # Build web-ui for production
pnpm build:api       # Build api for production
pnpm build:umbrel    # Build web-ui for Umbrel platform
pnpm build:docker    # Build Docker containers

# Testing
pnpm test            # Run web-ui tests (Vitest)
cd apps/web-ui && pnpm test           # Run a single test file with pattern matching
cd apps/web-ui && pnpm exec vitest run src/path/to/test.spec.ts  # Run specific test

# Storybook
cd apps/web-ui && pnpm storybook      # Component development (port 6006)

# E2E tests
cd apps/web-ui && pnpm exec playwright test
```

## Architecture

```
apps/
├── web-ui/          # React 19 frontend (Vite, Tailwind, Redux Toolkit)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── screens/      # Page components
│   │   ├── lib/          # Utilities
│   │   ├── models/       # Data models
│   │   ├── providers/    # Context providers
│   │   └── sw.ts         # Service worker (PWA)
│   └── e2e/              # Playwright tests
├── api/             # NestJS backend (MongoDB/Mongoose)
│   └── src/
│       ├── app/          # NestJS modules
│       └── middleware/   # Express middleware
└── docs/            # Documentation site

packages/
├── toshi-proxy/     # Custom proxy package
└── scripts/         # Build/deployment scripts
```

## Tech Stack

**Frontend**: React 19, Vite, Tailwind CSS, Redux Toolkit, React Router, XState, D3
**Backend**: NestJS, MongoDB, Mongoose, Express
**Testing**: Vitest (frontend), Jest (backend), Playwright (E2E), Storybook
**Build**: Nx 21, pnpm, TypeScript (strict mode)

## Key Requirements

- **Always use pnpm** - never npm or yarn
- **Node 20.11.0** required (enforced via Volta)
- **Git submodules** - clone with `git clone --recurse-submodule`
- **Conventional commits** - enforced via commitlint/husky
- **Docker multi-platform** - builds target ARM64 and AMD64 for Umbrel

## State Management

- Redux Toolkit for global state (`apps/web-ui/src/`)
- XState for complex state machines
- Custom Bitcoin library: `@toshimoto821/bitcoinjs`

## Deployment

- Primary target: Umbrel OS
- Community app store: https://github.com/toshimoto821/toshimoto-app-store
- Docker containers published to Docker Hub (toshimoto821 namespace)
