const Block = require('./Block');

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    createGenesisBlock() {
        return new Block(Date.now(), { message: 'Genesis Block' }, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const block = new Block(
            Date.now(),
            data,
            this.getLatestBlock().hash
        );
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        return block;
    }

    // Verify the integrity of the entire chain
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Verify current block's hash
            if (!currentBlock.isValid()) {
                return false;
            }

            // Verify current block's previous hash
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }

    // Get block by hash
    getBlock(hash) {
        return this.chain.find(block => block.hash === hash);
    }

    // Get all blocks containing specific data pattern
    getBlocksByPatient(patientId) {
        return this.chain.filter(block => 
            block.data && block.data.patientId === patientId
        );
    }

    // Get the entire blockchain
    getChain() {
        return this.chain;
    }
}

module.exports = Blockchain; 