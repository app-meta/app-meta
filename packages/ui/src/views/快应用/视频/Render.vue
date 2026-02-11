<template>
    <n-card :title="title">
        <n-grid :gutter="10">
            <n-grid-item :span>
                <div ref="playerDiv" :style="style"></div>
            </n-grid-item>
            <n-grid-item :span="24-span">
                <n-card title="视频信息" size="small" :style="`height: `+height+`px`" content-style="overflow:auto">
                    <n-table size="small" :bordered="true" :single-line="false">
                        <tbody>
                            <tr>
                                <td class="text-center" width="120">大小</td>
                                <td>{{filesize(video.size)}}</td>
                            </tr>
                            <tr>
                                <td class="text-center">上传者</td>
                                <td>{{ video.user }}</td>
                            </tr>
                            <tr>
                                <td class="text-center">上传时间</td>
                                <td>{{ video.time? toDate(video.time) : "" }}</td>
                            </tr>
                        </tbody>
                    </n-table>

                    <div class="mt-4" v-if="video.summary">
                        <n-tag :bordered="false">描述信息</n-tag>
                        <div class="mt-1">{{ video.summary }}</div>
                    </div>
                </n-card>
            </n-grid-item>
        </n-grid>
    </n-card>
</template>

<script setup>
    import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
    import ArtPlayer from 'artplayer'

    import { renderProps, loadContent } from "../"

    const props = defineProps(renderProps)

    const height = window.innerHeight - 160
    let player = null

    let title = ref(props.page.name)
    const video = JSON.parse(props.data)

    const filesize  = r=> H.filesize(r)
    const toDate    = d=>H.date.datetime(d)
    
    let span = ref(24)
    const playerDiv = ref()
    const style = reactive({
        margin: "5px auto",
        height: `${height}px`,
        overflow: "hidden"
    })

    onMounted(() => {
        let { ratio = 16/9, highlight = [], path, showInfo } = video
        //计算宽度
        style.width = `${Math.floor(height * ratio)}px`
        span.value = showInfo ? 16 : 24

        let url = path ? window.SERVER+"/"+path : null

        //处理高亮点
        let highlights = []
        if(highlight){
            highlight.split("\n").forEach(line=>{
                let [time, text] = line.trim().split(/\s+/)
                if(time && text && !isNaN(time))
                    highlights.push({ time: Number(time), text })
            })
        }

        player = new ArtPlayer({
            //播放器的唯一标识，目前只用于记忆播放 autoplayback
            id: `video-${props.page.id}`,
            container: playerDiv.value,
            url, //'https://muiplayer.js.org/media/media.mp4',
            volume: 1.0,                //播放器的默认音量
            muted: false,               //是否默认静音
            autoSize: true,             //播放器的尺寸默认会填充整个 container 容器尺寸，所以经常出现黑边，该值能自动调整播放器尺寸以隐藏黑边
            autoPlay: false,
            loop: false,                //是否循环播放
            playbackRate: true,         //是否显示视频播放速度功能，会出现在 设置面板 和 右键菜单 里
            setting: true,              //是否在底部控制栏里显示 设置面板 的开关按钮
            screenshot: true,           //是否在底部控制栏里显示播放器 视频截图 功能
            fullscreen: true,           //是否在底部控制栏里显示播放器 窗口全屏 按钮
            fullscreenWeb: true,        //是否在底部控制栏里显示播放器 网页全屏 按钮
            pip: true,                  //是否在底部控制栏里显示 画中画 的开关按钮
            theme: window.color,        //播放器主题颜色，目前用于 进度条 和 高亮元素 上
            miniProgressBar: true,      //迷你进度条，只在播放器失去焦点后且正在播放时出现
            highlight: highlights,      //在进度条上显示高亮信息，格式为：[ { time:60, text:`前方高能` }]
            autoPlayback: true,         //是否使用自动 回放功能
            lock: true,                 //是否在移动端显示一个 锁定按钮 ，用于隐藏底部 控制栏
            aspectRatio: true,          //是否显示视频长宽比功能，会出现在 设置面板 和 右键菜单 里
        })
    })

    onUnmounted(() => player?.destroy(false))
</script>
