import { RetrievalQAChain } from 'langchain/chains'

import { ChatOpenAI } from 'langchain/chat_models/openai'

import { PromptTemplate } from 'langchain/prompts'

import { redis, redisVectorStore } from 'redis-store'

const openAiCHat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.3,
})

const prompt = new PromptTemplate({
  template: `
    

    Transcrições: 
    {context}

    Pergunta:
    {question}
  `.trim(),
  inputVariables: ['context', 'question'],
})

const chain = RetrievalQAChain.fromLLM(
  openAiCHat,
  redisVectorStore.asRetriever(),
  {
    prompt,
    returnSourceDocuments: true,
    verbose: true,
  },
)

async function main() {
  await redis.connect()

  const response = await chain.call({
    query: 'Quais as formações disponíveis?',
  })

  console.log('🚀 ~ file: gpt.ts:52 ~ main ~ response:', response)

  await redis.disconnect()
}

main()
