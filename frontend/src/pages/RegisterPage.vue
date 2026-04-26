<template>
  <q-card-section class="q-pb-none">
    <div class="text-h5 text-weight-bold">{{ t('register.title') }}</div>
    <div class="text-grey-7 q-mt-sm">
      {{ t('register.subtitle') }}
    </div>
  </q-card-section>

  <q-card-section class="column q-gutter-md">
    <q-input
      v-model="name"
      :label="t('register.name')"
      outlined
      rounded
      :error="!!nameError"
      :error-message="nameError"
      @keyup.enter="handleRegister"
    />

    <q-input
      v-model="email"
      :label="t('register.email')"
      outlined
      rounded
      :error="!!emailError"
      :error-message="emailError"
      @keyup.enter="handleRegister"
    />

    <q-input
      v-model="password"
      :label="t('register.password')"
      type="password"
      outlined
      rounded
      :error="!!passwordError"
      :error-message="passwordError"
      @keyup.enter="handleRegister"
    />
  </q-card-section>

  <q-card-actions vertical class="q-px-md q-pb-md">
    <q-btn
      :label="t('register.button')"
      color="primary"
      unelevated
      rounded
      class="full-width auth-btn"
      :loading="loading"
      @click="handleRegister"
    />

    <q-btn
      flat
      :label="t('register.goLogin')"
      class="q-mt-sm"
      @click="$router.push('/login')"
    />
  </q-card-actions>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { registerSchema } from '@/validation/auth'
import { Notify } from 'quasar'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const loading = ref(false)

const clearErrors = () => {
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
}

const handleRegister = async () => {
  clearErrors()
  loading.value = true

  try {
    await registerSchema.validate(
      {
        name: name.value,
        email: email.value,
        password: password.value,
      },
      { abortEarly: false }
    )

    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value, // 🔥 düz password
    })

    Notify.create({
      type: 'positive',
      message: t('register.success'),
      caption: t('register.successCaption'),
      position: 'top',
      timeout: 2500,
    })

    router.push('/login')
  } catch (err: any) {
    if (err?.inner?.length) {
      err.inner.forEach((error: any) => {
        if (error.path === 'name') nameError.value = error.message
        if (error.path === 'email') emailError.value = error.message
        if (error.path === 'password') passwordError.value = error.message
      })
    } else {
      const isEmailTaken =
        err?.message?.toLowerCase().includes('already') ||
        err?.message?.toLowerCase().includes('exists')

      Notify.create({
        type: isEmailTaken ? 'warning' : 'negative',
        message: isEmailTaken
          ? t('register.emailTaken')
          : t('register.failed'),
        caption: isEmailTaken
          ? t('register.emailTakenCaption')
          : t('register.failedCaption'),
        position: 'top',
        timeout: 3000,
      })

      console.error(err)
    }
  } finally {
    loading.value = false
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