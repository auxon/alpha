import { NextApiRequest, NextApiResponse } from 'next'
import { deployWorkflowOrdinal, transferWorkflowOrdinal } from '../../lib/workflowOrdinalNFT'
import { DefaultProvider, PandaSigner } from 'scrypt-ts'
import { bsv } from 'scrypt-ts'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { action, workflowData, ownerPublicKey } = req.body

        try {
            const provider = new DefaultProvider({ network: bsv.Networks.mainnet })
            const signer = new PandaSigner(provider)

            const { isAuthenticated, error } = await signer.requestAuth()
            if (!isAuthenticated) {
                throw new Error(error)
            }

            if (action === 'deploy') {
                const instance = await deployWorkflowOrdinal(workflowData, ownerPublicKey, signer)
                res.status(200).json({ success: true, instance })
            } else if (action === 'transfer') {
                // ... existing transfer code ...
                const instance = await transferWorkflowOrdinal(workflowData, ownerPublicKey.privateKey, (await signer.getDefaultPubKey()).toByteString())
                res.status(200).json({ success: true, instance })
            } else {
                res.status(400).json({ success: false, error: 'Invalid action' })
            }
        } catch (error) {
            console.error('API error:', error)
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    } else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}