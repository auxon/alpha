import {
    assert,
    ByteString,
    method,
    prop,
    PubKey,
    Ripemd160,
    Sig,
    SmartContract,
} from 'scrypt-ts'

export class WorkflowOrdinalNFT extends SmartContract {
    @prop()
    workflowData: ByteString

    @prop()
    ownerPubKeyHash: Ripemd160

    constructor(workflowData: ByteString, ownerPubKeyHash: Ripemd160) {
        super(...arguments)
        this.workflowData = workflowData
        this.ownerPubKeyHash = ownerPubKeyHash
    }

    @method()
    public unlock(sig: Sig, pubKey: PubKey) {
        assert(this.workflowData.length > 0, 'Workflow data cannot be empty')
        assert(hash160(pubKey) == this.ownerPubKeyHash, 'Invalid owner')
        assert(this.checkSig(sig, pubKey), 'Signature verification failed')
    }

    @method()
    public transfer(toPubKeyHash: Ripemd160, sig: Sig, pubKey: PubKey) {
        assert(hash160(pubKey) == this.ownerPubKeyHash, 'Invalid owner')
        assert(this.checkSig(sig, pubKey), 'Signature verification failed')

        let expectedOutputScript = Utils.buildPublicKeyHashScript(toPubKeyHash)
        let isValidTransfer = false

        for (let i = 0; i < this.ctx.utxo.script.length; i++) {
            if (this.ctx.utxo.script[i] == expectedOutputScript) {
                isValidTransfer = true
                break
            }
        }

        assert(isValidTransfer, 'Transfer failed: No output to the new owner found')
        
        this.ownerPubKeyHash = toPubKeyHash
    }
}