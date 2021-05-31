import faker from 'faker'
import { MongoClient } from 'mongodb'

import { handler } from '../../../handlers/set-credentials'
import { createUser } from '../../../handlers/get-credentials'
import { lambdaEvent, lambdaContext } from '../../spec/mocks'

describe('Handlers / Set credentials / Integration tests', () => {
  describe('handler function', () => {
    let db
    let client

    beforeAll(async () => {
      client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      db = client.db()

      await db.dropDatabase()
    })

    afterEach(async () => {
      await db.dropDatabase()
    })

    afterAll(async () => {
      await db.dropDatabase()
      client.close()
    })

    it('should set credentials for an existing user', async () => {
      const email = faker.internet.email()
      const credentials = [
        {
          user: faker.random.word(),
          password: faker.random.word()
        }
      ]

      await createUser(email, db, [])

      const event = {
        ...lambdaEvent,
        body: JSON.stringify({ credentials }),
        requestContext: {
          ...lambdaEvent.requestContext,
          authorizer: {
            ...lambdaEvent.requestContext.authorizer,
            email
          }
        }
      }
      const { statusCode, body } = await handler(event, lambdaContext)

      const user = await db.collection('users').findOne({ email })

      expect(user.credentials).toStrictEqual(credentials)
      expect(statusCode).toBe(200)
      expect(JSON.parse(body)).toStrictEqual(credentials)
    })

    it('should create a new user with the received credentials', async () => {
      const email = faker.internet.email()
      const credentials = [
        {
          user: faker.random.word(),
          password: faker.random.word()
        }
      ]

      const event = {
        ...lambdaEvent,
        body: JSON.stringify({ credentials }),
        requestContext: {
          ...lambdaEvent.requestContext,
          authorizer: {
            ...lambdaEvent.requestContext.authorizer,
            email
          }
        }
      }
      const { statusCode, body } = await handler(event, lambdaContext)

      const user = await db.collection('users').findOne({ email })

      expect(user.email).toBe(email)
      expect(user.credentials).toStrictEqual(credentials)
      expect(statusCode).toBe(200)
      expect(JSON.parse(body)).toStrictEqual(credentials)
    })

    it("should return an error because email doesn't exist", async () => {
      const event = {
        ...lambdaEvent,
        body: JSON.stringify({
          credentials: [
            {
              user: faker.random.word(),
              password: faker.random.word()
            }
          ]
        }),
        requestContext: {
          ...lambdaEvent.requestContext,
          authorizer: {
            ...lambdaEvent.requestContext.authorizer
          }
        }
      }

      const { statusCode, body } = await handler(event, lambdaContext)

      expect(statusCode).toBe(404)
      expect(body).toBe('email not found')
    })

    it('should return an error because invalid schema', async () => {
      const event = {
        ...lambdaEvent,
        body: JSON.stringify({}),
        requestContext: {
          ...lambdaEvent.requestContext,
          authorizer: {
            ...lambdaEvent.requestContext.authorizer
          }
        }
      }

      const { statusCode, body } = await handler(event, lambdaContext)

      expect(statusCode).toBe(400)
      expect(body).toBe('Event object failed validation')
    })
  })
})
