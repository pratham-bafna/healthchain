const Blockchain = require('../src/blockchain/Blockchain');
const Block = require('../src/blockchain/Block');

describe('Blockchain Tests', () => {
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
    });

    test('should create genesis block', () => {
        expect(blockchain.chain.length).toBe(1);
        expect(blockchain.chain[0].data.message).toBe('Genesis Block');
    });

    test('should add new block', () => {
        const data = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Test Diagnosis',
            prescription: 'Test Prescription'
        };

        const block = blockchain.addBlock(data);
        expect(blockchain.chain.length).toBe(2);
        expect(block.data).toEqual(data);
    });

    test('should verify valid chain', () => {
        const data1 = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Diagnosis 1',
            prescription: 'Prescription 1'
        };

        const data2 = {
            patientId: 1,
            doctorId: 2,
            diagnosis: 'Diagnosis 2',
            prescription: 'Prescription 2'
        };

        blockchain.addBlock(data1);
        blockchain.addBlock(data2);

        expect(blockchain.isChainValid()).toBe(true);
    });

    test('should detect tampered chain', () => {
        const data = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Original Diagnosis',
            prescription: 'Original Prescription'
        };

        blockchain.addBlock(data);
        
        // Tamper with the data
        blockchain.chain[1].data.diagnosis = 'Tampered Diagnosis';
        
        expect(blockchain.isChainValid()).toBe(false);
    });

    test('should get blocks by patient ID', () => {
        const patientId = 1;
        const records = [
            {
                patientId,
                doctorId: 1,
                diagnosis: 'Diagnosis 1',
                prescription: 'Prescription 1'
            },
            {
                patientId,
                doctorId: 2,
                diagnosis: 'Diagnosis 2',
                prescription: 'Prescription 2'
            },
            {
                patientId: 2, // Different patient
                doctorId: 1,
                diagnosis: 'Diagnosis 3',
                prescription: 'Prescription 3'
            }
        ];

        records.forEach(record => blockchain.addBlock(record));
        
        const patientBlocks = blockchain.getBlocksByPatient(patientId);
        expect(patientBlocks.length).toBe(2);
        expect(patientBlocks[0].data.patientId).toBe(patientId);
        expect(patientBlocks[1].data.patientId).toBe(patientId);
    });

    test('should get block by hash', () => {
        const data = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Test Diagnosis',
            prescription: 'Test Prescription'
        };

        const block = blockchain.addBlock(data);
        const foundBlock = blockchain.getBlock(block.hash);
        
        expect(foundBlock).toBeDefined();
        expect(foundBlock.hash).toBe(block.hash);
        expect(foundBlock.data).toEqual(data);
    });
});

describe('Block Tests', () => {
    test('should create valid block', () => {
        const data = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Test Diagnosis',
            prescription: 'Test Prescription'
        };

        const block = new Block(Date.now(), data, 'previous-hash');
        expect(block.isValid()).toBe(true);
    });

    test('should detect tampered block', () => {
        const data = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Original Diagnosis',
            prescription: 'Original Prescription'
        };

        const block = new Block(Date.now(), data, 'previous-hash');
        block.mineBlock(4); // Mine the block first
        
        // Tamper with the data
        block.data.diagnosis = 'Tampered Diagnosis';
        
        expect(block.isValid()).toBe(false);
    });

    test('should mine block with correct difficulty', () => {
        const data = {
            patientId: 1,
            doctorId: 1,
            diagnosis: 'Test Diagnosis',
            prescription: 'Test Prescription'
        };

        const block = new Block(Date.now(), data, 'previous-hash');
        block.mineBlock(4);
        
        expect(block.hash.substring(0, 4)).toBe('0000');
    });
}); 