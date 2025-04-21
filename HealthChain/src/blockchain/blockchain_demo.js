const Blockchain = require('./Blockchain');

// Initialize blockchain
const healthChain = new Blockchain();

// Function to add a medical record to blockchain
function addMedicalRecord(patientId, doctorId, diagnosis, prescription) {
    const recordData = {
        patientId,
        doctorId,
        diagnosis,
        prescription,
        timestamp: new Date().toISOString()
    };

    // Add to blockchain
    const block = healthChain.addBlock(recordData);

    return {
        blockHash: block.hash,
        timestamp: recordData.timestamp
    };
}

// Function to verify a record's integrity
function verifyRecord(blockHash) {
    // Find block in blockchain
    const block = healthChain.getBlock(blockHash);

    if (!block) {
        return { valid: false, message: 'Record not found in blockchain' };
    }

    // Verify block integrity
    const isBlockValid = block.isValid();
    const isChainValid = healthChain.isChainValid();

    return {
        valid: isBlockValid && isChainValid,
        recordData: block.data,
        blockHash: block.hash,
        isBlockValid,
        isChainValid
    };
}

// Function to get patient's medical history
function getPatientHistory(patientId) {
    return healthChain.getBlocksByPatient(patientId);
}

// Demo usage
function runDemo() {
    console.log('=== HealthChain Blockchain Demo ===\n');

    // Add a new medical record
    console.log('1. Adding a new medical record...');
    const newRecord = addMedicalRecord(1, 1, 'Annual Checkup', 'All clear');
    console.log('Record added:');
    console.log('- Block Hash:', newRecord.blockHash);
    console.log('- Timestamp:', newRecord.timestamp);
    console.log();

    // Add another record
    console.log('2. Adding another medical record...');
    const secondRecord = addMedicalRecord(1, 2, 'Flu', 'Antiviral medication');
    console.log('Record added:');
    console.log('- Block Hash:', secondRecord.blockHash);
    console.log('- Timestamp:', secondRecord.timestamp);
    console.log();

    // Verify the records
    console.log('3. Verifying record integrity...');
    const verification1 = verifyRecord(newRecord.blockHash);
    const verification2 = verifyRecord(secondRecord.blockHash);
    
    console.log('First record verification:');
    console.log('- Valid:', verification1.valid);
    console.log('- Block valid:', verification1.isBlockValid);
    console.log('- Chain valid:', verification1.isChainValid);
    console.log();

    console.log('Second record verification:');
    console.log('- Valid:', verification2.valid);
    console.log('- Block valid:', verification2.isBlockValid);
    console.log('- Chain valid:', verification2.isChainValid);
    console.log();

    // Get patient history
    console.log('4. Retrieving patient history...');
    const history = getPatientHistory(1);
    console.log('Number of records:', history.length);
    console.log('Records:');
    history.forEach((block, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log('- Diagnosis:', block.data.diagnosis);
        console.log('- Prescription:', block.data.prescription);
        console.log('- Doctor ID:', block.data.doctorId);
        console.log('- Timestamp:', block.data.timestamp);
    });
    console.log();

    // Show blockchain structure
    console.log('5. Blockchain structure:');
    const chain = healthChain.getChain();
    console.log('Number of blocks:', chain.length);
    console.log('Latest block hash:', chain[chain.length - 1].hash);
}

// Run the demo
runDemo(); 