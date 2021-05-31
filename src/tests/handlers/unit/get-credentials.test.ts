import faker from 'faker'
import { MongoClient } from 'mongodb'

import { createUser, getCredentialsByEmail } from '../../../handlers/get-credentials'

describe('Handlers / Get credentials / Unit tests', () => {
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

  describe('createUser function', () => {
    it('should create an user with defaults credentials', async () => {
      const email = faker.internet.email()

      await createUser(email, db)

      const user = await db.collection('users').findOne({ email })

      expect(user.email).toBe(email)
      expect(user.credentials).toStrictEqual([])
    })

    it('should create an user with custom credentials', async () => {
      const email = faker.internet.email()
      const credentials = [
        {
          user: faker.random.word(),
          password: faker.random.word()
        }
      ]

      await createUser(email, db, credentials)

      const user = await db.collection('users').findOne({ email })

      expect(user.email).toBe(email)
      expect(user.credentials).toStrictEqual(credentials)
    })
  })

  describe('getCredentialsByEmail function', () => {
    it("should return empty credentials and create the user because it doesn't exist", async () => {
      const email = faker.internet.email()

      const credentials = await getCredentialsByEmail(email, db)
      const user = await db.collection('users').findOne({ email })

      expect(credentials).toStrictEqual([])
      expect(user.email).toBe(email)
      expect(user.credentials).toStrictEqual([])
    })

    it('should return existing credentials', async () => {
      const email = faker.internet.email()
      const _credentials = [
        {
          user: faker.random.word(),
          password: faker.random.word()
        }
      ]

      await createUser(email, db, _credentials)

      const credentials = await getCredentialsByEmail(email, db)

      expect(credentials).toStrictEqual(_credentials)
    })
  })
})
