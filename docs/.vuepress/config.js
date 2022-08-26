const moment = require("dayjs");

module.exports = {
  // title: 'Hello VuePress',
  // description: 'Just playing around'
  base: "/docs/",
  title: "vue-press-demo",
  description: "这是我的vue-press",
  themeConfig: {
    lastUpdated: "更新时间",
    // navbar: false,
    sidebar: "auto",
    // sidebar: ["about","guide/"],
    // sidebar: [
    //   {
    //     title: 'Group 1',   // 必要的
    //     path: '/css/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
    //     collapsable: false, // 可折叠的 可选的, 默认值是 true,
    //     sidebarDepth: 1,    // 可选的, 默认值是 1
    //     children: [
    //       '/css/c-aaa',
    //       '/css/c-bbb',
    //       '/css/c-ccc',
    //     ]
    //   },
    //   {
    //     title: 'Group 2',
    //     children: [ /* ... */ ],
    //     initialOpenGroupIndex: -1 // 可选的, 默认值是 0
    //   }
    // ],
    // sidebar: {
    //   "/css/": ["c-aaa", "c-bbb", "c-ccc", "/"],
    // },
    logo: "/assets/img/logo.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "About", link: "/about" },
      {
        text: "Languages",
        items: [
          {
            text: "Group1",
            items: [
              { text: "Home", link: "/" },
              { text: "Guide", link: "/guide/" },
            ],
          },
          {
            text: "Group2",
            items: [
              { text: "Home", link: "/" },
              { text: "Guide", link: "/guide/" },
            ],
          },
        ],
      },
      { text: "External", link: "https://google.com" },
    ],
    plugins: [
      [
        "@vuepress/last-updated",
        {
          transformer: (timestamp) => {
            return dayjs(timestamp).format("YYYY/MM/DD HH:mm:ss");
          },
        },
      ],
    ],
  },
};
