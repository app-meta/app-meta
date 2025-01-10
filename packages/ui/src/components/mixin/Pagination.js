/*
 * @Author: 集成显卡
 * @Date: 2022-03-31 17:50:26
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2024-12-18 11:54:20
 *
 * 分页复用模块
 */

import { ref, onMounted,reactive, createVNode } from 'vue'

export default (api, autoLoad=true, loader=undefined)=>{
    let ps = typeof(api) == 'object'? api: { url: api, form:{}, aid:"", pageSize:20 }
    let beans = ref([])
    let pagination = reactive({
        loading: false,
        page:1,
        pageSize: ps.pageSize??20,
        showSizePicker:true,
        pageSizes: [20, 50, 100, 200],
        itemCount:0,
        prefix: info=> createVNode('div', {}, `加载 ${beans.value.length} 条数据（数据总数 ${info.itemCount}）`),
        onUpdatePage: page=> {
            pagination.page = page
            refresh(false)
        },
        onUpdatePageSize : pageSize => {
            pagination.pageSize = pageSize
            refresh(false)
        }
    })
    let form = ref(ps.form||{})

    const _done = d=>{
        beans.value = d.data
        pagination.itemCount = d.total
        pagination.loading = false
        console.debug(`分页信息加载完成`, ps.url, d)
    }

    /**
     * 参数 reset 为是否重置分页，默认 true
     */
    let refresh = loader || function(reset=true) {
        let body = { form: _raw(form.value), pagination: {page: reset ? 1 : pagination.page, pageSize: pagination.pageSize} }
        pagination.loading = true
        if(!!ps.aid){
            //使用 H.service.json 获取数据
            H.service.json(ps.aid, ps.url, body)
                .then(_done)
                .catch(e=> {
                    M.showError(e.message??e, `获取远程数据出错`)
                    pagination.value = false
                })
        }
        else
            RESULT(ps.url, body, _done, {loading: pagination.loading})
    }

    onMounted(() => {
        if(autoLoad)    refresh()
    })

    return { beans, pagination, form, refresh }
}
