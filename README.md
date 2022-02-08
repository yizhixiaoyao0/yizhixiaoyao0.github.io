# 关于博客

### 新建一篇博客文章

> 在 hexo/source/\_posts 文件夹下新建 md 文件(不用加.md 后缀）

```
 hexo new 文件名
```

### 最后输入以下命令生成网站文件并部署：

> https/yizhixiaoyao0.github.io/

```
hexo clean // 清空本地缓存，解决由于本地缓存导致部署无效
hexo g // == hexo generate #生成静态网页
gulp // 压缩生成的静态资料（如果安装gulp插件，具体安装方法见下面）
hexo d // == hexo deploy #开始部署
hexo s // == hexo server #启动服务器 本地调试使用
```

```
it submodule                                             #查看子模块
git submodule add ["remote repo"]                         #添加子模块
git submodule add ["remote repo"] ["path\submodule name"]
git submodule init                                        #初始化本地配置文件
git submodule update --remote                             #更新子模块为远程项目的最新版本
git submodule update ["path\submodule name"]              #更新子模块的指定路径
git clone --recursive ["remote repo"]                     #克隆包含子模块的仓库
git rm ["path\submodule name"]                            #删除子模块
git submodule foreach ["command"]                         #遍历子模块执行同样的命令
```
