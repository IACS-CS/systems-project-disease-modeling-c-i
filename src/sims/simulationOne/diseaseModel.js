import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, let's consider a simple disease that spreads through contact.
You can implement a simple model which does one of the following:

1. Model the different effects of different numbers of contacts: in my Handshake Model, two people are in 
   contact each round. What happens if you put three people in contact? Four? Five? Consider different options
   such as always putting people in contact with the people "next" to them (i.e. the people before or after them
   in line) or randomly selecting people to be in contact (just do one of these for your model).

2. Take the "handshake" simulation code as your model, but make it so you can recover from the disease. How does the
spread of the disease change when you set people to recover after a set number of days.

3. Add a "quarantine" percentage to the handshake model: if a person is infected, they have a chance of being quarantined
and not interacting with others in each round.

*/

/**
 * Authors: Angel 
 * 
 * What we are simulating: I am modeling a simulation to how know the ebola affects a communitied 
 * 
 * What elements we have to add: Incubation, infectious, recovered
 * 
 * In plain language, what our model does: Model a disease the Ebola.
 * 
 */



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
