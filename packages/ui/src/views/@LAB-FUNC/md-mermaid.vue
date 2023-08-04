<template>
    <MDEditor ref="editor" height="600px" :code="code" />
</template>

<script setup>
    import MDRender from "@C/markdown/md.viewer.vue"
    import MDEditor from "@C/markdown/md.editor.vue"

    const code = `# Markdown 插件
> 此页面演示 markdown 插件功能

$$mermaid
flowchart LR;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
$$

$$mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
$$
    `
</script>
