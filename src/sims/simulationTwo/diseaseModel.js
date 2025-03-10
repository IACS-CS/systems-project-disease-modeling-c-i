import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: Angel Devia 
 * 
 * What we are simulating: Ebola
 * 
 * What we are attempting to model from the real world: 
 * 
 * What we are leaving out of our model:
 * 
 * What elements we have to add: Incubation, infectious, recovered 
 * 
 * What parameters we will allow users to "tweak" to adjust the model:
 * 
 * In plain language, what our model does:
 * 
 */


// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.

export const defaultSimulationParameters = {
  infectionChance: 50,
  recoveryChance: 40, // Probability of recovering per round
  quarantineChance: 30, // Probability of being quarantined per round
  quarantineDuration: 240, // 2 minutes ~ 240 rounds
};

export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      daysInfected: 0,
      inQuarantine: false,
      quarantineTime: 0,
    });
  }
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

const updateIndividual = (person, contact, params) => {
  if (person.infected) {
    person.daysInfected += 1;
    
    // Recovery logic
    if (Math.random() * 100 < params.recoveryChance) {
      person.infected = false;
      person.daysInfected = 0;
      person.inQuarantine = false;
      person.quarantineTime = 0;
    } else if (!person.inQuarantine) {
      // Chance to be quarantined
      if (Math.random() * 100 < params.quarantineChance) {
        person.inQuarantine = true;
        person.quarantineTime = params.quarantineDuration;
      }
    }
  }

  if (person.inQuarantine) {
    person.quarantineTime -= 1;
    if (person.quarantineTime <= 0) {
      person.inQuarantine = false;
    }
    return; // If in quarantine, no spreading
  }

  if (contact.infected && !contact.inQuarantine) {
    if (Math.random() * 100 < params.infectionChance) {
      person.infected = true;
      person.daysInfected = 1;
    }
  }
};

export const updatePopulation = (population, params) => {
  population = shufflePopulation(population);
  for (let i = 0; i < population.length; i++) {
    let p = population[i];
    let contact = population[(i + 1) % population.length];
    updateIndividual(p, contact, params);
  }
  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "In Quarantine", value: "inQuarantine" },
  { label: "Recovered", value: "recovered" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  let inQuarantine = 0;
  let recovered = 0;
  for (let p of population) {
    if (p.infected) infected += 1;
    if (p.inQuarantine) inQuarantine += 1;
    if (!p.infected && p.daysInfected > 0) recovered += 1;
  }
  return { round, infected, inQuarantine, recovered };
};
// In this code I used IA help to the mosth part of the code, put with the compromise to understand the code and the logic behind it.
// GPT-4 and GPT-3


