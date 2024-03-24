import { links } from "./links.json";

const nodes = Array.from(
  new Set(links.flatMap((l: any) => [l.source, l.target])),
  (name) => {
    console.log(name);
    return { name, category: name.replace(/ .*/, "") };
  }
);

console.log(nodes);
export { nodes, links };
