// 注意：live2d_path 参数应使用绝对路径
const live2d_path = "/live2d/";
//const live2d_path = "/live2d-widget/";

// 封装异步加载资源的方法
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;

    if (type === "css") {
      tag = document.createElement("link");
      tag.rel = "stylesheet";
      tag.href = url;
    } else if (type === "js") {
      tag = document.createElement("script");
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.body.appendChild(tag);
    }
  });
}
var message_Path = "/live2d/";
var home_Path = "https://yizhixiaoyao0.github.io/";
// 加载 waifu.css live2d.min.js waifu-tips.js
window.onload = function () {
  if (screen.width >= 768) {
    Promise.all([
      loadExternalResource(live2d_path + "css/live2d.css", "css"),
      loadExternalResource(
        "https://cdn.bootcss.com/jquery/2.2.4/jquery.min.js",
        "js"
      ),
      loadExternalResource(live2d_path + "js/live2d.js", "js"),
      loadExternalResource(live2d_path + "js/message.js", "js"),
    ]).then(() => {
      console.log("ok");
      loadlive2d("live2d", live2d_path + "model/xiaoban/model.json");
    });
  }

  console.log(`
    く__,.ヘヽ.        /  ,ー､ 〉
             ＼ ', !-─‐-i  /  /´
             ／｀ｰ'       L/／｀ヽ､
           /   ／,   /|   ,   ,       ',
         ｲ   / /-‐/  ｉ  L_ ﾊ ヽ!   i
          ﾚ ﾍ 7ｲ｀ﾄ   ﾚ'ｧ-ﾄ､!ハ|   |
            !,/7 '0'     ´0iソ|    |
            |.从"    _     ,,,, / |./    |
            ﾚ'| i＞.､,,__  _,.イ /   .i   |
              ﾚ'| | / k_７_/ﾚ'ヽ,  ﾊ.  |
                | |/i 〈|/   i  ,.ﾍ |  i  |
               .|/ /  ｉ：    ﾍ!    ＼  |
                kヽ>､ﾊ    _,.ﾍ､    /､!
                !'〈//｀Ｔ´', ＼ ｀'7'ｰr'
                ﾚ'ヽL__|___i,___,ンﾚ|ノ
                    ﾄ-,/  |___./
                    'ｰ'    !_,.:
  `);
};
