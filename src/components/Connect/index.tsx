import React, { FormEvent, ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiZap, FiCheck, FiLoader } from 'react-icons/fi'
import { useTheme } from '@/theme/ThemeProvider'
import { Button } from '@/components/ui/Button'
import {
  setConnectState,
  setTmClient,
  setRPCAddress,
} from '@/store/connectSlice'
import {
  setNewBlock,
  setTxEvent,
  setSubsNewBlock,
  setSubsTxEvent,
  addBlock,
  addTransaction,
} from '@/store/streamSlice'
import {
  setStakingParams,
  setMintParams,
  setDistributionParams,
  setSlashingParams,
  setGovVotingParams,
  setGovDepositParams,
  setGovTallyParams,
} from '@/store/paramsSlice'
import { DEFAULT_RPC_ADDRESS } from '@/utils/constant'
import { validateConnection, connectWebsocketClient } from '@/rpc/client'
import { subscribeNewBlock, subscribeTx } from '@/rpc/subscribe'
import { removeTrailingSlash } from '@/utils/helper'
import { RootState } from '@/store'

export default function Connect() {
  const [state, setState] = useState<'initial' | 'submitting' | 'success'>(
    'initial'
  )
  const [error, setError] = useState(false)
  const dispatch = useDispatch()
  const { colors } = useTheme()

  // Get current subscriptions and tmClient from Redux store
  const currentSubsNewBlock = useSelector(
    (state: RootState) => state.stream.subsNewBlock
  )
  const currentSubsTxEvent = useSelector(
    (state: RootState) => state.stream.subsTxEvent
  )
  const currentTmClient = useSelector(
    (state: RootState) => state.connect.tmClient
  )

  const connectClient = async (rpcAddress: string) => {
    try {
      setError(false)
      setState('submitting')

      if (!rpcAddress) {
        setError(true)
        setState('initial')
        return
      }

      const isValid = await validateConnection(rpcAddress)
      if (!isValid) {
        setError(true)
        setState('initial')
        return
      }

      // Clean up existing subscriptions and connections before establishing new ones
      if (currentSubsNewBlock) {
        currentSubsNewBlock.unsubscribe()
        dispatch(setSubsNewBlock(null))
      }
      if (currentSubsTxEvent) {
        currentSubsTxEvent.unsubscribe()
        dispatch(setSubsTxEvent(null))
      }
      if (currentTmClient) {
        try {
          currentTmClient.disconnect()
        } catch (error) {
          console.warn('Error disconnecting previous tmClient:', error)
        }
      }

      // Reset stream data
      dispatch(setNewBlock(null))
      dispatch(setTxEvent(null))

      // Reset parameters data
      dispatch(setStakingParams(null))
      dispatch(setMintParams(null))
      dispatch(setDistributionParams(null))
      dispatch(setSlashingParams(null))
      dispatch(setGovVotingParams(null))
      dispatch(setGovDepositParams(null))
      dispatch(setGovTallyParams(null))

      const tmClient = await connectWebsocketClient(rpcAddress)

      if (!tmClient) {
        setError(true)
        setState('initial')
        return
      }

      dispatch(setConnectState(true))
      dispatch(setTmClient(tmClient))
      dispatch(setRPCAddress(rpcAddress))

      // Start blockchain data subscriptions
      const newBlockSub = subscribeNewBlock(tmClient, (event) => {
        dispatch(setNewBlock(event))
        dispatch(addBlock(event))
      })

      const txSub = subscribeTx(tmClient, (event) => {
        dispatch(setTxEvent(event))
        dispatch(addTransaction(event))
      })

      dispatch(setSubsNewBlock(newBlockSub))
      dispatch(setSubsTxEvent(txSub))

      setState('success')
    } catch (err) {
      console.error(err)
      setError(true)
      setState('initial')
      return
    }
  }

  React.useEffect(() => {
    // 自动连接到默认RPC端点
    const defaultRpc = removeTrailingSlash(DEFAULT_RPC_ADDRESS)
    if (state === 'initial') {
      connectClient(defaultRpc)
    }
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: colors.text.primary }}
          >
            Connecting to{' '}
            <span style={{ color: colors.primary }}>Blockchain</span>
          </h1>
          <p className="mb-8" style={{ color: colors.text.secondary }}>
            Establishing connection to the blockchain explorer...
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {state === 'submitting' && (
            <>
              <FiLoader
                className="h-12 w-12 animate-spin"
                style={{ color: colors.primary }}
              />
              <p style={{ color: colors.text.secondary }}>Connecting...</p>
            </>
          )}
          {state === 'success' && (
            <>
              <FiCheck
                className="h-12 w-12"
                style={{ color: colors.status.success }}
              />
              <p style={{ color: colors.status.success }}>
                Connected successfully!
              </p>
            </>
          )}
          {error && (
            <>
              <p
                className="text-sm mt-2"
                style={{ color: colors.status.error }}
              >
                Failed to connect. Please refresh the page to retry.
              </p>
              <Button
                onClick={() => {
                  setState('initial')
                  setError(false)
                  const defaultRpc = removeTrailingSlash(DEFAULT_RPC_ADDRESS)
                  connectClient(defaultRpc)
                }}
                variant="primary"
              >
                Retry Connection
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
