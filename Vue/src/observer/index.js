import { isObject } from './../util/index';
import { arrayMethods } from './array.js';
// 把data中的数据 都使用Object.defineProperty重新定义 es5
// 特点 Object.defineProperty 不能兼容ie8及ie8以下 vue2 无法兼容ie8版本

class Observer {
    constructor(value) {
        // vue2如果数据层次过多，需要递归的去解析对象中的属性，依次增加set和get方法
        // vue3 使用proxy 好处之一是不用递归，二是不用增加set和get方法

        if (Array.isArray(value)) {
            // 如果是数组的话并不会对索引进行观测，因为会导致性能问题
            // 前端开发中很少 很少 去操作索引 push shift unshift
            // 如果数组里放的是对象我再监控
            value.__proto__ = arrayMethods; // 重写数组原型方法
            this.observeArray(value);
        } else {
            // 对数组进行监控
            this.walk(value)
        }
        
    }
    observerAray (value) {
        for(let i = 0 ; i < value.length ;i ++){
            observe(value[i]);
        }
    }
    walk(data){ // 让对象上的所有属性依次进行观测
        let keys = Object.keys(data);

        keys.forEach(key => {
            defineReactive(data,key,data[key]);
        })
    }
}
function defineReactive(data,key,value){
    observe(value); // 递归实现深层检测
    Object.defineProperty(data,key,{
        get(){ // 获取值的时候做一些操作
            return value
        },
        set(newValue){
            if(newValue == value) return;
            observe(newValue); // 继续劫持用户设置的值,因为有可能用户设置的值是一个对象
            value = newValue
        }
    })
}
export function observe (data){
    
    let isObj = isObject(data);
    if (!isObj) {
        return;
    }
    return new Observer(data); // 用来观测数据(劫持)
}