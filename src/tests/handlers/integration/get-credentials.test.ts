import faker from 'faker'
import { MongoClient } from 'mongodb'

import { handler, createUser } from '../../../handlers/get-credentials'
import { lambdaEvent, lambdaContext } from '../../spec/mocks'

describe('Handlers / Get credentials / Integration tests', () => {
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

    it('should return credentials for an existing user', async () => {
      const email = faker.internet.email()
      const credentials = [
        {
          user: faker.random.word(),
          password: faker.random.word()
        }
      ]

      await createUser(email, db, credentials)

      const event = {
        ...lambdaEvent,
        requestContext: {
          ...lambdaEvent.requestContext,
          authorizer: {
            ...lambdaEvent.requestContext.authorizer,
            email
          }
        }
      }
      const { statusCode, body } = await handler(event, lambdaContext)

      expect(statusCode).toBe(200)
      expect(JSON.parse(body)).toStrictEqual(credentials)
    })

    it("should return an error because email doesn't exist", async () => {
      const { statusCode, body } = await handler(lambdaEvent, lambdaContext)

      expect(statusCode).toBe(404)
      expect(body).toBe('email not found')
    })
  })
})
