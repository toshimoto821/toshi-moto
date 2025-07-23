import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Watch-Only Security",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Toshi Moto is a watch-only wallet, meaning your private keys never leave
        your device. This provides maximum security while still allowing you to
        monitor your Bitcoin holdings.
      </>
    ),
  },
  {
    title: "Umbrel Integration",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Built specifically for the Umbrel ecosystem, Toshi Moto integrates
        seamlessly with your Umbrel node and other Bitcoin applications in your
        stack.
      </>
    ),
  },
  {
    title: "Privacy Focused",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Designed with privacy in mind, Toshi Moto helps you understand your
        Bitcoin transactions while maintaining your financial privacy and
        sovereignty.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
