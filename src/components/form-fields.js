const countries = require('./countries.json');
const hosts = require('./hosts.json');

const localities = ['Location', 'Unreadable', 'Zoo', 'Museum', 'Unlikely host range (bred, lab, introduced)'];
const typeStatuses = [
  'Allotype',
  'Holotype',
  'Lectotype',
  'Neotype',
  'Paralectotype',
  'Paratype',
  'Syntype',
  '*Other'
]

module.exports = {
  countries, localities, hosts, typeStatuses
}
