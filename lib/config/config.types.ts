import { Address } from 'viem'
import { GqlChain } from '../shared/services/api/generated/graphql'
import { supportedChains } from '../modules/web3/Web3Provider'

export interface TokensConfig {
  nativeAsset: {
    name: string
    address: Address
    symbol: string
    decimals: number
  }
  doubleApprovalRequired?: string[]
}

export interface ContractsConfig {
  multicall2: Address
  balancer: {
    vaultV2?: Address
  }
}

export type SupportedChainId = (typeof supportedChains)[number]['id']
export interface NetworkConfig {
  chainId: SupportedChainId
  name: string
  shortName: string
  iconPath: string
  etherscan: string
  tokens: TokensConfig
  contracts: ContractsConfig
}

export interface Config {
  appEnv: 'dev' | 'staging' | 'prod'
  apiUrl: string
  networks: {
    [key in GqlChain]: NetworkConfig
  }
}

export interface ProjectConfig {
  projectId: 'beets' | 'balancer'
  projectName: string
  supportedNetworks: GqlChain[]
}
