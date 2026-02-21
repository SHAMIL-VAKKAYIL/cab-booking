import { logger } from "./config";
import { kafka } from "./kafka";

export interface ConsumerConfig {
    groupId: string;
    topic: string;
    fromBeginning?: boolean;
    eachMessage: (payload: {
        key: string | null;
        value: any;
        partition: number;
        offset: string;
    }) => Promise<void>;
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
            try {
                const value = message.value?.toString()
                const parsed = value ? JSON.parse(value) : null

                await config.eachMessage({
                    key:message.key?.toString() ||null,
                    value:parsed,
                    partition,
                    offset:message.offset
                })

            } catch (error) {
                logger.error({ error }, 'consumer faild to process')
            }
        }
    })
    return consumer
}