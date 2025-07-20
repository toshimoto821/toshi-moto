import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className="hero__title">
            Welcome to{" "}
            <span className="bitcoin-accent">{siteConfig.title}</span>
          </Heading>
          <p className="hero__subtitle">
            A privacy-focused Bitcoin wallet manager designed to help you
            understand and track your Bitcoin holdings with transparency and
            educational tools.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>Watch-only</span>
              <span className={styles.statLabel}>Security First</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>Umbrel</span>
              <span className={styles.statLabel}>Native Support</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>Open Source</span>
              <span className={styles.statLabel}>Transparent</span>
            </div>
          </div>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/intro"
            >
              Get Started
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="https://github.com/toshimoto821/toshi-moto"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function ScreenshotsSection() {
  return (
    <section className={styles.screenshots}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <Heading as="h2" className="text--center">
              Clean, Modern Interface
            </Heading>
            <p
              className="text--center"
              style={{ marginBottom: "3rem", color: "var(--text-secondary)" }}
            >
              Experience Bitcoin wallet management with a beautiful, intuitive
              interface designed for privacy and usability.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col col--4">
            <div className={styles.screenshotCard}>
              <img
                src="/img/1.png"
                alt="Toshi Moto Dashboard"
                className={styles.screenshot}
              />
              <h3>Dashboard Overview</h3>
              <p>
                Monitor your Bitcoin holdings with real-time price data and
                comprehensive analytics.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.screenshotCard}>
              <img
                src="/img/2.png"
                alt="Transaction Details"
                className={styles.screenshot}
              />
              <h3>Transaction Details</h3>
              <p>
                View detailed transaction information with visual flow diagrams
                and comprehensive data.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.screenshotCard}>
              <img
                src="/img/3.png"
                alt="Portfolio Tracking"
                className={styles.screenshot}
              />
              <h3>Portfolio Tracking</h3>
              <p>
                Track your Bitcoin portfolio performance over time with
                interactive charts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section className={styles.architecture}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <Heading as="h2" className="text--center">
              Self-Hosted Architecture
            </Heading>
            <p
              className="text--center"
              style={{ marginBottom: "3rem", color: "var(--text-secondary)" }}
            >
              Built for the Umbrel ecosystem with a secure, self-hosted
              architecture that puts you in control.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col col--12">
            <div className={styles.architectureCard}>
              <img
                src="/img/architecture.png"
                alt="Toshi Moto Architecture"
                className={styles.architectureImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UmbrelSection() {
  return (
    <section className={styles.umbrel}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2">Available on Umbrel</Heading>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
              Install Toshi Moto directly from the Umbrel Community App Store.
              Get started with your Bitcoin wallet management in minutes.
            </p>
            <div className={styles.umbrelButtons}>
              <Link
                className="button button--primary"
                to="https://github.com/toshimoto821/toshimoto-app-store"
              >
                Community App Store
              </Link>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.umbrelCard}>
              <img
                src="/img/community-app-store.png"
                alt="Umbrel Community App Store"
                className={styles.umbrelImage}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Bitcoin Wallet for Umbrel`}
      description="A privacy-focused Bitcoin wallet manager designed to help you understand and track your Bitcoin holdings with transparency and educational tools."
    >
      <HomepageHeader />
      <main>
        <ScreenshotsSection />
        <HomepageFeatures />
        <ArchitectureSection />
        <UmbrelSection />
      </main>
    </Layout>
  );
}
