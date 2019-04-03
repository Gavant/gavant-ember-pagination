/* eslint-disable node/no-unsupported-features, no-console */
'use strict';
/* eslint-disable node/no-unpublished-require */
const generateChangelog = require('ember-cli-changelog/lib/tasks/release-with-changelog');

module.exports = {
  publish: true,
  beforeCommit: generateChangelog
};
