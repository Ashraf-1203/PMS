// RM → SQM: RM * width / 1000
function convertRmToSqm(rm, widthInMm) {
    if (typeof rm !== 'number' || typeof widthInMm !== 'number' || widthInMm <= 0) {
        return 0;
    }
    return (rm * widthInMm) / 1000;
}

// SQM → RM: SQM * 1000 / width
function convertSqmToRm(sqm, widthInMm) {
    if (typeof sqm !== 'number' || typeof widthInMm !== 'number' || widthInMm <= 0) {
        return 0;
    }
    return (sqm * 1000) / widthInMm;
}

// Amount = SQM * rate
function calculateAmount(sqm, rate) {
    if (typeof sqm !== 'number' || typeof rate !== 'number') {
        return 0;
    }
    return sqm * rate;
}

/**
 * Calculates the running meters (RM) from weight (KG) based on paper properties.
 * Formula: RM = kg / (width_in_m) / (gsm_in_kg_per_sqm)
 * Note: gsm is provided in g/m^2, so needs conversion. width is in mm, needs conversion.
 * @param {number} kg - The weight of the paper in kilograms.
 * @param {number} widthInMm - The width of the paper roll in millimeters.
 * @param {number} gsm - The grammage of the paper in grams per square meter.
 * @returns {number} The calculated running meters.
 */
function convertKgToRm(kg, widthInMm, gsm) {
    if (typeof kg !== 'number' || typeof widthInMm !== 'number' || typeof gsm !== 'number' || widthInMm <= 0 || gsm <= 0) {
        return 0;
    }
    const widthInM = widthInMm / 1000;
    const gsmInKgPerSqm = gsm / 1000;

    const rm = kg / widthInM / gsmInKgPerSqm;
    return rm;
}

/**
 * Applies weight deductions for returned paper based on width.
 * @param {number} kg - The initial weight in KG.
 * @param {number} widthInMm - The width of the paper roll in millimeters.
 * @returns {number} The weight after deduction.
 */
function applyReturnedKgDeductions(kg, widthInMm) {
    if (typeof kg !== 'number' || typeof widthInMm !== 'number') return kg;

    let deductionGrams = 0;
    if (widthInMm < 100) {
        deductionGrams = 80;
    } else if (widthInMm < 200) {
        deductionGrams = 160;
    } else if (widthInMm < 250) {
        deductionGrams = 230;
    } else if (widthInMm < 300) {
        deductionGrams = 350;
    } else if (widthInMm < 350) {
        deductionGrams = 550;
    }

    const deductionKg = deductionGrams / 1000;
    return Math.max(0, kg - deductionKg); // Ensure weight doesn't go below zero
}


module.exports = {
    convertRmToSqm,
    convertSqmToRm,
    calculateAmount,
    convertKgToRm,
    applyReturnedKgDeductions,
};
