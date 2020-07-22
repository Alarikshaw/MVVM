
//  观察者，发布订阅 将被观察者放入观察者里面去
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        // 先把旧值保存起来
        this.oldVal = this.getOldVal()
    }

    getOldVal() {
        Dep.target = this
        const oldVal = compileUtil.getValue(this.expr, this.vm)
        Dep.target = null
        return oldVal
    }

    // 更新操作，数据变化后，会调用观察者的update方法
    update() { 
        const newVal = compileUtil.getValue(this.expr, this.vm)
        this.cb(newVal)
    }
}


class Dep {
    constructor() {
        // 定义观察者数组 存放所有的watcher
        this.subs = []
    }

    // 收集观察者(订阅)
    addSub(watcher) {
        // console.log('watcher', watcher);
        this.subs.push(watcher);
    }

    // 通知观察者去更新视图(发布)
    notify() {
        // console.log('通知了观察者');
        this.subs.forEach(w => w.update())
    }
}


// 数据劫持监听  
class Observer {
    constructor(data) {
        this.observer(data)
    }

    observer(data) {
        if (data && typeof data === 'object') {
            // 如果是对象才观察
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key])
            })
        }
    }
    // 添加方法
    defineReactive(obj, key, value) {
        // 递归遍历，直到最后一个值不是对象
        // console.log('obj', obj)
        // console.log('key', key)
        // console.log('value', value)
        this.observer(value)
        const dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: false,
            get() {
                // 订阅数据变化时，往Dep中添加观察者
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set: (newVal) => {
                this.observer(newVal)
                // 重新更新值之前先对新值劫持监听
                value = newVal
                // 告诉Dep通知变化
                dep.notify()
            }
        })
    }
}