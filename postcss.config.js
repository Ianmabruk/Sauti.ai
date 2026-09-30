/**
 * PostCSS configuration.
 *
 * Required for Tailwind to compile: Next.js runs PostCSS on every stylesheet,
 * and this is the wiring that injects the Tailwind plugin plus vendor
 * prefixing. Not listed in the spec's tree, but the build fails without it.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};