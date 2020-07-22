import { observe } from './observer/index';

export function initState (vm) {
    const opts = vm.$options;
    // vue的数据来源 
    // 先属性 再方法 数据 计算属性 watch
    if (opts.props) { // 判断是否有数据传递
        initProps(vm);
    }
    if (opts.methods) { // 判断是否有methods
        initMethod(vm);
    }
    if (opts.data) { // 判断是否有data
        initData(vm);
    }
    if (opts.computed) { // 判断是否有computed
        initComputed(vm);
    }
    if (opts.watch) { // 判断是否有watch
        initWatch(vm);
    }
}

function initProps (vm) {}
function initMethod (vm) {}
function initData(vm){
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;
    
    //  对象劫持 用户改变了数据，我希望可以得到通知 => 刷新页面
    // MVVM 模式，数据变化可以驱动视图变化
    // Object.defineProperty () 给属性增加get方法和set方法
    observe(data); // 响应式原理

}
function initComputed (vm) {}
function initWatch (vm) {}