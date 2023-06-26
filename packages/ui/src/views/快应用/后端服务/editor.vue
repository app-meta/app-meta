<!---->
<template>
    <!-- style="width:960px;margin:0px auto;" -->
    <n-card title="后端服务配置" segmented size="small">
        <n-alert :bordered="false" type="info">
            首次使用时，请编辑本页内容并保存，仅当 <Tag>部署方式</Tag> 设置为 <Tag>平台部署</Tag> 才能解锁 ⌈上传与部署⌋ 面板
        </n-alert>
        <n-form :show-feedback="false" size="large" label-placement="left" label-width="140">
            <n-space vertical>
                <n-form-item label="部署方式">
                    <n-radio-group v-model:value="bean.mode">
                        <n-space>
                            <n-tooltip v-for="o in deployModes" >
                                <template #trigger><n-radio :value="o.value" :label="o.label"/></template>
                                {{o.summary}}
                            </n-tooltip>
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <n-form-item label="开发语言">
                    <n-radio-group v-model:value="bean.language">
                        <n-space>
                            <n-radio v-for="item in languages" :value="item.value" :label="item.label" />
                        </n-space>
                    </n-radio-group>
                    <n-text depth="3" class="ml-3">平台部署目前仅支持 Node.js、Jar</n-text>
                </n-form-item>
                <n-form-item v-if="bean.mode=='outside'" label="服务地址">
                    <n-input v-model:value="bean.url" />
                </n-form-item>
                <template v-if="bean.mode=='inside'">
                    <n-form-item label="服务端口">
                        <n-input-number v-model:value="bean.port" class="w-full" />
                    </n-form-item>
                    <n-form-item label="启动参数">
                        <n-input v-model:value="bean.args" placeholder="程序启动参数，如--mode=production">
                            <template #suffix>
                                <n-popover>
                                    <template #trigger>
                                        <n-icon :component="QuestionCircle" class="cursor-pointer" />
                                    </template>
                                    对于 <n-tag :bordered="false" type="primary" size="small">JAVA</n-tag> 应用程序，需输入除去 java 后的命令，如：
                                    <div class="mt-2 mb-2">
                                        <n-text class="w-full" code>-server -jar xxx-1.0.jar</n-text>
                                    </div>
                                    则实际执行的是 java -server -jar xxx-1.0.jar
                                </n-popover>
                            </template>
                        </n-input>
                    </n-form-item>
                    <!-- <n-form-item label="日志文件">
                        <n-input v-model:value="bean.logFile" placeholder="导出日志文件时会用到" />
                    </n-form-item> -->
                    <n-form-item label="启用数据库">
                        <n-switch v-model:value="bean.useDB" />
                        <n-text depth="3" class="ml-3">勾选后则需要填写详细的数据库信息</n-text>
                    </n-form-item>
                    <template v-if="bean.useDB">
                        <n-form-item label="数据库地址">
                            <n-input-group>
                                <n-input v-model:value="bean.dbHost" />
                                <n-input-group-label size="large">:</n-input-group-label>
                                <n-input-number style="width:220px" v-model:value="bean.dbPort" :min="0" placeholder="端口" />
                            </n-input-group>
                        </n-form-item>
                        <n-form-item label="数据库名称"><n-input v-model:value="bean.dbName" /></n-form-item>
                        <n-form-item label="数据库用户"><n-input v-model:value="bean.dbUser" /></n-form-item>
                        <n-form-item label="数据库密码"><n-input type="password" v-model:value="bean.dbPwd" /></n-form-item>
                    </template>
                </template>
            </n-space>
        </n-form>

        <div class="text-center mt-4">
            <n-button type="primary" size="large" @click="toSave">保存</n-button>
        </div>
    </n-card>

</template>

<script setup>
    import { ref } from 'vue'
    import { Trash, QuestionCircle } from '@vicons/fa'

    import { deployModes, languages } from "."

    const props = defineProps({
        bean: {type:Object},
        updater:{type:Function}
    })

    let toSave = () => {
        let { useDB, dbHost, dbName, dbUser, dbPwd } = props.bean

        props.updater(_raw(props.bean), ()=> M.notice.ok(`后端服务配置保存成功`))
    }
</script>
