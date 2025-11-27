// MetadataService API 客户端
export interface AssetInfo {
  symbol: string
  name: string
  decimals: number // 精度信息在这里！
  atomicResolution?: number // 或者在这里
  denomExponent?: number // 或者在这里
  // 其他元数据字段
  [key: string]: any
}

export interface AssetInfoResponse {
  [symbol: string]: AssetInfo
}

export interface AssetPrice {
  symbol: string
  price: string
  // 其他价格字段
  [key: string]: any
}

export interface AssetPricesResponse {
  [symbol: string]: AssetPrice
}

class MetadataServiceClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  /**
   * 获取资产信息（包含精度）
   */
  async getAssetInfo(assets?: string[]): Promise<AssetInfoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assets }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset info: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error fetching asset info:', error)
      return {}
    }
  }

  /**
   * 获取资产价格
   */
  async getAssetPrices(assets?: string[]): Promise<AssetPricesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assets }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset prices: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error fetching asset prices:', error)
      return {}
    }
  }
}

let metadataClientInstance: MetadataServiceClient | null = null

export function createMetadataClient(baseUrl: string): MetadataServiceClient {
  metadataClientInstance = new MetadataServiceClient(baseUrl)
  return metadataClientInstance
}

export function getMetadataClient(): MetadataServiceClient | null {
  return metadataClientInstance
}

