import { NextApiRequest, NextApiResponse } from 'next'
import { deployWorkflowOrdinal, transferWorkflowOrdinal } from '../../lib/workflowOrdinalNFT'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { action, workflowData, ownerPublicKey, currentOwnerPrivateKey, newOwnerPublicKey } = req.body

        try {
            if (action === 'deploy') {
                const instance = await deployWorkflowOrdinal(workflowData, ownerPublicKey)
                res.status(200).json({ success: true, instance })
            } else if (action === 'transfer') {
                // Note: In a real application, you should never handle private keys on the server side.
                // This is just for demonstration purposes.
                const tx = await transferWorkflowOrdinal(req.body.instance, currentOwnerPrivateKey, newOwnerPublicKey)
                res.status(200).json({ success: true, transactionId: tx.id })
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