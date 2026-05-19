const { Country, State } = require('country-state-city');

const rawCountries = Country.getAllCountries();
const COUNTRIES = rawCountries.map(c => {
  if (c.isoCode === 'US') return 'United States of America';
  return c.name;
}).sort();

console.log('Total countries:', COUNTRIES.length);
console.log('Nigeria states count:', State.getStatesOfCountry('NG').length);
console.log('US states count:', State.getStatesOfCountry('US').length);
