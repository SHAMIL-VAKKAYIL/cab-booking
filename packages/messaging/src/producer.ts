import { kafka } from "./kafka";

const producer = kafka.producer()

export const connectProducer = async () => {
    await producer.connect();
}

export const publishEvent = async (topic: string, message: unknown) => {
    await producer.send({
        topic: topic,
        messages: [
            {
                value: JSON.stringify(message),
            },
        ],
    });
};