import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import { MongoClient } from 'mongodb'
import createError from 'http-errors'
import validator from '@middy/validator'

import schema from '../lib/schemas/set-credentials-schema'
import { commonMiddleware } from '../lib/common-middleware'
import { IUserCredentials } from '../lib/types'

let client = null

export const handler = commonMiddleware(
  async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!client) {
      client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).catch((error) => {
        console.error('there was an error connecting with mongo', error)
        throw new createError.InternalServerError()
      })
    }

    const db = client.db()

    const { email } = event.requestContext.authorizer

    if (!email) {
      throw new createError.NotFound(`email not found`)
    }

    const { credentials } = event.body as unknown as { credentials: IUserCredentials[] }

    await db
      .collection('users')
      .updateOne(
        { email },
        {
          $set: {
            email,
            credentials
          }
        },
        { upsert: true }
      )
      .catch((error) => {
        console.error('there was an error updating a user', error)
        throw new createError.InternalServerError()
      })

    return {
      statusCode: 200,
      body: JSON.stringify(credentials)
    }
  }
).use(
  validator({
    inputSchema: schema
  })
)
