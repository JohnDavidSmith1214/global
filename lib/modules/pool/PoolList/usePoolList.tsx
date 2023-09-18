'use client'

import { makeVar, useReactiveVar } from '@apollo/client'
import { createContext, ReactNode, useCallback, useContext } from 'react'
import {
  GetPoolsDocument,
  GqlChain,
  GqlPoolFilterType,
  GqlPoolOrderBy,
  GqlPoolOrderDirection,
} from '@/lib/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@/lib/config/useProjectConfig'
import { useQuery, useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr'
import { PoolsColumnSort, PoolsQueryVariables } from '@/lib/modules/pool/pool.types'
import { usePoolFilters } from './usePoolListFilters'
import {
  DEFAULT_POOL_LIST_QUERY_VARS,
  getInitQueryState,
  useQueryVarsWatcher,
} from './usePoolList.helpers'

const initQueryState = getInitQueryState()

const poolListStateVar = makeVar<PoolsQueryVariables>(initQueryState.variables)

export function _usePoolList() {
  const state = useReactiveVar(poolListStateVar)
  const poolFilters = usePoolFilters(initQueryState)

  function setNewState(newState: Partial<PoolsQueryVariables>) {
    const state = poolListStateVar()

    poolListStateVar({
      ...state,
      ...newState,
      where: {
        ...state.where,
        ...newState.where,
      },
    })
  }

  function setSort(sortingState: PoolsColumnSort[]) {
    if (sortingState.length > 0) {
      setNewState({
        orderBy: sortingState[0].id,
        orderDirection: sortingState[0].desc
          ? GqlPoolOrderDirection.Desc
          : GqlPoolOrderDirection.Asc,
      })
    } else {
      setNewState({
        orderBy: GqlPoolOrderBy.TotalLiquidity,
        orderDirection: GqlPoolOrderDirection.Desc,
      })
    }
  }

  function setPageSize(pageSize: number) {
    setNewState({
      skip: 0,
      first: pageSize,
    })
  }

  function setPageNumber(pageNumber: number) {
    const state = poolListStateVar()
    setNewState({
      skip: pageNumber * state.first,
    })
  }

  const setNetworks = useCallback(
    (networks: GqlChain[]) =>
      setNewState({
        where: {
          chainIn: networks.length === 0 ? PROJECT_CONFIG.supportedNetworks : networks,
        },
      }),
    []
  )

  const setPoolTypes = useCallback(
    (poolTypes: GqlPoolFilterType[]) =>
      setNewState({
        where: {
          poolTypeIn:
            poolTypes.length === 0 ? DEFAULT_POOL_LIST_QUERY_VARS.where?.poolTypeIn : poolTypes,
        },
      }),
    []
  )

  const { data, loading, previousData, refetch, networkStatus, error } = useQuery(
    GetPoolsDocument,
    {
      variables: state,
      notifyOnNetworkStatusChange: true,
    }
  )

  const pools = loading && previousData ? previousData.pools : data?.pools || []

  const sorting: PoolsColumnSort[] = state.orderBy
    ? [{ id: state.orderBy, desc: state.orderDirection === GqlPoolOrderDirection.Desc }]
    : []

  const pageNumber = state.skip / state.first
  const pageSize = state.first

  useQueryVarsWatcher([
    {
      key: 'poolTypes',
      value: poolFilters.poolTypes.join(','),
    },
    {
      key: 'networks',
      value: poolFilters.networks.join(','),
    },
    {
      key: 'search',
      value: poolFilters.searchText,
    },
    {
      key: 'skip',
      value: state.skip.toString(),
      shouldSet: () => state.skip !== 0,
    },
    {
      key: 'first',
      value: state.first.toString(),
      shouldSet: () => state.first !== 20,
    },
  ])

  return {
    state,
    pools,
    count: data?.count,
    loading,
    error,
    networkStatus,
    refetch,
    setPageSize,
    setPageNumber,
    pageNumber,
    pageSize,
    sorting,
    setSort,
    setNetworks,
    setPoolTypes,
    poolFilters,
  }
}

export function usePoolListSeedCacheQuery() {
  return useSuspenseQuery(GetPoolsDocument, {
    variables: initQueryState.variables,
  })
}

export const PoolListContext = createContext<ReturnType<typeof _usePoolList> | null>(null)

export function PoolListProvider(props: { children: ReactNode }) {
  const hook = _usePoolList()
  return <PoolListContext.Provider value={hook}>{props.children}</PoolListContext.Provider>
}

export function usePoolList() {
  return useContext(PoolListContext) as ReturnType<typeof _usePoolList>
}
