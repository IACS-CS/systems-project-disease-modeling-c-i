import { shufflePopulation } from "../../lib/shufflePopulation";

/* For this simulation, we're modeling Ebola */

/**
 * Authors: Angel Devia 
 * 
 * What we are simulating: Ebola Virus Disease (EVD)
 * Key features modeled: 
 * 1. Direct contact transmission
 * 2. Long incubation period (symptoms show after infection)
 * 3. High fatality rate (death chance)
 * 4. Quarantine effects
 */

// Default parameters for the disease
export const defaultSimulationParameters = {
  infectionChance: 50, // Chance of infection with direct contact
  recoveryChance: 40, // Probability of recovering per round
  quarantineChance: 30, // Probability of being quarantined per round
  quarantineDuration: 240, // 2 minutes ~ 240 rounds
  deathChance: 50, // Fatality rate of 50% for infected individuals (approximate for Ebola)
  incubationPeriod: 5, // Days before showing symptoms (infectious stage starts after this period)
};

// Create a population for the simulation
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
      daysUntilSymptoms: Math.floor(Math.random() * defaultSimulationParameters.incubationPeriod),
      inQuarantine: false,
      quarantineTime: 0,
    });
  }
  // Select a patient zero (initial infected person)
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

// Function to update an individual's state
const updateIndividual = (person, contact, params) => {
  if (person.infected) {
    person.daysInfected += 1;
    // Death chance: if the person is infected for long enough, they might die
    if (Math.random() * 100 < params.deathChance) {
      person.infected = false; // This person dies
      person.daysInfected = -1; // Mark as dead (we use -1 as a "dead" status)
    } else if (person.daysInfected >= params.incubationPeriod) {
      // After incubation period, person starts showing symptoms and becomes infectious
      // Recovery logic after showing symptoms
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
  }

  // Quarantine logic (no infection spreading while in quarantine)
  if (person.inQuarantine) {
    person.quarantineTime -= 1;
    if (person.quarantineTime <= 0) {
      person.inQuarantine = false;
    }
    return; // If in quarantine, no spreading occurs
  }

  // Check if contact is infected, and if so, try to infect the person
  if (contact.infected && !contact.inQuarantine) {
    if (Math.random() * 100 < params.infectionChance) {
      person.infected = true;
      person.daysInfected = 1; // Set the infected day to 1
      person.daysUntilSymptoms = Math.floor(Math.random() * params.incubationPeriod);
    }
  }
};

// Main function to update the population state
export const updatePopulation = (population, params) => {
  population = shufflePopulation(population); // Shuffle population for randomness
  for (let i = 0; i < population.length; i++) {
    let p = population[i];
    let contact = population[(i + 1) % population.length]; // Contacting the next person in the shuffled list
    updateIndividual(p, contact, params);
  }
  return population;
};

// Function to track various stats in the simulation (infected, recovered, dead, etc.)
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "In Quarantine", value: "inQuarantine" },
  { label: "Recovered", value: "recovered" },
  { label: "Dead", value: "dead" }, // Added for tracking dead people
];

// Function to compute the current statistics of the population
export const computeStatistics = (population, round) => {
  let infected = 0;
  let inQuarantine = 0;
  let recovered = 0;
  let dead = 0;
  for (let p of population) {
    if (p.infected && p.daysInfected > 0 && p.daysInfected < defaultSimulationParameters.incubationPeriod) {
      infected += 1;
    }
    if (p.inQuarantine) inQuarantine += 1;
    if (!p.infected && p.daysInfected > 0) recovered += 1;
    if (p.daysInfected === -1) dead += 1; // Track deaths
  }
  return { round, infected, inQuarantine, recovered, dead }; // Return dead count in stats
};

// In this code I used IA help to the mosth part of the code, put with the compromise to understand the code and the logic behind it.
// GPT-4 and GPT-3


