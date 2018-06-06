const getJson = file => fetch(file).then(res => res.json());

const getCountries = () => getJson('./countries.json');
const getHosts = () => getJson('./hosts.json');

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
  getCountries, localities, getHosts, typeStatuses
}
