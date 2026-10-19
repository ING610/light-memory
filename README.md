# 光的记忆

一束光如何记录世界。

围绕 Gabor 同轴全息的互动科普学习作品。此仓库对应第6版网站内容，包含网页、题库、实验图片、三维模型渲染图和完整教学视频的分段副本。

## 在线体验

- GitHub Pages：https://ing610.github.io/light-memory/
- 原站：https://light-memory-holography-2026.amplespark.chatgpt.site/

## 学习路径

从点亮光源进入“点亮、遇见、留下、读图”四站探索，通过理想化单点散射模型理解干涉，再对照真实实验图像、观看微课、阅读知识展签并完成练习。题目提供逐项解释和错题回访。

本页练习包含固定基础四题及50道随机题源。50题分为微课核心35题、知识补充11题、明确拓展4题；每轮随机十题同时满足来源7/2/1、难度4/4/2，轮内不重复。外部完整题库为独立练习资源。

## 本地运行

本项目为静态网站，无需安装前端依赖或执行构建。请通过HTTP静态服务器访问，以便浏览器正常读取题库和视频；直接双击HTML可能受到浏览器本地文件限制。

如已安装Python，可在仓库目录运行：

```sh
python -m http.server 8000
```

然后访问 http://localhost:8000/ 。

## 文件

- `index.html`：作品入口与页面结构。
- `app.js`：探索、播放器、答题反馈及回访。
- `quiz-bank.json`、`quiz-sampler.js`：50题数据与双配额随机抽题。
- `styles.css`、`apparatus.css`、`refinements.css`：页面样式。
- `apparatus-*.png`、`experiment-*.jpg`：装置渲染与真实实验图像。
- `media/lesson-00.mp4` 至 `lesson-08.mp4`：原微课的连续播放分段。

原教学视频内容与实验图片保持原样。干涉互动为定性教学模型，不对应真实绣花针图样的定量预测。网页不宣称已完成相位恢复、三维形貌重建或测量精度验证。

知识库、外部完整题库及拓展参考链接需要联网。已记录桌面和390像素宽度下的流程检查；手机真机与Safari仍未验证。

## GitHub Pages

在仓库 Settings → Pages 中，使用 Deploy from a branch，分支选择 `main`，目录选择 `/ (root)`。根目录的 `.nojekyll` 使站点作为原始静态文件发布。
