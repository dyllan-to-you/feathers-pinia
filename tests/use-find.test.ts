import { computed } from 'vue'
import { createPinia } from 'pinia'
import { setup, models } from '../src/index'
import { api } from './feathers'
import { resetStores, timeout } from './test-utils'
import { useFind } from '../src'

const pinia = createPinia()

const { defineStore, BaseModel } = setup({ pinia, clients: { api } })

class Message extends BaseModel {
  static modelName = 'Message'
}

const servicePath = 'messages'
const useMessagesService = defineStore({ servicePath, Model: Message })

const messagesService = useMessagesService()

const reset = () => resetStores(api.service('messages'), messagesService)

describe('useFind', () => {
  describe('pagination off', () => {
    beforeEach(() => reset())
    afterEach(() => reset())

    test('returns correct data', async () => {
      const params = computed(() => ({ query: {} }))
      const data = useFind({ params, model: Message })

      expect(data.debounceTime.value).toBe(null)
      expect(data.error.value).toBe(null)
      expect(typeof data.find).toBe('function')
      expect(data.haveBeenRequested.value).toBe(true)
      expect(data.haveLoaded.value).toBe(false)
      expect(data.isLocal.value).toBe(false)
      expect(data.isPending.value).toBe(true)
      expect(data.items.value.length).toBe(0)
      expect(data.latestQuery.value).toBe(null)
      expect(data.paginationData.value).toBeDefined()
      expect(data.qid.value).toBe('default')
      expect(data.servicePath.value).toBe('messages')
    })

    test('reactive data works correctly', async () => {
      const params = computed(() => ({ query: {} }))
      const data = useFind({ params, model: Message })

      expect(data.items.value.length).toBe(0)

      await messagesService.create({ text: 'yo!' })

      expect(data.items.value.length).toBe(1)
    })
  })

  describe('pagination on', () => {
    beforeAll(() => {
      const messagesService = api.service('messages')
      messagesService.options.paginate = {
        default: 10,
        max: 100,
      }
    })
    beforeEach(() => reset())
    afterEach(() => reset())

    test('reactive data works correctly', async () => {
      const params = computed(() => ({ query: {} }))
      const data = useFind({ params, model: Message })

      expect(data.items.value.length).toBe(0)

      await messagesService.create({ text: 'yo!' })

      expect(data.items.value.length).toBe(1)
    })

    test('pagination data updates', async () => {
      const params = computed(() => ({ query: {} }))
      const data = useFind({ params, model: Message })

      expect(data.items.value.length).toBe(0)

      await timeout(200)

      expect(data.items.value.length).toBe(0)
      expect(data.paginationData.value.default).toHaveProperty('{}')
      expect(data.paginationData.value.default).toHaveProperty('mostRecent')
      expect(data.paginationData.value.defaultLimit).toBe(10)
      expect(data.paginationData.value.defaultSkip).toBe(0)
      expect(data.latestQuery.value).toBeTruthy()
    })
  })
})