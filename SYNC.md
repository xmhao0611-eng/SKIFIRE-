# 跨电脑更新方案

这个插件已经按“代码”和“小说数据”分开处理：

- 插件代码：网页端、Codex 接口、脚本、技能说明，可以跨电脑同步和更新。
- 小说数据：默认保存在 `projects/`，安装/更新脚本不会覆盖它。
- 临时文件：默认保存在 `.runtime/`，不会打包到发布包里。

## 最简单方式：ZIP 复制

适合暂时不想折腾 GitHub 的情况。

1. 在主电脑双击 `scripts\package_plugin.cmd`。
2. 到 `dist\` 里找到生成的 `novel-writer-installer-版本号.zip`。
3. 把这个 installer zip 发到另一台电脑，比如微信、网盘、U 盘都可以。
4. 在另一台电脑解压 installer zip。
5. 双击 `一键解包安装.cmd`。
6. 安装完成后网页端会尝试自动启动。

更新插件时重复上面的步骤即可。一键解包安装默认不会删除另一台电脑上的 `projects/` 小说项目。

如果你只拿到了普通 `novel-writer-版本号.zip`，也可以解压后双击里面的 `scripts\install_or_update_plugin.cmd` 手动安装。

## 推荐方式：GitHub 同步

适合以后经常在多台电脑上用 Codex 修改这个软件。

1. 每台电脑安装 Git。
2. 把 `novel-writer` 文件夹放到一个 GitHub 私有仓库。
3. 新电脑用 `git clone` 下载仓库。
4. 修改前先 `git pull`，修改后让 Codex 帮你测试。
5. 测试通过后 `git commit` 和 `git push`。
6. 另一台电脑再 `git pull`，然后双击 `scripts\install_or_update_plugin.cmd` 更新本机插件。

当前这台电脑还没有检测到 Git，所以现在可以先用 ZIP 方案。以后装好 Git 后，这个目录已经有 `.gitignore`，会自动避开小说项目、运行缓存和发布包。

## 新电脑首次使用

1. 安装 Codex。
2. 安装 Python 3。
3. 获取插件代码，可以用 ZIP 或 GitHub。
4. 双击 `scripts\install_or_update_plugin.cmd`。
5. 双击 `scripts\start_serial_novel_app.cmd`。
6. 打开网页端 `AI 接口`，保持服务商为 `Codex 本机一键，推荐`，点 `检测 Codex`。

如果 Codex 安装在特殊位置，只需要在网页端把 `Codex 命令/路径` 改成新的 `codex.exe` 路径，再点 `检测 Codex`。

## 小说项目备份

网页端保存的项目在插件目录的 `projects/` 里。跨电脑同步代码时默认不会同步这些项目，避免误覆盖。

要迁移小说项目，可以用两种方式：

- 在网页端使用“导出项目”，到另一台电脑再“导入项目”。
- 手动备份 `projects/` 文件夹。

API Key 不会写进插件发布包。不同电脑需要各自填写，Codex 本机一键模式不需要 API Key。
