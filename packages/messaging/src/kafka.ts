import {Kafka} from 'kafkajs'

import dotenv from 'dotenv'

dotenv.config()


export const kafka =new Kafka({
    clientId:'cab_booking',
    brokers:[process.env.KAFKA_BROKER||'localhost:9092']
})