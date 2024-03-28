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
                    <n-form-item label="免登录 URLs">
                        <n-flex vertical class="w-full">
                            <n-alert type="warning" :bordered="false">
                                通常情况下，平台会对转发到后端的请求进行登录验证；如有特殊情况，可配置下方规则，对指定地址放行（支持通配符），请慎用此功能
                            </n-alert>

                            <n-dynamic-tags size="large" v-model:value="bean.publics" />
                        </n-flex>

                        <!-- <n-input v-model:value="bean.publics" placeholder="[慎用]不作登录检查的后端地址（支持通配符），多个用英文逗号隔开" class="w-full" /> -->
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
                        <n-space vertical class="w-full mt-2">
                            <div>
                                <n-switch v-model:value="bean.useDB" size="large" />
                                <n-text depth="3" class="ml-3">勾选后，部署服务时平台会注入数据源信息</n-text>
                            </div>
                            <n-card v-if="bean.useDB">
                                <template #header>
                                    <Database class="icon" />
                                    配置数据源：
                                    <n-switch v-model:value="bean.useSource" :round="false" size="large">
                                        <template #checked>现有数据源</template>
                                        <template #unchecked>自定义</template>
                                    </n-switch>
                                </template>
                                <n-form :show-feedback="false" label-placement="top" label-width="140">
                                    <n-form-item v-if="bean.useSource" label="请选择数据源（仅限已授权）">
                                        <DbmSelector v-model="bean.dbSource" />
                                    </n-form-item>
                                    <n-grid v-else x-gap="10" cols="5">
                                        <n-form-item-gi label="数据库地址" span="2">
                                            <n-input-group>
                                                <n-input v-model:value="bean.dbHost" />
                                                <n-input-group-label >:</n-input-group-label>
                                                <n-input-number v-model:value="bean.dbPort" :min="0" placeholder="端口" />
                                            </n-input-group>
                                        </n-form-item-gi>
                                        <n-form-item-gi label="库名"><n-input v-model:value="bean.dbName" /></n-form-item-gi>
                                        <n-form-item-gi label="连接用户"><n-input v-model:value="bean.dbUser" /></n-form-item-gi>
                                        <n-form-item-gi label="授权密码"><n-input type="password" v-model:value="bean.dbPwd" /></n-form-item-gi>
                                    </n-grid>
                                </n-form>
                            </n-card>
                        </n-space>
                    </n-form-item>

                </template>
            </n-space>
        </n-form>

        <div class="text-center mt-4">
            <n-button type="primary" size="large" @click="toSave">保存配置信息</n-button>
        </div>
    </n-card>

</template>

<script setup>
    import { ref } from 'vue'
    import { QuestionCircle, Database } from '@vicons/fa'

    import DbmSelector from "@V/dbm/selector-source.vue"

    import { deployModes, languages,checkServerConfig } from "."

    const props = defineProps({
        bean: {type:Object},
        updater:{type:Function}
    })

    let toSave = () => {
        let d = _raw(props.bean)
        if(checkServerConfig(d) === true){
            props.updater(d, ()=> M.notice.ok(`后端服务配置保存成功`))
        }
    }
</script>
