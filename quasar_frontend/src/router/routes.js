import { compile } from 'vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('layouts/ChatLayout.vue'),
    children: [
      { path: 'channel/:id', name: 'channel', component: () => import('pages/ChannelPage.vue') },
      { path: 'dm/:id',      name: 'dm',      component: () => import('pages/DmPage.vue') },
    ],
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
