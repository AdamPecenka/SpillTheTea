<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-2" style="width: 400px; max-width: 90vw;">
      <q-card-section class="text-center">
        <div class="text-h5 text-primary text-weight-bold">
          Registration
        </div>
      </q-card-section>

      <q-form @submit="onSubmit" class="q-gutter-md q-mt-md">
        <q-input 
          filled
          label="First name"
          v-model="firstname"
          lazy-rules
          :rules="[ val => !!val || 'Please insert your first name >:(' ]"
        />

        <q-input 
          filled
          label="Last name"
          v-model="lastname"
          lazy-rules
          :rules="[ val => !!val || 'Please insert your last name >:(' ]"
        />

        <q-input 
          filled
          label="Username"
          v-model="username"
          lazy-rules
          :rules="[ 
            val => !!val || 'Please insert your username >:(',
            val => val.length >= 4 || 'Must be at least 4 characters'
          ]"
        />

        <q-input 
          filled
          label="Email address"
          v-model="email"
          lazy-rules
          :rules="[ 
            val => !!val || 'Please insert your email >:(',
            val => /^[^@]+@[^@]+\.[^@]+$/.test(val) || 'Please enter a valid email address'
          ]"
        />

        <q-input
          filled
          label="Password"
          v-model="password"
          :type="isPwd ? 'password' : 'text'"
          lazy-rules
          :rules="[
            val => val && val.length > 0 || 'Please insert a password >:(',
            val => val && val.length >= 6 || 'Password must be at least 6 characters long'
          ]"
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
          <q-btn label="Register" type="submit" color="primary" unelevated />
        </div>

        <div class="text-center q-mt-md">
          <span>Already have an account? </span>
          <q-btn 
            flat
            color="primary"
            label="Login"
            class="q-pa-none text-bold"
            @click="goToLogin"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      firstname: "",
      lastname: "",
      username: "",
      email: "",
      password: "",
      isPwd: true
    }
  },
  methods: {
    onSubmit () {
      console.log('Form submitted:', {
        firstname: this.firstname,
        lastname: this.lastname,
        username: this.username,
        email: this.email,
        password: this.password
      })
    },
    goToLogin () {
      this.$router.push({ name: 'login' })
    }
  }
}
</script>
