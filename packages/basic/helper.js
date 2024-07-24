/*
 * @Author: 集成显卡
 * @Date: 2023-06-01 09:37:51
 * @Last Modified by:   集成显卡
 *
 * 针对 meta 后台服务的工具封装
 *
 * 2023-06-01 目前是设计阶段（儿童节快乐 😀）
 */

import { toBase64 } from "./secret"

export const dbmSQLModel = m=> Object.assign({sourceId:""}, m, {sql: m.sql?toBase64(m.sql):""})
