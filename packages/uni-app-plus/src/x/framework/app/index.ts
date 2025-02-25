import type { App, ComponentPublicInstance } from 'vue'
import { extend } from '@vue/shared'
import { formatLog } from '@dcloudio/uni-shared'
import { defineGlobalData } from '@dcloudio/uni-core'

// import { initEntry } from './initEntry'
// import { initTabBar } from './initTabBar'
import { initGlobalEvent } from './initGlobalEvent'
import { initAppLaunch } from './initAppLaunch'
// import { clearTempFile } from './clearTempFile'
import { initSubscribeHandlers } from './subscriber'
import { initVueApp } from '../../../service/framework/app/vueApp'
import type { IApp } from '@dcloudio/uni-app-x/types/native'
import { initService } from './initService'
// import { initKeyboardEvent } from '../dom/keyboard'
import { setNativeApp } from './app'
import { initComponentInstance } from './initComponentInstance'

let appCtx: ComponentPublicInstance
const defaultApp = {
  globalData: {},
}

function initAppVm(appVm: ComponentPublicInstance) {
  appVm.$vm = appVm
  appVm.$mpType = 'app'
  // TODO uni-app x useI18n
}

export function getApp({ allowDefault = false } = {}) {
  if (appCtx) {
    // 真实的 App 已初始化
    return appCtx
  }
  if (allowDefault) {
    // 返回默认实现
    return defaultApp
  }
  console.error(
    '[warn]: getApp() failed. Learn more: https://uniapp.dcloud.io/collocation/frame/window?id=getapp.'
  )
}

export function registerApp(appVm: ComponentPublicInstance, nativeApp: IApp) {
  if (__DEV__) {
    console.log(formatLog('registerApp'))
  }
  initEntryPagePath(nativeApp)

  setNativeApp(nativeApp)

  // // 定制 useStore （主要是为了 nvue 共享）
  // if ((uni as any).Vuex && (appVm as any).$store) {
  //   const { useStore } = (uni as any).Vuex
  //     ; (uni as any).Vuex.useStore = (key: string) => {
  //       if (!key) {
  //         return (appVm as any).$store
  //       }
  //       return useStore(key)
  //     }
  // }

  initVueApp(appVm)

  appCtx = appVm
  initAppVm(appCtx)

  extend(appCtx, defaultApp) // 拷贝默认实现

  defineGlobalData(appCtx, defaultApp.globalData)

  initService(nativeApp)

  // initEntry()
  // initTabBar()
  initGlobalEvent(nativeApp)
  // initKeyboardEvent()
  initSubscribeHandlers()

  initAppLaunch(appVm)

  // // 10s后清理临时文件
  // setTimeout(clearTempFile, 10000)

  __uniConfig.ready = true

  // nav
}

export function initApp(app: App) {
  initComponentInstance(app)
}

function initEntryPagePath(app: IApp) {
  const redirectInfo = app.getRedirectInfo()
  const debugInfo = redirectInfo.get('debug')
  if (debugInfo) {
    const url = debugInfo.get('url')
    if (url && url != __uniConfig.entryPagePath) {
      __uniConfig.realEntryPagePath = __uniConfig.entryPagePath
      const [path, query] = url.split('?')
      __uniConfig.entryPagePath = path
      if (query) {
        __uniConfig.entryPageQuery = `?${query}`
      }
      return
    }
  }
  if (__uniConfig.conditionUrl) {
    __uniConfig.realEntryPagePath = __uniConfig.entryPagePath
    const conditionUrl = __uniConfig.conditionUrl
    const [path, query] = conditionUrl.split('?')
    __uniConfig.entryPagePath = path
    if (query) {
      __uniConfig.entryPageQuery = `?${query}`
    }
  }
}
