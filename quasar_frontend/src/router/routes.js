import { compile } from 'vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('layouts/ChatLayout.vue'),
    children: [
      {
      name: 'channels/channelId',
      path: 'channels/:channelId', 
      component: () => import('pages/ChatPage.vue') }],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('pages/LoginUserPage.vue')
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/RegisterUserPage.vue')
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  }
]

export default routes
