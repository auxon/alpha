'use client'

import React, { useEffect, useState } from 'react'
import { deployWorkflowOrdinal, transferWorkflowOrdinal } from '../../lib/workflowOrdinalNFT'
import { WorkflowOrdinal } from '@/contracts/WorkflowOrdinalNFT'
import { bsv, DefaultProvider, PandaSigner } from 'scrypt-ts'
import * as dotenv from 'dotenv'
const dotenvConfigPath = '.env'
dotenv.config({ path: dotenvConfigPath })

const WorkflowOrdinalNFTComponent: React.FC = () => {
    const [workflowData, setWorkflowData] = useState('')
    const [ownerPublicKey, setOwnerPublicKey] = useState<bsv.PublicKey | null>(null)
    const [newOwnerPublicKey, setNewOwnerPublicKey] = useState<bsv.PublicKey | null>(null)
    const [deployedInstance, setDeployedInstance] = useState<WorkflowOrdinal | null>(null)
    const [mintAmount, setMintAmount] = useState('')
    const [deployedTokenId, setDeployedTokenId] = useState<string | null>(null)
    const [privateKey, setPrivateKey] = useState('')
    const [ownerAddress, setOwnerAddress] = useState<bsv.Address | null>(null)
    const [newOwnerAddress, setNewOwnerAddress] = useState<bsv.Address | null>(null)

    useEffect(() => {
        async function fetchPrivateKey() {
          const response = await fetch('api/getPrivateKey')
          const data = await response.json()
          setPrivateKey(data.privateKey)
          setOwnerAddress(bsv.PrivateKey.fromWIF(data.privateKey).publicKey.toAddress())
        }
        fetchPrivateKey()
      }, [])
    
    const handleMint = async () => {
        if (!deployedInstance) {
            alert('No deployed instance available.')
            return
        }

        try {
            const provider = new DefaultProvider({ network: bsv.Networks.mainnet })
            const signer = new PandaSigner(provider)

            const { isAuthenticated, error } = await signer.requestAuth()
            if (!isAuthenticated) {
                throw new Error(error)
            }

            await deployedInstance.connect(signer)
            const amt = BigInt(mintAmount)
            
            // Instead of deployToken, use the mint method directly
            const mintTx = await deployedInstance.deploy(Number(amt))
            
            console.log("Minted tx: ", mintTx.id)
            alert(`Minted successfully! Transaction ID: ${mintTx.id}`)
    
        } catch (error) {
            console.error('Minting failed:', error)
            alert('Minting failed. Check console for details.')
        }
    }

    const handleDeploy = async () => {
        try {
            const provider = new DefaultProvider({ network: bsv.Networks.mainnet })
            const signer = new PandaSigner(provider)

            const { isAuthenticated, error } = await signer.requestAuth()
            if (!isAuthenticated) {
                throw new Error(error)
            }

            const { instance } = await deployWorkflowOrdinal(workflowData, signer)
            setDeployedInstance(instance)
            alert('Deployment successful!')
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
            const provider = new DefaultProvider({ network: bsv.Networks.mainnet })
            const signer = new PandaSigner(provider)

            const { isAuthenticated, error } = await signer.requestAuth()
            if (!isAuthenticated) {
                throw new Error(error)
            }
            
            const transferTx = await transferWorkflowOrdinal(
                deployedInstance,
                privateKey,
                newOwnerAddress
            )
            console.log("Transfer tx: ", transferTx)
            alert(`Transfer successful! Transaction ID: ${transferTx}`)
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
                    Owner Address:
                    <input
                        type="text"
                        value={ownerAddress?.toByteString()}
                        onChange={(e) => { setOwnerAddress(bsv.Address.fromString(e.target.value)) }}
                    />
                </label>
            </div>
            <button onClick={handleDeploy}>Deploy Ordinal</button>

            {deployedInstance && (
                <div>
                    <h3>Mint Tokens</h3>
                    <div>
                        <label>
                            Mint Amount:
                            <input
                                type="number"
                                value={mintAmount}
                                onChange={(e) => setMintAmount(e.target.value)}
                            />
                        </label>
                    </div>
                    <button onClick={handleMint}>Mint Tokens</button>
                </div>
            )}

            {deployedInstance && (
                <div>
                    <h3>Transfer Ordinal</h3>
                    <div>
                        <label>
                            New Owner Address:
                            <input
                                type="text"
                                value={newOwnerAddress?.toByteString()}
                                onChange={(e) => setNewOwnerAddress(bsv.Address.fromString(e.target.value))}
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