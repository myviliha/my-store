/**
 * The storefront, standalone.
 *
 * The version inside the monorepo pins `outputFileTracingRoot` three levels up, because Next walks
 * upward looking for a lockfile and can land on `$HOME`. There is no monorepo here, so that pin is
 * gone and everything else is the same.
 *
 * **No `output: "export"`.** Server Actions, route handlers and `next/image` optimisation are all
 * on the roadmap and an export can run none of them. Static *rendering* is still the default: the
 * page avoids dynamic functions, so Next prerenders it at build.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
