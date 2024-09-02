import { BSV20V2, BSV20V2P2PKH, OrdinalNFT } from 'scrypt-ord';
import { assert, ByteString, hash160, method, prop, PubKey, Ripemd160, Sig, slice, SmartContract, len } from 'scrypt-ts';

class WorkflowOrdinalNFT extends BSV20V2 {
    @prop()
    workflowData: ByteString;

    @prop()
    ownerPubKeyHash: Ripemd160;

    constructor(workflowData: ByteString, ownerPubKeyHash: Ripemd160, maxSupply: bigint, decimals: bigint) {
        super(workflowData, ownerPubKeyHash, maxSupply, decimals);
        this.init(...arguments);
        this.workflowData = workflowData;
        this.ownerPubKeyHash = ownerPubKeyHash;
    }

    @method()
    public unlock(sig: Sig, pubKey: PubKey) {
        // Ensure the workflow data is not empty
        assert(len(this.workflowData) > 0n, 'Workflow data cannot be empty');
        // Verify the transaction is signed by the current owner
        assert(hash160(pubKey) == this.ownerPubKeyHash, 'Invalid owner');
        assert(this.checkSig(sig, pubKey), 'Signature verification failed');
    }

    @method()
    public transfer(toPubKeyHash: Ripemd160, sig: Sig, pubKey: PubKey) {
        // Ensure the current owner is signing the transaction
        assert(hash160(pubKey) == this.ownerPubKeyHash, 'Invalid owner');
        assert(this.checkSig(sig, pubKey), 'Signature verification failed');
        
        // Check that the new owner receives the token
        let isValidTransfer = false;
        const MAX_OUTPUTS = 10; // Adjust this number based on your expected maximum outputs
        const OUTPUT_SIZE = 32n; // Size of each output hash in bytes

        // Iterate through outputs to verify that the new owner receives the token
        for (let i = 0; i < MAX_OUTPUTS; i++) {
            const outputHash = slice(this.ctx.hashOutputs, BigInt(i) * OUTPUT_SIZE, OUTPUT_SIZE);
            if (outputHash == toPubKeyHash) {
                isValidTransfer = true;
            }
        }

        assert(isValidTransfer, 'Transfer failed: No output to the new owner found');
    
        // Update the owner to the new public key hash
        this.ownerPubKeyHash = toPubKeyHash;

        assert(true, 'Transfer successful');
    }
}
