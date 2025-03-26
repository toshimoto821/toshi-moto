# Toshi Moto

![logo](./docs/assets/toshi-256.svg)

[https://toshimoto.app](https://toshimoto.app)

Toshi Moto is a watch only bitcoin wallet aggregator.

# Screenshots

![1](./docs/assets/1.png)

---

![2](./docs/assets/2.png)

---

![3](./docs/assets/3.png)

## Application Architecture

![architecture](./docs/assets/architecture.png?bust=1)

![cicd](./docs/assets/cicd.png?bust=1)

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

I have yet to submit this app to the official Umbrel App Store. However, you can install it on an Umbrel using the a [toshi-collection community-app store](https://github.com/toshimoto821/toshimoto-app-store).

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

## License

vn
This software is licensed under the PolyForm Noncommercial 1.0.0 license. TL;DR — You're free to use, fork, modify, and redistribute it for personal and nonprofit use under the same license.

![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-%235351FB)
