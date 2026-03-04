import { logger } from "./config";
import { kafka } from "./kafka";

export interface ConsumerConfig {
    groupId: string;
    topic: string;
    fromBeginning?: boolean;
    retries?: number;
    retryDelayMs?: number;
    dlqTopic?: string;
    eachMessage: (payload: {
        key: string | null;
        value: any;
        partition: number;
        offset: string;
    }) => Promise<void>;
}

const sleep = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms))

const retryWithBackoff = async (fn: () => Promise<void>, retries: number, delay: number) => {
    let attempt = 0


    while (true) {
        try {
            return await fn();
        } catch (err) {
            attempt++
            if (attempt > retries) {
                throw err
            }

            await sleep(delay * attempt)
        }
    }
}


export const createConsumer = async (config: ConsumerConfig) => {

    const consumer = kafka.consumer({ groupId: config.groupId })
    await consumer.connect()

    await consumer.subscribe({
        topic: config.topic,
        fromBeginning: config.fromBeginning ?? false
    })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const value = message.value?.toString()
            const parsed = value ? JSON.parse(value) : null
            try {
                await retryWithBackoff(
                    async () => {
                        await config.eachMessage({
                            key: message.key?.toString() || null,
                            value: parsed,
                            partition,
                            offset: message.offset
                        })
                    },
                    config.retries ?? 3,
                    config.retryDelayMs ?? 1000
                )
            } catch (error) {
                logger.error({ error }, 'consumer faild to process')
                if (config.dlqTopic) {
                    const producer = kafka.producer();
                    await producer.connect();
                    await producer.send({
                        topic: config.dlqTopic,
                        messages: [
                            {
                                key: message.key?.toString(),
                                value: JSON.stringify(parsed)
                            }
                        ]
                    })
                }
                throw error;
            }
        }
    })
    return consumer
}