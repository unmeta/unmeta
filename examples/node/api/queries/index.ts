import { Permission } from "../permissions";
import {Me} from './Me'
export interface Query {
  permissions: any
}
export function and(...args: Permission[]) {
  return {} as Permission
}
export function or(...args: Permission[]) {
  return {} as Permission
}

export default {
  me: Me
}