import { initMixin } from './init';
// Vue的核心代码，只是vue的一个声明 (可扩展如render等，整合功能)
function Vue(options) {
    // 进行Vue的初始化操作

    this._init(options)
}
// 通过引入文件的方式，给vue原型上添加方法
initMixin(Vue);
export default Vue