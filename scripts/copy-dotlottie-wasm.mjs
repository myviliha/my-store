/**
 * Copies the dotLottie renderer (WebAssembly) into `public/` so the site serves it itself.
 *
 * `@lottiefiles/dotlottie-web` fetches `dotlottie-player.wasm` from jsDelivr, then unpkg, unless
 * told otherwise. That is a third-party request in the hero for every visitor, which this store
 * avoids elsewhere (fonts are self-hosted for the same reason). `hello-bot.tsx` points the player at
 * `/lottieAnimations/dotlottie-player.wasm` with `setWasmUrl`, and this script puts that file there.
 *
 * **Copied, not committed.** The wasm must be the exact build of the installed player, so it is
 * taken from `node_modules` on every install (`postinstall`) and ignored by git, and the player's
 * version is pinned exactly in `package.json` so the two cannot drift apart.
 */
import { copyFileSync, existsSync, mkdirSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Where a package is installed, found the way Node finds it: `node_modules/<name>` in each folder
 * from `from` upwards. `require.resolve("<pkg>/package.json")` cannot be used, because neither
 * package lists `./package.json` in its `exports`. `realpathSync` follows pnpm's symlinks, so a
 * dependency of a dependency is found beside it in pnpm's store, as Node would find it.
 */
const packageDir = (name, from) => {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return realpathSync(candidate);
    if (dirname(dir) === dir) throw new Error(`dotlottie: cannot find ${name} from ${from}`);
  }
};

/* `dotlottie-web` is a dependency of `dotlottie-react`, not of this package, so look from there. */
const react = packageDir("@lottiefiles/dotlottie-react", root);
const web = packageDir("@lottiefiles/dotlottie-web", react);

const from = join(web, "dist", "dotlottie-player.wasm");
const to = join(root, "public", "lottieAnimations", "dotlottie-player.wasm");
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log(`dotlottie: copied renderer to ${to.replace(`${root}/`, "")}`);
