import * as _md5 from 'blueimp-md5'
import { aes, toBase64, fromBase64 } from '@app-meta/basic'

export const md5 = v=> _md5(v)
export { aes, toBase64, fromBase64 }
