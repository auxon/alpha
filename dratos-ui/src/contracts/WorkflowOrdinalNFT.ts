import { BSV20V2, BSV20V2P2PKH } from 'scrypt-ord'
import {
    ByteString,
    Addr,
    hash256,
    method,
    prop,
    toByteString,
    assert,
    MethodCallOptions,
    ContractTransaction,
    bsv,
    PubKey,
    Sig,
    pubKey2Addr,
    ripemd160
} from 'scrypt-ts'

export class WorkflowOrdinal extends BSV20V2P2PKH {

    @prop()
    supply: bigint

    @prop()
    workflowData: ByteString

    constructor(id, sym, amt, dec, addr) {
        super(id, sym, amt, dec, addr);
        this.init(...arguments);
    }

    @method()
    public mint(dest: Addr, amount: bigint) {
        // Check mint amount doesn't exceed maximum.
        assert(amount <= this.max, 'mint amount exceeds maximum')
        assert(amount > 0n, 'mint amount should > 0')
        assert(amount <= this.supply, 'mint amount exceeds supply')
        this.supply -= amount
        assert(this.supply >= 0n, 'all supply mint out')
        let outputs = toByteString('')

        if (this.supply > 0n) {
            outputs += this.buildStateOutputFT(this.supply)
        }

        // Build FT P2PKH output to dest paying specified amount of tokens.
        outputs += BSV20V2.buildTransferOutput(dest, this.id, amount)

        // Build change output.
        outputs += this.buildChangeOutput()

        assert(hash256(outputs) == this.ctx.hashOutputs, 'hashOutputs mismatch')
    }

    static async mintTxBuilder(
        current: WorkflowOrdinal,
        options: MethodCallOptions<WorkflowOrdinal>,
        dest: Addr,
        amount: bigint
    ): Promise<ContractTransaction> {
        const defaultAddress = await current.signer.getDefaultAddress()

        const remaining = current.supply - amount

        const tx = new bsv.Transaction().addInput(current.buildContractInput()).addData(current.workflowData)
        const nexts: any[] = []
        const tokenId = current.getTokenId()
        if (remaining > 0n) {
            const next = current.next()

            if (!next.id) {
                next.id = toByteString(tokenId, true)
            }

            next.supply = remaining
            next.setAmt(remaining)

            tx.addOutput(
                new bsv.Transaction.Output({
                    satoshis: 1,
                    script: next.lockingScript,
                })
            )

            nexts.push({
                instance: next,
                balance: 1,
                atOutputIndex: 0,
            })
        }

        tx.addOutput(
            bsv.Transaction.Output.fromBufferReader(
                new bsv.encoding.BufferReader(
                    Buffer.from(
                        BSV20V2.buildTransferOutput(
                            dest,
                            toByteString(tokenId, true),
                            amount
                        ),
                        'hex'
                    )
                )
            )
        )

        tx.change(options.changeAddress || defaultAddress)
        return { tx, atInputIndex: 0, nexts }
    }

    @method()
    public unlock(sig: Sig, pubkey: PubKey) {
        // make sure the `pubkey` is the one locked with its address in the constructor
        assert(pubKey2Addr(pubkey) == this.addr, 'address check failed')

       // make sure the `sig` is signed by the private key corresponding to the `pubkey`
        assert(this.checkSig(sig, pubkey), 'signature check failed')
    }
}