<template>
    <AuthSelector v-model:value="auth" ref="selector"></AuthSelector>
    {{auth}}
</template>

<script setup>
    import { ref } from 'vue'

    import AuthSelector from "@CC/selector.auth.vue"

    let auth = ref("U|0001,U|0006,D|01")
</script>
