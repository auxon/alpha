const { bsv, buildContractClass, getPreimage, signTx, toHex, Ripemd160, Sha256 } = require('scryptlib');
const { loadDesc, createLockingTx, sendTx, unlockP2PKHInput } = require('./helper');
const { privateKey } = require('./privateKey');

(async () => {
    const InscriptionContract = buildContractClass(loadDesc('InscriptionContract_desc.json'));
    const inscription = new InscriptionContract('{"workflow": "example"}');

    const lockingTx = await createLockingTx(privateKey.toAddress(), 10000);
    const preimage = getPreimage(lockingTx, inscription.lockingScript, 10000);
    const sig = signTx(lockingTx, privateKey, inscription.lockingScript, 10000);

    lockingTx.inputs[0].setScript(inscription.verify(sig, preimage));
    const txid = await sendTx(lockingTx);
    console.log(`Minted Token Transaction ID: ${txid}`);
})();