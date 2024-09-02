import React, { useState } from 'react'
import { deployWorkflowOrdinal, transferWorkflowOrdinal } from '../../lib/workflowOrdinalNFT'

const WorkflowOrdinalNFTComponent: React.FC = () => {
    const [workflowData, setWorkflowData] = useState('')
    const [ownerPublicKey, setOwnerPublicKey] = useState('')
    const [newOwnerPublicKey, setNewOwnerPublicKey] = useState('')
    const [deployedInstance, setDeployedInstance] = useState(null)

    const handleDeploy = async () => {
        try {
            const instance = await deployWorkflowOrdinal(workflowData, ownerPublicKey)
            setDeployedInstance(instance)
            alert('Ordinal deployed successfully!')
        } catch (error) {
            console.error('Deployment failed:', error)
            alert('Deployment failed. Check console for details.')
        }
    }

    const handleTransfer = async () => {
        if (!deployedInstance) {
            alert('No deployed instance available.')
            return
        }

        try {
            // Note: In a real application, you would never handle private keys on the client side.
            // This is just for demonstration purposes.
            const currentOwnerPrivateKey = prompt('Enter current owner\'s private key:')
            if (!currentOwnerPrivateKey) return

            const tx = await transferWorkflowOrdinal(deployedInstance, currentOwnerPrivateKey, newOwnerPublicKey)
            alert(`Transfer successful! Transaction ID: ${tx.id}`)
        } catch (error) {
            console.error('Transfer failed:', error)
            alert('Transfer failed. Check console for details.')
        }
    }

    return (
        <div>
            <h2>Workflow Ordinal NFT</h2>
            <div>
                <label>
                    Workflow Data:
                    <textarea
                        value={workflowData}
                        onChange={(e) => setWorkflowData(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <label>
                    Owner Public Key:
                    <input
                        type="text"
                        value={ownerPublicKey}
                        onChange={(e) => setOwnerPublicKey(e.target.value)}
                    />
                </label>
            </div>
            <button onClick={handleDeploy}>Deploy Ordinal</button>

            {deployedInstance && (
                <div>
                    <h3>Transfer Ordinal</h3>
                    <div>
                        <label>
                            New Owner Public Key:
                            <input
                                type="text"
                                value={newOwnerPublicKey}
                                onChange={(e) => setNewOwnerPublicKey(e.target.value)}
                            />
                        </label>
                    </div>
                    <button onClick={handleTransfer}>Transfer Ordinal</button>
                </div>
            )}
        </div>
    )
}

export default WorkflowOrdinalNFTComponent