import { Country, State } from 'country-state-city';

const rawCountries = Country.getAllCountries();

export const COUNTRIES = rawCountries.map(c => {
  if (c.isoCode === 'US') return 'United States of America';
  return c.name;
}).sort();

export const STATES_BY_COUNTRY: Record<string, string[]> = {};

rawCountries.forEach(c => {
  const name = c.isoCode === 'US' ? 'United States of America' : c.name;
  const states = State.getStatesOfCountry(c.isoCode);
  STATES_BY_COUNTRY[name] = states.map(s => s.name);
});

export const CITIES_BY_STATE: Record<string, string[]> = {};
