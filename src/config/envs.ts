
import * as joi from "joi"
import 'dotenv/config'

interface Envs{
    PORT:number
    NATS_SERVERS: string[],
    JWT_SECRET:string
}

const joiSchema = joi.object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    JWT_SECRET: joi.string().required()
}).unknown(true)

const {value, error} = joiSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS.split(",")
});

if(error){
    throw new Error(`Config envs ${error.message}`)
}

const envValues:Envs = value;  

export const envs = {
    port: envValues.PORT,
    natsServers: envValues.NATS_SERVERS,
    jwtSecret: envValues.JWT_SECRET
}