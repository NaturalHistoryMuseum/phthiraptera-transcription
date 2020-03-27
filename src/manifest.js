const path = require('path');
const fs = require('fs');

// Manifest file that maps source components to build assets
const manifestPath = path.resolve(__dirname, '../dist/manifest.json');

/**
 * Write output bundles to manifest file
 * @param {object} node
 * @param {object} browser
 */
function writeManifest({ node, browser }) {
  [node, browser] = [node, browser].map(b =>
    Object.fromEntries(Array.from(b.childBundles).map(b => [
      b.entryAsset.name,
      {
        file: b.name,
        styles: Array.from(b.childBundles).filter(b => b.type == 'css').map(b => b.name)
      }
    ])
  ));
	fs.writeFileSync(manifestPath, JSON.stringify({ node, browser }, null, 2));
	delete require.cache[manifestPath];
}

/**
 * Return component, styles and client file
 * for a given entry file
 * @param {String} sourceFile
 */
function readManifest(sourceFile) {
	const manifest = require(manifestPath);
	const { file } = manifest.node[sourceFile];
	const Component = require(file).default;

	const { styles, file: clientFile } = manifest.browser[sourceFile];
	return { Component, styles, clientFile };
}

module.exports = {
	writeManifest,
	readManifest
};
