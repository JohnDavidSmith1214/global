import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { NetworkConfig } from '../config.types'
import { convertHexToLowerCase } from '@repo/lib/shared/utils/objects'
import {
  BALANCER_BATCH_ROUTER,
  BALANCER_COMPOSITE_LIQUIDITY_ROUTER,
  BALANCER_ROUTER,
  PERMIT2,
  VAULT_V3,
} from '@balancer/sdk'
import { sepolia } from 'viem/chains'

const networkConfig: NetworkConfig = {
  chainId: 11155111,
  name: 'Ethereum Testnet Sepolia',
  shortName: 'Sepolia',
  chain: GqlChain.Sepolia,
  iconPath: '/images/chains/MAINNET.svg',
  blockExplorer: {
    baseUrl: 'https://sepolia.etherscan.io',
    name: 'Etherscan',
  },
  tokens: {
    addresses: {
      bal: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
      wNativeAsset: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    },
    nativeAsset: {
      name: 'Ether',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'ETH',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
  },
  contracts: {
    multicall2: '0xca11bde05977b3631167028862be2a173976ca11',
    balancer: {
      vaultV2: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      vaultV3: VAULT_V3[sepolia.id],
      router: BALANCER_ROUTER[sepolia.id],
      batchRouter: BALANCER_BATCH_ROUTER[sepolia.id],
      compositeLiquidityRouter: BALANCER_COMPOSITE_LIQUIDITY_ROUTER[sepolia.id],
      relayerV6: '0x7852fB9d0895e6e8b3EedA553c03F6e2F9124dF9',
      minter: '0x1783Cd84b3d01854A96B4eD5843753C2CcbD574A',
    },
    veBAL: '0x150A72e4D4d81BbF045565E232c50Ed0931ad795',
    permit2: PERMIT2[sepolia.id],
  },
  pools: convertHexToLowerCase({
    issues: {},
    allowNestedActions: [
      '0x965f7d7387d81056ebf0edaf4a869dc46471a676',
      '0xc9233cc69435591b193b50f702ac31e404a08b10',
      '0x42de4fa875126fdbaf590b2fc3802adbca58acee',
    ],
  }),
  layerZeroChainId: 10161,
}

export default networkConfig
