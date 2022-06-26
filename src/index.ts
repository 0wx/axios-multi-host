import axios, { AxiosError, AxiosRequestConfig } from 'axios'

interface URLConfig {
  check: URL
  host: URL
}

export type Method = 'head' | 'get' | 'post' | 'delete' | 'put' | 'patch'

/**
 * It returns a promise that resolves after a given number of milliseconds
 * @param {number} ms - number - The number of milliseconds to wait.
 * @returns A promise that resolves after a given number of milliseconds.
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type MultiHostList =
  | string[]
  | {
      host: string
      check: string
    }[]
  | URLConfig[]

export interface MultiHostConfig {
  method?: Method
  interval?: number
}

/**
 * It's a class that takes a list of hosts,
 * and then it will check each host to see if it's up,
 * and if it is, it will put it at the front of the list
 */
export class AxiosMultiHost {
  private list: URLConfig[]
  private interval: number
  private isStop: boolean
  private method: Method
  private choosen: URLConfig

  private changeOnProcess: boolean
  private isCheckingAlreadyStarted: boolean

  private cb: () => void
  /**
   * A constructor function that takes in a list and a config object.
   * @param {MultiHostList} list - MultiHostList
   * @param {MultiHostConfig} [config] - MultiHostConfig
   */
  constructor(list: MultiHostList, config?: MultiHostConfig) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.cb = () => {}
    this.isCheckingAlreadyStarted = false
    this.changeOnProcess = false
    const _list = list.map((value) => {
      if (typeof value === 'string') {
        return {
          host: new URL(value),
          check: new URL(value),
        }
      }
      return {
        host: new URL(value.host),
        check: new URL(value.check),
      }
    })

    this.list = _list
    this.isStop = false

    this.interval = config?.interval || 30000
    this.method = config?.method || 'head'
    this.choosen = _list[0]
  }

  private check = async () => {
    let count = 0
    for (const url of this.list) {
      try {
        await axios[this.method](url.check.href)
        this.choosen = url
        break
        // eslint-disable-next-line no-empty
      } catch (error) {
        count++
      }
    }

    if (count === this.list.length) {
      this.cb()
    }
  }

  /**
   * Check the hosts repeatedly, and if one of them is up,
   * it will put it at the front of the list. and put it
   * at `this.choosen`
   */
  public repetitiveCheck = async (interval?: number) => {
    if (interval) {
      this.interval = interval
    }
    if (this.isCheckingAlreadyStarted) {
      return
    }

    this.isCheckingAlreadyStarted = true
    while (!this.isStop) {
      await this.check()
      await wait(this.interval)
    }
  }

  public stopRepetitiveCheck = () => {
    this.isStop = true
  }

  public middleware = (config: AxiosRequestConfig) => {
    config.baseURL = this.choosen.host.href
    return config
  }

  public error = (error: AxiosError) => {
    if (this.changeOnProcess) return Promise.reject(error)
    return new Promise((_resolve, reject) => {
      this.changeOnProcess = true
      this.check().then(() => {
        this.changeOnProcess = false
        reject(error)
      })
    })
  }

  /**
   * It's a getter function that returns the host of the choosen url.
   * */
  public getHost = () => this.choosen.host.href

  public onAllDown = (callback: () => void) => {
    this.cb = callback
  }
}
