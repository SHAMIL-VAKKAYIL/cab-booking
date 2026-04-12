import { Producer } from "kafkajs";
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithBackoff = async (
  fn: () => Promise<void>,
  retries: number,
  delay: number,
) => {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries) {
        throw err;
      }

      const backoff = delay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 500;
      logger.warn({ attempt, retries, err }, "Retrying message processing");
      await sleep(backoff * jitter);
    }
  }
};

export const createConsumer = async (
  config: ConsumerConfig,
  dlqProducer?: Producer,
) => {
  const admin = kafka.admin();
  await admin.connect();
  const topicsToCreate = [config.topic];
  if (config.dlqTopic) topicsToCreate.push(config.dlqTopic);
  
  try {
    const existingTopics = await admin.listTopics();
    const missingTopics = topicsToCreate.filter(t => !existingTopics.includes(t));
    if (missingTopics.length > 0) {
      await admin.createTopics({
        topics: missingTopics.map(t => ({ topic: t, numPartitions: 1 }))
      });
      logger.info({ topics: missingTopics }, "Created missing Kafka topics");
    }
  } catch (error) {
    logger.error({ error }, "Failed to create topics via admin");
  } finally {
    await admin.disconnect();
  }

  const consumer = kafka.consumer({ groupId: config.groupId });
  await consumer.connect();

  await consumer.subscribe({
    topic: config.topic,
    fromBeginning: config.fromBeginning ?? false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      let parsed: any = null;
      try {
        const value = message.value?.toString();
        parsed = value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error({ error }, "consumer faild to process");
        if (config.dlqTopic && dlqProducer) {
          await dlqProducer.send({
            topic: config.topic,
            messages: [
              {
                key: message.key?.toString(),
                value: JSON.stringify({
                  orginalTopic: topic,
                  originalPartiontion: partition,
                  originalOffset: message.offset,
                  error: "JSON parse failure",
                  rawValue: message.value?.toString(),
                  failedAt: new Date().toISOString(),
                }),
              },
            ],
          });
        }
        return;
      }

      try {
        await retryWithBackoff(
          async () => {
            await config.eachMessage({
              key: message.key?.toString() || null,
              value: parsed,
              partition,
              offset: message.offset,
            });
          },
          config.retries ?? 3,
          config.retryDelayMs ?? 1000,
        );
      } catch (error) {
        logger.error(
          { error, topic, partition, offset: message.offset },
          "Consumer failed after retries",
        );
        if (config.dlqTopic && dlqProducer) {
          await dlqProducer.send({
            topic: config.dlqTopic,
            messages: [
              {
                key: message.key?.toString(),
                value: JSON.stringify({
                  originalTopic: topic,
                  originalPartition: partition,
                  originalOffset: message.offset,
                  error: (error as Error).message,
                  failedAt: new Date().toISOString(),
                  payload: parsed,
                }),
              },
            ],
          });
          // don't rethrow — message is in DLQ, commit the offset
          return;
        }
        throw error;
      }
    },
  });
  return consumer;
};
