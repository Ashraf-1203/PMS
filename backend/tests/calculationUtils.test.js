const assert = require('assert');
const {
    convertRmToSqm,
    convertSqmToRm,
    calculateAmount,
    convertKgToRm,
    applyReturnedKgDeductions,
} = require('../utils/calculationUtils');

// Test Suite for Calculation Utilities
console.log('Running tests for calculationUtils.js...');

// Test 1: convertRmToSqm
function testConvertRmToSqm() {
    assert.strictEqual(convertRmToSqm(1000, 500), 500, 'Test 1.1 Failed: RM to SQM');
    assert.strictEqual(convertRmToSqm(0, 500), 0, 'Test 1.2 Failed: Zero RM');
    assert.strictEqual(convertRmToSqm(1000, 0), 0, 'Test 1.3 Failed: Zero width');
    console.log('✔ testConvertRmToSqm passed.');
}

// Test 2: convertSqmToRm
function testConvertSqmToRm() {
    assert.strictEqual(convertSqmToRm(500, 500), 1000, 'Test 2.1 Failed: SQM to RM');
    assert.strictEqual(convertSqmToRm(0, 500), 0, 'Test 2.2 Failed: Zero SQM');
    assert.strictEqual(convertSqmToRm(500, 0), Infinity, 'Test 2.3 Failed: Zero width should be Infinity');
    console.log('✔ testConvertSqmToRm passed.');
}

// Test 3: calculateAmount
function testCalculateAmount() {
    assert.strictEqual(calculateAmount(500, 1.5), 750, 'Test 3.1 Failed: Amount calculation');
    assert.strictEqual(calculateAmount(0, 1.5), 0, 'Test 3.2 Failed: Zero SQM amount');
    console.log('✔ testCalculateAmount passed.');
}

// Test 4: applyReturnedKgDeductions
function testApplyReturnedKgDeductions() {
    assert.strictEqual(applyReturnedKgDeductions(10, 99), 10 - 0.080, 'Test 4.1 Failed: Deduction <100mm');
    assert.strictEqual(applyReturnedKgDeductions(10, 150), 10 - 0.160, 'Test 4.2 Failed: Deduction <200mm');
    assert.strictEqual(applyReturnedKgDeductions(10, 249), 10 - 0.230, 'Test 4.3 Failed: Deduction <250mm');
    assert.strictEqual(applyReturnedKgDeductions(10, 299), 10 - 0.350, 'Test 4.4 Failed: Deduction <300mm');
    assert.strictEqual(applyReturnedKgDeductions(10, 349), 10 - 0.550, 'Test 4.5 Failed: Deduction <350mm');
    assert.strictEqual(applyReturnedKgDeductions(10, 400), 10, 'Test 4.6 Failed: No deduction >=350mm');
    assert.strictEqual(applyReturnedKgDeductions(0.1, 99), 0.02, 'Test 4.7 Failed: Deduction resulting in small positive');
    assert.strictEqual(applyReturnedKgDeductions(0.05, 99), 0, 'Test 4.8 Failed: Deduction resulting in negative (should be 0)');
    console.log('✔ testApplyReturnedKgDeductions passed.');
}

// Test 5: convertKgToRm
function testConvertKgToRm() {
    // kg / (width_in_m) / (gsm_in_kg)
    // 10kg / (1m) / (0.1kg/m^2) = 100 RM
    assert.strictEqual(convertKgToRm(10, 1000, 100), 100, 'Test 5.1 Failed: KG to RM simple');
    // 25kg / (0.5m) / (0.08kg/m^2) = 625 RM
    assert.strictEqual(convertKgToRm(25, 500, 80), 625, 'Test 5.2 Failed: KG to RM complex');
    console.log('✔ testConvertKgToRm passed.');
}


// Run all tests
try {
    testConvertRmToSqm();
    testConvertSqmToRm();
    testCalculateAmount();
    testApplyReturnedKgDeductions();
    testConvertKgToRm();
    console.log('\nAll calculation tests passed successfully!');
} catch (error) {
    console.error(`\nTests failed: ${error.message}`);
}
