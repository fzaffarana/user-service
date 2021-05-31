import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda'
import { MongoClient, Db, InsertOneWriteOpResult } from 'mongodb'
import { v4 as uuid } from 'uuid'
import createError from 'http-errors'

import { commonMiddleware } from '../lib/common-middleware'
import { IUser, IUserMongo, IUserCredentials } from '../lib/types'

export const createUser = async (
  email: string,
  db: Db,
  credentials: IUserCredentials[] = []
): Promise<InsertOneWriteOpResult<IUserMongo> | void> => {
  const user: IUser = {
    id: uuid(),
    email,
    credentials
  }

  return db
    .collection('users')
    .insertOne(user)
    .catch((error) => {
      console.error('there was an error inserting a new user', error)
      throw new createError.InternalServerError()
    })
}

export const getCredentialsByEmail = async (
  email: string,
  db: Db
): Promise<IUserCredentials[] | void> => {
  const user = await db
    .collection('users')
    .findOne({ email })
    .catch((error) => {
      console.error('there was an error getting an user from mongo', error)
      throw new createError.InternalServerError()
    })

  if (!user) {
    await createUser(email, db)

    return []
  }

  return user.credentials
}

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

    const credentials = await getCredentialsByEmail(email, db)

    return {
      statusCode: 200,
      body: JSON.stringify(credentials)
    }
  }
)
