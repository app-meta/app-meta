const { stat, statSync, readdirSync } = require('fs')
const { networkInterfaces } = require('os')
const { resolve } = require('path')

const macRegex = /(?:[a-z0-9]{1,2}[:-]){5}[a-z0-9]{1,2}/i
const zeroRegex = /(?:[0]{1,2}[:-]){5}[0]{1,2}/

/**
 * CODE = require(https://github.com/bevry/getmac/blob/master/source/index.ts
 *
 * Get the first proper MAC address
 * @param iface If provided, restrict MAC address fetching to this interface
 */
exports.getMAC = function(iface) {
	const list = networkInterfaces()
	if (!!iface) {
		const parts = list[iface]
		if (!parts) {
			throw new Error(`interface ${iface} was not found`)
		}
		for (const part of parts) {
			if (zeroRegex.test(part.mac) === false) {
				return part.mac
			}
		}
		throw new Error(`interface ${iface} had no valid mac addresses`)
	} else {
		for (const [key, parts] of Object.entries(list)) {
			// for some reason beyond me, this is needed to satisfy typescript
			// fix https://github.com/bevry/getmac/issues/100
			if (!parts) continue
			for (const part of parts) {
				if (zeroRegex.test(part.mac) === false) {
					return part.mac
				}
			}
		}
	}
	throw new Error('failed to get the MAC address')
}

exports.loadScript = (pathOrFile, filter="\.js$")=>{
    if(statSync(pathOrFile).isFile())
        return require(pathOrFile)

    let reg = RegExp(filter)
    return readdirSync(pathOrFile).filter(n=> reg.test(n)).map(name=>({name, module: require(resolve(pathOrFile, name))}))
}
