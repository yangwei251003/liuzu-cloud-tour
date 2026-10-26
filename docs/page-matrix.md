# 页面矩阵

P01–P32 仅作为桌面视觉真值保存在 `references/prototypes/`，不会作为整页截图直接交付到站点。公开端长页由连续原型合并，路线与成果详情使用共享模板。

| 编号 | 参考文件                             | 应用   | 路由/模板                                  | 实现约定                       |
| ---- | ------------------------------------ | ------ | ------------------------------------------ | ------------------------------ |
| P01  | `01_home_hero.png`                   | 公共端 | `/`                                        | 首页 Hero，和 P02–P04 合成长页 |
| P02  | `02_home_story_bento.png`            | 公共端 | `/`                                        | 首页故事 Bento                 |
| P03  | `03_home_gallery_seasons.png`        | 公共端 | `/`                                        | 首页四季画廊                   |
| P04  | `04_home_stamp_guide.png`            | 公共端 | `/`                                        | 首页集章引导与页尾             |
| P05  | `05_map.png`                         | 公共端 | `/map`                                     | 禅踪地图                       |
| P06  | `06_spots.png`                       | 公共端 | `/spots`                                   | 景点列表                       |
| P07  | `07_spot_detail_top.png`             | 公共端 | `/spots/:spotId`                           | 景点详情上半段                 |
| P08  | `08_spot_detail_bottom.png`          | 公共端 | `/spots/:spotId`                           | 与 P07 合成长页                |
| P09  | `09_3d_viewer.png`                   | 公共端 | `/spots/:spotId/3d`                        | 三维云游与降级状态             |
| P10  | `10_routes.png`                      | 公共端 | `/routes`                                  | 主题路线列表                   |
| P11  | `11_route_detail_zen_1day.png`       | 公共端 | `/routes/zen-one-day`                      | 路线详情共享模板               |
| P12  | `12_route_detail_zen_red_2day.png`   | 公共端 | `/routes/zen-red-two-day`                  | 路线详情共享模板               |
| P13  | `13_route_detail_farm_aid.png`       | 公共端 | `/routes/farm-support`                     | 路线详情共享模板               |
| P14  | `14_route_detail_full_guide.png`     | 公共端 | `/routes/full-guide`                       | 路线详情共享模板               |
| P15  | `15_route_detail_lychee_halfday.png` | 公共端 | `/routes/lychee-half-day`                  | 路线详情共享模板               |
| P16  | `16_route_detail_red_memory.png`     | 公共端 | `/routes/red-memory`                       | 路线详情共享模板               |
| P17  | `17_stamp_book.png`                  | 公共端 | `/stamps`                                  | 数字集章册                     |
| P18  | `18_certificate.png`                 | 公共端 | `/stamps/certificate`                      | 集章证书                       |
| P19  | `19_achievements.png`                | 公共端 | `/achievements`                            | 实践成果总览                   |
| P20  | `20_achievement_livestream.png`      | 公共端 | `/achievements/livestream`                 | 成果详情共享模板               |
| P21  | `21_achievement_party.png`           | 公共端 | `/achievements/party-building`             | 成果详情共享模板               |
| P22  | `22_achievement_interview.png`       | 公共端 | `/achievements/interview`                  | 成果详情共享模板               |
| P23  | `23_achievement_survey.png`          | 公共端 | `/achievements/survey`                     | 成果详情共享模板               |
| P24  | `24_achievement_aigc.png`            | 公共端 | `/achievements/aigc`                       | 成果详情共享模板               |
| P25  | `25_about_top.png`                   | 公共端 | `/about`                                   | 关于页上半段                   |
| P26  | `26_about_bottom.png`                | 公共端 | `/about`                                   | 与 P25 合成长页                |
| P27  | `27_admin_login.png`                 | 后台   | `/admin`                                   | 演示登录                       |
| P28  | `28_admin_dashboard.png`             | 后台   | `/admin/stats`                             | 数据看板                       |
| P29  | `29_admin_spots_list.png`            | 后台   | `/admin/spots`                             | 景点列表                       |
| P30  | `30_admin_spot_edit.png`             | 后台   | `/admin/spots/new`、`/admin/spots/:spotId` | 新增/编辑共享表单              |
| P31  | `31_admin_route_editor.png`          | 后台   | `/admin/routes`                            | 路线排序与编辑                 |
| P32  | `32_admin_achievements.png`          | 后台   | `/admin/achievements`                      | 成果管理                       |

## 合并与复用规则

- `/` 合并 P01–P04；`/spots/:spotId` 合并 P07–P08；`/about` 合并 P25–P26。
- P11–P16 共用路线详情模板，通过 `routeId` 选择数据。
- P20–P24 共用成果详情模板，通过 `type` 选择数据。
- P30 同时覆盖新增与编辑；表单模式由路由决定。
- 视觉验收以 ZIP 中对应 PNG 的桌面状态为基线；响应式状态按同一信息层级重排。

## 验收覆盖状态

- 路由/功能映射：32/32 原型均已映射到页面或复用模板。
- 1487×1058 同尺寸视觉对照：12/32，已覆盖 P01、P05、P06、P09、P17、P19、P27–P32。
- 尚缺直接视觉对照：20/32，即 P02–P04、P07–P08、P10–P16、P18、P20–P26。
- 因此当前可以确认页面体系和功能覆盖，但不能确认 32/32 像素级视觉验收。代表帧 P01/P06/P09 的差异均超过 1%，详见 `docs/visual-diff-report.md`。
