const routes = [
  {
    name: 'home',
    path: '/',
    component: () => import('layouts/ChatLayout.vue'),
    children: [
      { path: '',      name: 'index', component: () => import('pages/IndexPage.vue')},
      { path: 'chat',  name: 'chat',  component: () => import('pages/ChatPage.vue')},
    ],
  },
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login',    name: 'login',    component: () => import('pages/LoginUserPage.vue')},
      { path: 'register', name: 'register', component: () => import('pages/RegisterUserPage.vue')}
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  }
]

export default routes
