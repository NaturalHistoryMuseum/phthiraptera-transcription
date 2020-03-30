import data from '../data/form.json';

const getJson = file => fetch(file).then(async res => [...new Set(await res.json())]);

const getCountries = () => getJson('./countries.json');
const getHosts = () => getJson('./hosts.json');

const { localities, typeStatuses, hostTypes } = data;

export {
  getCountries, localities, getHosts, typeStatuses, hostTypes
};
