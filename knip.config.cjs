module.exports = {
  entry: ['worker.mjs'],
  // empty.cjs is referenced from wrangler.toml's [alias] block, which knip does
  // not parse; knip.config.cjs is knip's own config. Neither is dead.
  ignore: ['empty.cjs', 'knip.config.cjs'],
};
