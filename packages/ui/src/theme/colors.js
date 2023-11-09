/**
 * 主配色
 * 色彩来源 https://ant-design.antgroup.com/docs/spec/colors-cn
 * 感谢 ant-design 项目😄
 */

const colors = {
    '默认': ['#36ad6a', '#18a058', '#0c7a43'],
    '企业蓝': ['#1677ff', '#40a9ff', '#0050b3'],
    '极客蓝': ['#1d39c4', '#597ef7', '#10239e'],
    '法式洋红': ['#c41d7f', '#f759ab', '#9e1068'],
    '酱紫': ['#531dab', '#9254de', '#391085'],
    '明青': ['#08979c', '#36cfc9', '#006d75'],
    '极光绿': ['#389e0d', '#73d13d', '#237804'],
    '日出': ['#d4b106', '#ffec3d', '#ad8b00'],
    '金盏花': ['#d48806', '#ffc53d', '#ad6800'],
    '日暮': ['#d46b08', '#ffa940', '#ad4e00'],
    '火山': ['#d4380d', '#ff7a45', '#ad2102'],
    '薄暮': ['#cf1322', '#ff4d4f', '#a8071a'],
}

export { colors }

export const getPrimaryColor =  color=> {
    let c = colors[color||"默认"]
    if(!c)  return {}

    return {
        primaryColor: c[0],
        primaryColorHover: c[1],
        primaryColorPressed: c[2],
        primaryColorSuppl: c[0]
    }
}
