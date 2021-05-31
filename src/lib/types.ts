import { v4 } from 'uuid'

export interface IUserCredentials {
  user: string
  password: string
}

export interface IUser {
  id: v4
  email: string
  credentials: IUserCredentials[]
}

export interface IUserMongo extends IUser {
  _id: string
}
