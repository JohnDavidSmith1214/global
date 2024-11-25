'use client'

import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import {
  Box,
  Card,
  CardProps,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Link,
  Divider,
  Text,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
} from '@chakra-ui/react'
import { usePool } from '../../PoolProvider'
import { ArrowUpRight } from 'react-feather'
import { useMemo } from 'react'
import {
  GqlPriceRateProviderData,
  GqlToken,
  GqlHookReviewData,
} from '@repo/lib/shared/services/api/generated/graphql'
import { Address, zeroAddress } from 'viem'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TokenIcon } from '@repo/lib/modules/tokens/TokenIcon'
import { AlertTriangle, XCircle } from 'react-feather'
import Image from 'next/image'
import { RateProviderInfoPopOver } from './RateProviderInfo'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/hooks/useBlockExplorer'
import { getWarnings } from '@repo/lib/modules/pool/pool.helpers'
import { HookInfoPopOver } from './HookInfo'

type RateProvider = {
  tokenAddress: Address
  rateProviderAddress: Address
  priceRateProviderData: GqlPriceRateProviderData | null
}

function getIconAndLevel(hasWarnings: boolean, isSafe: boolean, hasData: boolean) {
  let icon
  let level

  if (!hasData) {
    icon = <Icon as={AlertTriangle} color="font.warning" cursor="pointer" size={16} />
    level = 1
  } else {
    if (isSafe) {
      if (hasWarnings) {
        icon = <Icon as={AlertTriangle} color="font.warning" cursor="pointer" size={16} />
        level = 1
      } else {
        icon = (
          <Box as="span" cursor="pointer">
            <Image alt="Notes" height={16} src="/images/icons/notes.svg" width={16} />
          </Box>
        )
        level = 2
      }
    } else {
      icon = <Icon as={XCircle} color="red.500" cursor="pointer" size={16} />
      level = 0
    }
  }

  return { icon, level }
}

function getRateProviderIcon(data: GqlPriceRateProviderData | null, token: GqlToken) {
  const hasWarnings = getWarnings(data?.warnings || []).length > 0
  const isSafe = !!data?.reviewed && data?.summary === 'safe'
  const hasData = !!data

  const { icon, level } = getIconAndLevel(hasWarnings, isSafe, hasData)

  return (
    <RateProviderInfoPopOver data={data} level={level} token={token}>
      {icon}
    </RateProviderInfoPopOver>
  )
}

function getHookIcon(data: GqlHookReviewData | undefined | null) {
  const hasWarnings = getWarnings(data?.warnings || []).length > 0
  const isSafe = !!data?.summary && data?.summary === 'safe'
  const hasData = !!data

  const { icon, level } = getIconAndLevel(hasWarnings, isSafe, hasData)

  return (
    <HookInfoPopOver data={data} level={level}>
      {icon}
    </HookInfoPopOver>
  )
}

export function PoolContracts({ ...props }: CardProps) {
  const { pool, chain, poolExplorerLink, hasGaugeAddress, gaugeAddress, gaugeExplorerLink } =
    usePool()

  const { getToken } = useTokens()

  const contracts = useMemo(() => {
    const contracts = [
      {
        label: 'Pool address',
        address: pool.address,
        explorerLink: poolExplorerLink,
      },
    ]

    if (hasGaugeAddress) {
      contracts.push({
        label: 'veBAL gauge',
        address: gaugeAddress,
        explorerLink: gaugeExplorerLink,
      })
    }

    return contracts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, hasGaugeAddress])

  const rateProviders = useMemo(() => {
    return pool.poolTokens
      .map(token => ({
        tokenAddress: token.address,
        rateProviderAddress: token.priceRateProvider,
        priceRateProviderData: token.priceRateProviderData,
      }))
      .filter(
        item => item.rateProviderAddress && item.rateProviderAddress !== zeroAddress
      ) as RateProvider[]
  }, [pool])

  const hooks = useMemo(() => {
    const nestedHooks = pool.poolTokens.flatMap(token =>
      token.nestedPool ? token.nestedPool.hook : []
    )
    return [...(pool.hook ? [pool.hook] : []), ...nestedHooks].filter(Boolean)
  }, [pool])

  return (
    <Card {...props}>
      <VStack alignItems="flex-start" spacing="md" width="full">
        <Heading fontSize="xl" variant="h4">
          Pool contracts
        </Heading>
        <Divider />
        {contracts.map(contract => (
          <Grid
            gap="sm"
            key={contract.address}
            templateColumns={{ base: '1fr 2fr', md: '1fr 3fr' }}
            w="full"
          >
            <GridItem>
              <Text minW="120px" variant="secondary">
                {contract.label}:
              </Text>
            </GridItem>
            <GridItem>
              <Link href={contract.explorerLink} target="_blank" variant="link">
                <HStack gap="xxs">
                  <Text color="link">{abbreviateAddress(contract.address)}</Text>
                  <ArrowUpRight size={12} />
                </HStack>
              </Link>
            </GridItem>
          </Grid>
        ))}
        {hooks.length > 0 && (
          <Grid gap="sm" templateColumns={{ base: '1fr 2fr', md: '1fr 3fr' }} w="full">
            <GridItem>
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Text className="tooltip-dashed-underline" minW="120px" variant="secondary">
                    {hooks.length === 1 ? 'Hook:' : 'Hooks:'}
                  </Text>
                </PopoverTrigger>
                <PopoverContent maxW="300px" p="sm" w="auto">
                  <Text fontSize="sm" variant="secondary">
                    Hooks are contracts that can be used to modify the behavior of the pool.
                  </Text>
                </PopoverContent>
              </Popover>
            </GridItem>
            <GridItem>
              <VStack alignItems="flex-start">
                {hooks.map((hook, index) => {
                  return (
                    hook && (
                      <HStack key={hook.address}>
                        <Link
                          href={getBlockExplorerAddressUrl(hook.address, chain)}
                          key={hook.address}
                          target="_blank"
                          variant="link"
                        >
                          <HStack gap="xxs">
                            <Text color="link">{abbreviateAddress(hook.address)}</Text>
                            <ArrowUpRight size={12} />
                          </HStack>
                        </Link>
                        {(index > 0 || !pool.hook) && <Text variant="secondary">(nested)</Text>}
                        {getHookIcon(hook.reviewData)}
                      </HStack>
                    )
                  )
                })}
              </VStack>
            </GridItem>
          </Grid>
        )}
        {rateProviders.length > 0 && (
          <Grid gap="sm" templateColumns={{ base: '1fr 2fr', md: '1fr 3fr' }} w="full">
            <GridItem>
              <Popover trigger="hover">
                <PopoverTrigger>
                  <Text className="tooltip-dashed-underline" minW="120px" variant="secondary">
                    {rateProviders.length === 1 ? 'Rate provider:' : 'Rate providers:'}
                  </Text>
                </PopoverTrigger>
                <PopoverContent maxW="300px" p="sm" w="auto">
                  <Text fontSize="sm" variant="secondary">
                    Rate Providers are contracts that provide an exchange rate between two assets.
                    This can come from any on-chain source, including oracles or from other
                    calculations. This introduces risks around the rate provider being able to
                    supply accurate and timely exchange rates.
                  </Text>
                </PopoverContent>
              </Popover>
            </GridItem>
            <GridItem>
              <VStack alignItems="flex-start">
                {rateProviders.map(provider => {
                  const token = getToken(provider.tokenAddress, chain)
                  return (
                    token && (
                      <HStack key={provider.tokenAddress}>
                        <Tooltip fontSize="sm" label={token.symbol} shouldWrapChildren>
                          <TokenIcon
                            address={token.address}
                            alt={token.address}
                            chain={chain}
                            size={16}
                          />
                        </Tooltip>
                        <Link
                          href={getBlockExplorerAddressUrl(provider.rateProviderAddress, chain)}
                          key={provider.rateProviderAddress}
                          target="_blank"
                          variant="link"
                        >
                          <HStack gap="xxs">
                            <Text color="link">
                              {abbreviateAddress(provider.rateProviderAddress)}
                            </Text>
                            <ArrowUpRight size={12} />
                          </HStack>
                        </Link>
                        {getRateProviderIcon(provider.priceRateProviderData, token)}
                      </HStack>
                    )
                  )
                })}
              </VStack>
            </GridItem>
          </Grid>
        )}
      </VStack>
    </Card>
  )
}
