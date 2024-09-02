import { writeFileSync } from 'fs'
import { WorkflowOrdinalNFT } from '../src/contracts/WorkflowOrdinalNFT'
import { privateKey } from './privateKey'
import { bsv, TestWallet, DefaultProvider, sha256, Addr } from 'scrypt-ts'

function getScriptHash(scriptPubKeyHex: string) {
    const res = sha256(scriptPubKeyHex).match(/.{2}/g)
    if (!res) {
        throw new Error('scriptPubKeyHex is not of even length')
    }
    return res.reverse().join('')
}

async function main() {
    await WorkflowOrdinalNFT.loadArtifact()

    const publicKey = privateKey.publicKey
    
    // Prepare signer. 
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
    const signer = new TestWallet(privateKey, new DefaultProvider({
        network: bsv.Networks.testnet
    }))

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1

    const instance = new WorkflowOrdinalNFT(
        '00', // workflowData: ByteString (placeholder)
        Addr(publicKey.toAddress().toByteString())  // ownerPubKeyHash: Ripemd160
    )

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)

    // Save deployed contracts script hash.
    const scriptHash = getScriptHash(instance.lockingScript.toHex())
    const shFile = `.scriptHash`;
    writeFileSync(shFile, scriptHash);

    console.log('DratosUi contract was successfully deployed!')
    console.log(`TXID: ${deployTx.id}`)
    console.log(`scriptHash: ${scriptHash}`)
}

main()
