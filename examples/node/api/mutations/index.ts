import { Permission } from "../permissions"
import { User } from "../models/User"
import { Login } from './Login'
import { Signup } from './Signup'

export type AuthPayload = {
  accessToken: string
  user: User
}


export interface Mutation {
  resolve: (root, args, ctx) => any
}
export type AuthArgs = {
  name?: string
  email: string
  password: string
}


export default {
  signup: Signup,
  login: Login
}
