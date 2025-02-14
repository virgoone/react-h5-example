import { enableMapSet } from 'immer'
import { createContext, createElement, useContext, useRef } from 'react'
import type { PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'
import type { StorageValue } from 'zustand/middleware'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { Selector } from './type'

enableMapSet()

interface RootStoreProps { }

interface RootStoreState extends RootStoreProps {
  loading: boolean

  userInfo: { openid?: string, token?: string } | undefined

  init(): void

  reset: () => void
}

type RootStore = ReturnType<typeof createRootStore>

/**
 * Context
 */
const rootContext = createContext<RootStore | null>(null)

/**
 * 创建根级仓库
 * @param {Partial<RootStoreProps>} initialProps
 * @returns {RootStore}
 */
function createRootStore(initialProps?: Partial<RootStoreProps>) {
  return createStore<RootStoreState>()(
    persist(
      immer(
        devtools((set, get, store) => ({
          loading: true,
          addProjectModalVisible: false,
          scenes: undefined,
          currentProject: undefined,
          avatarUpdatedAt: '',
          userInfo: undefined,
          projects: [],
          ...initialProps,

          init: async () => {
            // const userInfo = get().userInfo
            // if (userInfo?._id) {
            //   return
            // }
            set((state) => {
              state.loading = false
            })
          },

         
          // 重置状态
          reset: () =>
            set((state) => {
              state.userInfo = undefined
            }),
        })),
      ),
      {
        name: 'root-storage',
        storage: {
          getItem: (name) => {
            const stringValue = localStorage.getItem(name)
            if (!stringValue) return null
            const { state } = JSON.parse(
              stringValue,
            ) as StorageValue<RootStoreProps>
            return {
              state: {
                ...state,
              },
            }
          },
          setItem: (name, newValue: StorageValue<RootStoreProps>) => {
            const stringValue = JSON.stringify({
              state: {
                ...newValue.state,
              },
            })
            localStorage.setItem(name, stringValue)
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      },
    ),
  )
}

/**
 * Provider
 * @description 上下文插件
 * @param {PropsWithChildren<RootStoreProps>}
 * @returns {JSX.Element}
 */
const RootProvider = ({
  children,
  ...props
}: PropsWithChildren<Partial<RootStoreProps>>) => {
  const storeRef = useRef<RootStore>()
  if (!storeRef.current) {
    storeRef.current = createRootStore(props)
  }
  return createElement(
    rootContext.Provider,
    { value: storeRef.current },
    children,
  )
}

/**
 * Hook
 * @description 获取上下文
 * @param {Selector} selector
 * @returns {RootStore}
 */
function useModel<T>(selector: Selector<RootStoreState, T>): T {
  const store = useContext(rootContext)
  if (!store) throw new Error('useModel must be used within a RootProvider')
  return useStore(store, selector)
}

export { RootProvider, useModel }
export type { RootStoreState }