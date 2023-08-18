// eslint-disable-next-line
import 'dotenv/config'

import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

import { RedisVectorStore } from 'langchain/vectorstores/redis'

import { createClient } from 'redis'

export const redis = createClient({
  url: `redis://127.0.0.1:${process.env.REDIS_PORT}`,
})

export const redisVectorStore = new RedisVectorStore(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  }),
  {
    indexName: 'chat-embeddings',
    redisClient: redis,
    keyPrefix: 'chat',
  },
)
