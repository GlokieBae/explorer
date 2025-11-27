// Indexer API 客户端
export interface Subaccount {
  address: string
  subaccountNumber: number
  equity?: string
  freeCollateral?: string
  assetPositions?: { [symbol: string]: AssetPosition }
  openPerpetualPositions?: { [market: string]: any }
}

export interface AssetPosition {
  symbol: string
  side: 'LONG' | 'SHORT'
  size: string
  assetId: string
  subaccountNumber?: number
  // 其他字段根据实际 API 响应调整
  [key: string]: any
}

export interface SubaccountResponse {
  subaccounts: Subaccount[]
}

export interface AssetPositionsResponse {
  positions: AssetPosition[]
}

export interface ParentSubaccountResponse {
  subaccount: {
    address: string
    parentSubaccountNumber: number
    equity?: string
    freeCollateral?: string
    childSubaccounts: Subaccount[]
  }
}

class IndexerClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // 移除末尾斜杠
  }

  /**
   * 获取父账户及其所有子账户信息（使用正确的 API 路径）
   */
  async getParentSubaccount(
    address: string,
    parentSubaccountNumber: number = 0
  ): Promise<ParentSubaccountResponse> {
    try {
      const url = `${this.baseUrl}/v4/addresses/${address}/parentSubaccountNumber/${parentSubaccountNumber}`
      console.log('[Indexer] 请求 URL:', url)
      
      const response = await fetch(url)
      
      console.log('[Indexer] 响应状态:', response.status)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('[Indexer] 404: 没有找到父账户')
          return {
            subaccount: {
              address,
              parentSubaccountNumber,
              childSubaccounts: [],
            },
          }
        }
        const errorText = await response.text()
        console.error('[Indexer] 错误响应:', errorText)
        throw new Error(`Failed to fetch parent subaccount: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[Indexer] 响应数据:', data)
      return data
    } catch (error) {
      console.error('[Indexer] 请求异常:', error)
      return {
        subaccount: {
          address,
          parentSubaccountNumber,
          childSubaccounts: [],
        },
      }
    }
  }

  /**
   * 获取地址的所有子账户列表（兼容方法，使用新的 API）
   */
  async getSubaccounts(address: string): Promise<SubaccountResponse> {
    try {
      const response = await this.getParentSubaccount(address, 0)
      return {
        subaccounts: response.subaccount.childSubaccounts || [],
      }
    } catch (error) {
      console.error('Error fetching subaccounts:', error)
      return { subaccounts: [] }
    }
  }

  /**
   * 获取特定子账户的资产持仓
   */
  async getSubaccountAssetPositions(
    address: string,
    subaccountNumber: number,
    status: 'OPEN' | 'CLOSED' = 'OPEN'
  ): Promise<AssetPositionsResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/v4/addresses/${address}/subaccounts/${subaccountNumber}/asset-positions?status=${status}`
      )
      
      if (!response.ok) {
        if (response.status === 404) {
          return { positions: [] }
        }
        throw new Error(`Failed to fetch asset positions: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error(
        `Error fetching asset positions for subaccount ${subaccountNumber}:`,
        error
      )
      return { positions: [] }
    }
  }

  /**
   * 获取地址所有子账户的资产持仓（使用新的 API）
   */
  async getAllSubaccountAssets(
    address: string,
    parentSubaccountNumber: number = 0
  ): Promise<{
    subaccountNumber: number
    positions: AssetPosition[]
  }[]> {
    try {
      // 使用新的 API 路径获取父账户及其所有子账户
      const response = await this.getParentSubaccount(address, parentSubaccountNumber)
      
      if (!response.subaccount?.childSubaccounts || response.subaccount.childSubaccounts.length === 0) {
        console.log('[Indexer] 没有子账户')
        return []
      }
      
      // 转换数据结构：将每个子账户的 assetPositions 对象转换为数组
      const result = response.subaccount.childSubaccounts.map((childSubaccount) => {
        const positions: AssetPosition[] = []
        
        // 将 assetPositions 对象转换为数组
        if (childSubaccount.assetPositions) {
          Object.entries(childSubaccount.assetPositions).forEach(([symbol, position]) => {
            positions.push({
              ...position,
              symbol: position.symbol || symbol, // 确保有 symbol 字段
              subaccountNumber: childSubaccount.subaccountNumber,
            })
          })
        }
        
        return {
          subaccountNumber: childSubaccount.subaccountNumber,
          positions,
        }
      })
      
      console.log('[Indexer] 转换后的资产数据:', result)
      return result
    } catch (error) {
      console.error('[Indexer] 获取子账户资产失败:', error)
      return []
    }
  }
}

// 导出单例或创建函数
let indexerClientInstance: IndexerClient | null = null

export function createIndexerClient(baseUrl: string): IndexerClient {
  indexerClientInstance = new IndexerClient(baseUrl)
  return indexerClientInstance
}

export function getIndexerClient(): IndexerClient | null {
  return indexerClientInstance
}

