export const LS_RPC_ADDRESS = 'RPC_ADDRESS'
export const LS_RPC_ADDRESS_LIST = 'RPC_ADDRESS_LIST'
export const GOV_PARAMS_TYPE = {
  VOTING: 'voting',
  DEPOSIT: 'deposit',
  TALLY: 'tallying',
}
export const DEFAULT_RPC_ADDRESS = 'https://dydx2.forcast.money'
export const DEFAULT_INDEXER_URL = 'https://dydx1.forcast.money'
export const DEFAULT_METADATA_SERVICE_URL = 'https://66iv2m87ol.execute-api.ap-northeast-1.amazonaws.com/mainnet/metadata-service/v1'
export type proposalStatus = {
  id: number
  status: string
  color: string
}
export const proposalStatusList: proposalStatus[] = [
  {
    id: 0,
    status: 'UNSPECIFIED',
    color: 'gray',
  },
  {
    id: 1,
    status: 'DEPOSIT PERIOD',
    color: 'blue',
  },
  {
    id: 2,
    status: 'VOTING PERIOD',
    color: 'blue',
  },
  {
    id: 3,
    status: 'PASSED',
    color: 'green',
  },
  {
    id: 4,
    status: 'REJECTED',
    color: 'red',
  },
  {
    id: 5,
    status: 'FAILED',
    color: 'red',
  },
]
