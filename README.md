![CI](https://github.com/toshimoto821/toshi-moto/actions/workflows/main.yml/badge.svg)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

# Toshi Moto

![logo](./docs/assets/toshi-256.svg)

Toshi Moto is a watch only bitcoin wallet aggregator app for [Umbrel](https://umbrel.com/).

# Screenshots

![1](./docs/assets/1.png)

---

![2](./docs/assets/2.png)

---

![3](./docs/assets/3.png)

## Application Architecture

![architecture](./docs/assets/architecture.png?bust=2)

## Development

This repo contains a git submodule so you need to clone it like below with the following flag:

### Cloning this repo

```bash
git clone --recurse-submodule git@github.com:toshimoto821/toshi-moto.git
```

### Install and start

This repo uses a pnpm workspace:

```
pnpm install
pnpm dev
```

## Umbrel

This app is in the App submission process with Umbrel. You can install it on an Umbrel using the [community-app store](https://github.com/toshimoto821/toshimoto-app-store) I maintain for frequent releases.

copy and paste the url below to "Add" and then select "Open"

```text
https://github.com/toshimoto821/toshimoto-app-store
```

![community-app-store](./docs/assets/community-app-store.png)

# Developer Setup

How to run the app locally

```bash
npm run dev:mongo # start the mongo db
npm run dev:api # start the api
npm run dev:ui # start the ui
```

## Credits

This app was created by the team at [Webshot Archive](https://www.webshotarchive.com/?utm_source=github.com&utm_medium=referral&utm_campaign=open-source), a developer tool for comparing changes using screenshots from E2E tests. During the development of this app, we wanted a better way to visualize our UI changes as they occurred and track them over time.

## License

This software is licensed under the Apache 2.0 License
