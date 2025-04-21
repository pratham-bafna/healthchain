const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

async function viewDatabase() {
    try {
        // Get all records
        const records = await sequelize.query('SELECT * FROM MedicalRecords ORDER BY timestamp ASC');
        
        console.log('\n=== Medical Records ===');
        records[0].forEach(record => {
            console.log('\nRecord:');
            console.log(`ID: ${record.id}`);
            console.log(`Patient ID: ${record.patientId}`);
            console.log(`Data: ${JSON.stringify(record.data, null, 2)}`);
            console.log(`Timestamp: ${new Date(record.timestamp).toLocaleString()}`);
            console.log(`Hash: ${record.hash}`);
            console.log(`Previous Hash: ${record.previousHash}`);
            console.log('-------------------');
        });

        // Get record count
        const count = await sequelize.query('SELECT COUNT(*) as count FROM MedicalRecords');
        console.log(`\nTotal Records: ${count[0][0].count}`);
    } catch (error) {
        console.error('Error viewing database:', error);
    } finally {
        await sequelize.close();
    }
}

viewDatabase(); 