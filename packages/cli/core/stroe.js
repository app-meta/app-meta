import Conf from 'conf'

const config = new Conf({ projectName: 'app-meta' })

/**
 *
 * @param {*} name
 * @param {*} value
 * @returns
 */
export const setItem = (name, value)=> config.set(name, value)

/**
 *
 * @param {*} name
 * @returns
 */
export const getItem = name => config.get(name)
