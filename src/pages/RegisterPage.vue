<template>
  <q-card-section class="q-pb-none">
    <div class="text-h5 text-weight-bold">Create account</div>
    <div class="text-grey-7 q-mt-sm">
      Register to start managing your notes and tasks.
    </div>
  </q-card-section>

  <q-card-section class="column q-gutter-md">
    <q-input
      v-model="name"
      label="Name"
      outlined
      rounded
      :error="!!nameError"
      :error-message="nameError"
      @keyup.enter="handleRegister"
    />

    <q-input
      v-model="email"
      label="Email"
      outlined
      rounded
      :error="!!emailError"
      :error-message="emailError"
      @keyup.enter="handleRegister"
    />

    <q-input
      v-model="password"
      label="Password"
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
      label="Register"
      color="primary"
      unelevated
      rounded
      class="full-width auth-btn"
      :loading="loading"
      @click="handleRegister"
    />

    <q-btn
      flat
      label="Already have an account? Login"
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
import bcrypt from 'bcryptjs'

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
      { name: name.value, email: email.value, password: password.value },
      { abortEarly: false }
    )

    const hashedPassword = await bcrypt.hash(password.value, 10)

    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: hashedPassword,
    })

    Notify.create({
      type: 'positive',
      message: 'Account created successfully',
      caption: 'You can now login with your credentials.',
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
        message: isEmailTaken ? 'This email is already registered' : 'Registration failed',
        caption: isEmailTaken
          ? 'Please login or use another email.'
          : 'Something went wrong. Please try again.',
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