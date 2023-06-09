<!--表单类型的页面编辑-->
<template>
    <Designer :renders="RenderFuncs" :loading="loading" review :components="Components" contextMenu :form="bean" debug @save="toSave"
        class="window-h-full" />
</template>

<script setup>
    import { pageEditor } from "../"

    import { Designer, Components } from "@grid-form/designer"
    import { RenderFuncs } from "@grid-form/render-naive"
    import { createForm } from "@grid-form/common"

    let { id, bean, loading , updateContent } = pageEditor(createForm(), d=> JSON.parse(d))

    let toSave = form => updateContent(JSON.stringify(form), ()=> M.notice.ok(`表单数据保存成功`))
</script>
