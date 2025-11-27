import { Tendermint37Client } from '@cosmjs/tendermint-rpc'
import { QueryClient } from '@cosmjs/stargate'
import {
  QueryAssetRequest,
  QueryAssetResponse,
  QueryAllAssetsRequest,
  QueryAllAssetsResponse,
} from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/assets/query'
import { Asset } from '@dydxprotocol/v4-proto/src/codegen/dydxprotocol/assets/asset'

const ASSET_QUERY_PATH = '/dydxprotocol.assets.Query/Asset'
const ALL_ASSETS_QUERY_PATH = '/dydxprotocol.assets.Query/AllAssets'

export async function queryAssetById(
  tmClient: Tendermint37Client,
  assetId: number
): Promise<Asset | null> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryAssetRequest.encode({
    id: assetId,
  }).finish()

  const { value } = await queryClient.queryAbci(ASSET_QUERY_PATH, req)
  const response = QueryAssetResponse.decode(value)
  return response.asset ?? null
}

export async function queryAllAssets(
  tmClient: Tendermint37Client
): Promise<Asset[]> {
  const queryClient = new QueryClient(tmClient)
  const req = QueryAllAssetsRequest.encode({}).finish()

  const { value } = await queryClient.queryAbci(ALL_ASSETS_QUERY_PATH, req)
  const response = QueryAllAssetsResponse.decode(value)
  return response.asset ?? []
}

