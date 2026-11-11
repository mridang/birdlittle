/**
 * @file Configures knip, which reports unused files, exports and dependencies.
 */
export default {
  ignore: ['empty.cjs', 'src/styles/*.css'],
  ignoreDependencies: [
    /^@semantic-release\//,
    /^@emnapi\//,
    'cloudflare',
    '@nestjs/platform-express',
  ],
};
