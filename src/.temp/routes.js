export default [
  {
    name: "projects",
    path: "/projects",
    component: () => import(/* webpackChunkName: "component--projects" */ "/home/obbap/Documents/pbaba-blog/src/pages/projects.vue")
  },
  {
    name: "home",
    path: "/",
    component: () => import(/* webpackChunkName: "component--home" */ "/home/obbap/Documents/pbaba-blog/src/pages/Index.vue")
  },
  {
    name: "404",
    path: "/404",
    component: () => import(/* webpackChunkName: "component--404" */ "/home/obbap/Documents/pbaba-blog/node_modules/gridsome/app/pages/404.vue"),
    meta: { isIndex: false }
  },
  {
    name: "tag",
    path: "/tag/:id",
    component: () => import(/* webpackChunkName: "component--tag" */ "/home/obbap/Documents/pbaba-blog/src/templates/Tag.vue")
  },
  {
    name: "post",
    path: "/:slug",
    component: () => import(/* webpackChunkName: "component--post" */ "/home/obbap/Documents/pbaba-blog/src/templates/Post.vue")
  },
  {
    name: "*",
    path: "*",
    component: () => import(/* webpackChunkName: "component--404" */ "/home/obbap/Documents/pbaba-blog/node_modules/gridsome/app/pages/404.vue"),
    meta: { isIndex: false }
  }
]

