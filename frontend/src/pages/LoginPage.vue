<template>
  <q-card-section class="q-pb-none">
    <div class="text-h5 text-weight-bold">{{ t('login.title') }}</div>
    <div class="text-grey-7 q-mt-sm">
      {{ t('login.subtitle') }}
    </div>
  </q-card-section>

  <q-card-section class="column q-gutter-md">
    <q-input
      v-model="email"
      :label="t('login.email')"
      outlined
      rounded
      :error="!!emailError"
      :error-message="emailError"
      @keyup.enter="handleLogin"
    />

    <q-input
      v-model="password"
      :label="t('login.password')"
      type="password"
      outlined
      rounded
      :error="!!passwordError"
      :error-message="passwordError"
      @keyup.enter="handleLogin"
    />
  </q-card-section>

  <q-card-actions vertical class="q-px-md q-pb-md">
    <q-btn
      :label="t('login.button')"
      color="primary"
      unelevated
      rounded
      class="full-width auth-btn"
      @click="handleLogin"
    />

    <q-btn
      flat
      :label="t('login.goRegister')"
      class="q-mt-sm"
      @click="$router.push('/register')"
    />
  </q-card-actions>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { loginSchema } from '@/validation/auth'
import { Notify } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const emailError = ref('')
const passwordError = ref('')

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''

  try {
    await loginSchema.validate(
      { email: email.value, password: password.value },
      { abortEarly: false }
    )

    await authStore.login({
      email: email.value,
      password: password.value,
    })

    Notify.create({
      type: 'positive',
      message: t('login.success'),
      position: 'top',
    })

    router.push('/app/home')
  } catch (err: any) {
    if (err.inner) {
      err.inner.forEach((error: any) => {
        if (error.path === 'email') emailError.value = error.message
        if (error.path === 'password') passwordError.value = error.message
      })
    } else {
      Notify.create({
        type: 'negative',
        message: t('login.failed'),
        position: 'top',
      })
      console.error(err)
    }
  }
}
</script>

<style scoped>
.auth-btn {
  height: 46px;
  font-weight: 600;
  font-size: 15px;
}
</style>