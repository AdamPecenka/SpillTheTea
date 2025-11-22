<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-2" style="width: 400px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h5 text-primary text-weight-bold">
          Login
        </div>
      </q-card-section>

      <q-form @submit="onSubmit" class="q-gutter-md q-mt-md">
        <q-input 
          filled
          label="Username"
          v-model="username"
          lazy-rules
          :rules="[ val => !!val || 'Please enter your username' ]"
        />

        <q-input
          filled
          label="Password"
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          lazy-rules
          :rules="[ val => !!val || 'Please enter your password' ]"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>

        <div class="q-mt-md flex justify-center">
          <q-btn label="Login" type="submit" color="primary" unelevated />
        </div>

        <div class="text-center q-mt-md">
          <span>Don’t have an account? </span>
          <q-btn 
            flat
            color="primary"
            label="Register"
            class="q-pa-none text-bold"
            @click="goToRegister"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import { Notify } from 'quasar';
import { useAuthStore } from 'src/store/useAuthStore';

export default {
  data () {
    return {
      authStore: useAuthStore(),
      username: "",
      password: "",
      isPwd: true
    }
  },
  methods: {
    async onSubmit () {
      
      const ok = await this.authStore.login(this.username, this.password);

      if(ok) {
        this.$router.push({ name: 'index' })
      } else {
        Notify.create({
          type: 'negative',
          message: 'Invalid username or password'
        });
      }
    },
    goToRegister () {
      this.$router.push({ name: 'register' })
    }
  }
}
</script>
