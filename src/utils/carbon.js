// ─── Carbon Footprint Calculation Utilities ───────────────────────────────────

/**
 * Emission factors used for calculations
 * All results in kg CO2 equivalent per year unless noted
 */
export const EMISSION_FACTORS = {
  car:        0.21,   // kg CO2 per km (average petrol car)
  flight:     255,    // kg CO2 per flight hour
  electricity: 0.233, // kg CO2 per kWh
  cookingGas: 2.0,    // kg CO2 per m³ of natural gas
  diet: {
    vegan:      1500,
    vegetarian: 1700,
    mixed:      2500,
    heavyMeat:  3300,
  },
  shopping: 500,  // kg CO2 per score point (1-5 scale)
  waste:    300,  // kg CO2 per score point (1-5 scale)
  water:    0.376,// kg CO2 per m³
};

/**
 * Global average CO2 per person per year (tonnes)
 */
export const GLOBAL_AVERAGE_TONNES = 4.8;

/**
 * Calculate transportation emissions
 * @param {Object} data - { carKmPerWeek, flightHoursPerYear, publicTransportFreq }
 * @returns {number} kg CO2/year
 */
export const calcTransportation = (data) => {
  const carKmYear = (parseFloat(data.carKmPerWeek) || 0) * 52;
  const carEmissions = carKmYear * EMISSION_FACTORS.car;

  const flightEmissions = (parseFloat(data.flightHoursPerYear) || 0) * EMISSION_FACTORS.flight;

  // Public transport reduction factor
  const ptFactor = { never: 0, sometimes: -100, often: -250, always: -450 };
  const ptReduction = ptFactor[data.publicTransportFreq] || 0;

  return Math.max(0, carEmissions + flightEmissions + ptReduction);
};

/**
 * Calculate energy emissions
 * @param {Object} data - { electricityKwhPerMonth, cookingFuel, cookingUsageM3 }
 * @returns {number} kg CO2/year
 */
export const calcEnergy = (data) => {
  const electricityEmissions =
    (parseFloat(data.electricityKwhPerMonth) || 0) * 12 * EMISSION_FACTORS.electricity;

  let cookingEmissions = 0;
  if (data.cookingFuel === 'gas') {
    cookingEmissions =
      (parseFloat(data.cookingUsageM3) || 0) * 12 * EMISSION_FACTORS.cookingGas;
  } else if (data.cookingFuel === 'lpg') {
    cookingEmissions = (parseFloat(data.cookingUsageM3) || 0) * 12 * 1.5;
  } else if (data.cookingFuel === 'electric') {
    cookingEmissions = (parseFloat(data.cookingUsageM3) || 0) * 12 * 0.233;
  }
  // biomass/firewood
  else if (data.cookingFuel === 'biomass') {
    cookingEmissions = 500;
  }

  return electricityEmissions + cookingEmissions;
};

/**
 * Calculate food emissions
 * @param {Object} data - { dietType }
 * @returns {number} kg CO2/year
 */
export const calcFood = (data) => {
  return EMISSION_FACTORS.diet[data.dietType] || EMISSION_FACTORS.diet.mixed;
};

/**
 * Calculate lifestyle emissions
 * @param {Object} data - { shoppingScore, wasteScore, waterM3PerMonth }
 * @returns {number} kg CO2/year
 */
export const calcLifestyle = (data) => {
  const shoppingEmissions = (parseFloat(data.shoppingScore) || 3) * EMISSION_FACTORS.shopping;
  const wasteEmissions    = (parseFloat(data.wasteScore)    || 3) * EMISSION_FACTORS.waste;
  const waterEmissions    =
    (parseFloat(data.waterM3PerMonth) || 5) * 12 * EMISSION_FACTORS.water;

  return shoppingEmissions + wasteEmissions + waterEmissions;
};

/**
 * Calculate total footprint and derive eco score
 * @param {Object} inputs - all calculator inputs
 * @returns {Object} full results object
 */
export const calculateTotal = (inputs) => {
  const transportation = calcTransportation(inputs.transportation || {});
  const energy         = calcEnergy(inputs.energy || {});
  const food           = calcFood(inputs.food || {});
  const lifestyle      = calcLifestyle(inputs.lifestyle || {});

  const totalKg     = transportation + energy + food + lifestyle;
  const totalTonnes = totalKg / 1000;

  // Eco Score: 100 = zero emissions, 0 = 3x global average
  const maxBad   = GLOBAL_AVERAGE_TONNES * 3; // 14.4 tonnes
  const ecoScore = Math.max(0, Math.round(100 - (totalTonnes / maxBad) * 100));

  // Emission category
  let category, categoryColor, categoryEmoji;
  if (totalTonnes < 2) {
    category = 'Low Emission';
    categoryColor = 'green';
    categoryEmoji = '🟢';
  } else if (totalTonnes < 5) {
    category = 'Moderate Emission';
    categoryColor = 'yellow';
    categoryEmoji = '🟡';
  } else {
    category = 'High Emission';
    categoryColor = 'red';
    categoryEmoji = '🔴';
  }

  // vs global average
  const vsAverage = ((totalTonnes - GLOBAL_AVERAGE_TONNES) / GLOBAL_AVERAGE_TONNES) * 100;

  return {
    transportation: Math.round(transportation),
    energy:         Math.round(energy),
    food:           Math.round(food),
    lifestyle:      Math.round(lifestyle),
    totalKg:        Math.round(totalKg),
    totalTonnes:    parseFloat(totalTonnes.toFixed(2)),
    ecoScore,
    category,
    categoryColor,
    categoryEmoji,
    vsAverage:      parseFloat(vsAverage.toFixed(1)),
    treesNeeded:    Math.ceil(totalKg / 22), // 1 tree absorbs ~22 kg CO2/year
  };
};

/**
 * Generate personalized recommendations based on results
 * @param {Object} inputs
 * @param {Object} results
 * @returns {Array} recommendations
 */
export const generateRecommendations = (inputs, results) => {
  const recs = [];

  // Transportation
  if ((parseFloat(inputs.transportation?.carKmPerWeek) || 0) > 100) {
    recs.push({
      icon: '🚗',
      title: 'Reduce Car Usage',
      description: 'Try carpooling or switching to an electric vehicle. Even reducing 20% of car trips can save 400+ kg CO2/year.',
      color: 'yellow',
      impact: 'High',
    });
  }
  if (inputs.transportation?.publicTransportFreq === 'never') {
    recs.push({
      icon: '🚌',
      title: 'Use Public Transport',
      description: 'Switching to bus or metro just 3 days a week can reduce your transport emissions by up to 30%.',
      color: 'green',
      impact: 'High',
    });
  }
  if ((parseFloat(inputs.transportation?.flightHoursPerYear) || 0) > 10) {
    recs.push({
      icon: '✈️',
      title: 'Fly Less, Choose Trains',
      description: 'A single short-haul flight produces more CO2 than a month of driving. Consider train or video calls instead.',
      color: 'red',
      impact: 'Very High',
    });
  }

  // Energy
  if ((parseFloat(inputs.energy?.electricityKwhPerMonth) || 0) > 300) {
    recs.push({
      icon: '💡',
      title: 'Switch to Renewable Energy',
      description: 'Consider solar panels or a green energy tariff. LED bulbs and smart thermostats can cut electricity use by 20%.',
      color: 'blue',
      impact: 'Medium',
    });
  }

  // Food
  if (inputs.food?.dietType === 'heavyMeat') {
    recs.push({
      icon: '🥗',
      title: 'Eat More Plant-Based Meals',
      description: 'Replacing red meat with plant protein just 3 days a week can save ~600 kg CO2/year. Try Meatless Mondays!',
      color: 'green',
      impact: 'High',
    });
  }
  if (inputs.food?.dietType === 'mixed') {
    recs.push({
      icon: '🌱',
      title: 'Reduce Meat Consumption',
      description: 'Even small reductions in meat (especially beef) have a big impact. Try plant-based alternatives twice a week.',
      color: 'green',
      impact: 'Medium',
    });
  }

  // Lifestyle
  if ((parseFloat(inputs.lifestyle?.shoppingScore) || 3) >= 4) {
    recs.push({
      icon: '🛍️',
      title: 'Adopt Mindful Shopping',
      description: 'Buy second-hand, repair instead of replace, and avoid fast fashion. Each avoided purchase saves 10-50 kg CO2.',
      color: 'purple',
      impact: 'Medium',
    });
  }
  if ((parseFloat(inputs.lifestyle?.wasteScore) || 3) >= 4) {
    recs.push({
      icon: '♻️',
      title: 'Reduce & Recycle Waste',
      description: 'Composting food waste and recycling properly can reduce household waste emissions by up to 40%.',
      color: 'blue',
      impact: 'Medium',
    });
  }

  // General
  recs.push({
    icon: '🌳',
    title: 'Plant Trees',
    description: `You need approximately ${results.treesNeeded} trees to offset your annual footprint. Support reforestation programs!`,
    color: 'green',
    impact: 'Supplemental',
  });

  return recs.slice(0, 6); // Max 6 recommendations
};

/**
 * Format CO2 value for display
 */
export const formatCO2 = (kg, unit = 'kg') => {
  if (unit === 'tonnes') {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`;
  return `${kg} kg`;
};

/**
 * AQI category helpers
 */
export const getAQIInfo = (aqi) => {
  if (aqi <= 50)  return { label: 'Good',        color: '#22c55e', bg: 'bg-eco-500/20',    text: 'text-eco-400',    description: 'Air quality is satisfactory. No health risk.' };
  if (aqi <= 100) return { label: 'Moderate',     color: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', description: 'Unusually sensitive people should consider limiting outdoor activity.' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', description: 'Sensitive groups may experience health effects.' };
  if (aqi <= 200) return { label: 'Unhealthy',    color: '#ef4444', bg: 'bg-red-500/20',    text: 'text-red-400',    description: 'Everyone may experience health effects.' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#a855f7', bg: 'bg-purple-500/20', text: 'text-purple-400', description: 'Health alert: serious risk for everyone.' };
  return           { label: 'Hazardous',          color: '#7c3aed', bg: 'bg-violet-500/20',  text: 'text-violet-400', description: 'Health warning of emergency conditions.' };
};
