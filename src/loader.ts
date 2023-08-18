// eslint-disable-next-line
import 'dotenv/config'

// eslint-disable-next-line
import path from 'node:path'

import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'

import { JSONLoader } from 'langchain/document_loaders/fs/json'

import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

import { TokenTextSplitter } from 'langchain/text_splitter'

import { RedisVectorStore } from 'langchain/vectorstores/redis'

import { createClient } from 'redis'

const loader = new DirectoryLoader(path.resolve(__dirname, '../tmp'), {
  '.json': path => new JSONLoader(path, '/text'),
})

async function load() {
  const docs = await loader.load()

  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: 600,
    chunkOverlap: 0,
  })

  const splittedDocuments = await splitter.splitDocuments(docs)

  const redis = createClient({
    url: `redis://127.0.0.1:${process.env.REDIS_PORT}`,
  })

  await redis.connect()

  await RedisVectorStore.fromDocuments(
    splittedDocuments,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    {
      indexName: 'chat-embeddings',
      redisClient: redis,
      keyPrefix: 'chat',
    },
  )

  await redis.disconnect()
}

load()
