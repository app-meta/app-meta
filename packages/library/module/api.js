import { withPost } from "../common";

/**
 * @param {Number}  id      开放接口ID
 * @param {Object}  params  接口参数
 */
export const call = (id, params={})=> withPost(`/api/${id}`, params)
