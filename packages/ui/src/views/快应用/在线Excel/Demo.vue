<template>
    <hot-table :data="data" :rowHeaders="true" :colHeaders="true"
        :dropdownMenu="true" :autoColumnSize="true" :contextMenu="true" :filters="true"
        licenseKey="non-commercial-and-evaluation"></hot-table>
</template>

<script setup>
    import { ref } from 'vue'

    import 'handsontable/dist/handsontable.full.css'

    import { HotTable } from '@handsontable/vue3'
    import { registerAllModules } from 'handsontable/registry'

    registerAllModules()

    let data = [
        ['', 'Ford', 'Volvo', 'Toyota', 'Honda', '备注'],
        ['2016', 10, 11, 12, 13, '稳步上升'],
        ['2017', 20, 11, 14, 13, '业绩不错（趋势好）'],
        ['2018', 30, 15, 12, 13, '']
    ]
</script>

<!-- <style src="handsontable/dist/handsontable.full.css"></style> -->
