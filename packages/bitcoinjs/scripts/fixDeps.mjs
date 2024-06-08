import { readFileSync, writeFileSync, } from 'fs';

let packagex = JSON.parse(readFileSync("package.json"), { encoding: 'utf8' });
let npmshrink = readFileSync("npm-shrinkwrap.json", { encoding: 'utf8' });
writeFileSync("npm-shrinkwrap.json.old", npmshrink);
npmshrink = JSON.parse(npmshrink);
let vitePack = {
    "name": "vite-compatible-readable-stream",
    "version": "3.6.0",
    "resolved": "https://registry.npmjs.org/vite-compatible-readable-stream/-/vite-compatible-readable-stream-3.6.0.tgz",
    "integrity": "sha512-A7PEC42vV49U4VyXEE9Ibx/damN8mghNnHmB5L65HlKktbrd4eXzhQurL9xkkFU5ttRPSxGum0m6i07AifVBFw==",
    "dependencies": {
        "inherits": "^2.0.3",
        "string_decoder": "^1.1.1",
        "util-deprecate": "^1.0.1"
    },
    "engines": {
        "node": ">= 6"
    }
};
for (let key in npmshrink.packages) {
    if (~key.indexOf('readable-stream')) {
        npmshrink.packages[key] = vitePack;
    } else if (npmshrink.packages[key]?.dependencies?.hasOwnProperty("readable-stream")) {
        npmshrink.packages[key].dependencies["readable-stream"] = packagex.dependencies["readable-stream"];
    }
}

writeFileSync("npm-shrinkwrap.json", JSON.stringify(npmshrink, null, 4));