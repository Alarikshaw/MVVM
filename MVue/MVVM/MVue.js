// 入口方法
class MVue {
    constructor(options) {
        // console.log('options', options)
        this.$options = options
        this.$el = options.el
        this.$data = options.data

        if (this.$el) {
            // 1.实现一个数据观察者(数据劫持，把数据全部化成用Object.defineProperty来定义)
            new Observer(this.$data)
            // 2.实现一个指令解释器(编译器)
            new Compile(this.$el, this)
            // 代理this.$data => this
            this.proxyData(this.$data)
        }
    }

    // 代理
    proxyData(data) {
        for (const key in data) {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                },
                set: newVal => {
                    data[key] = newVal
                }
            })
        }
    }
}

// 指令解释器 
class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        // 1.获取文档碎片对象，放入内存中可以减少页面回流和重绘
        const fragment = this.node2Fragment(this.el)
        // console.log(fragment);

        // 2.编译模板
        this.compile(fragment)

        // 3.追加子元素到根元素
        this.el.appendChild(fragment)
    }

    compile(fragment) {
        // 1.获取每一个子节点
        let childNodes = fragment.childNodes
        // console.log('childNodes', childNodes)

        childNodes = this.convertToArray(childNodes)
        childNodes.forEach(child => {
            if (this.isElementNode(child)) {
                // console.log('元素节点', child);
                this.compileElement(child)
            } else {
                // console.log('文档节点', child);
                this.compileText(child)
            }
            if (child.childNodes && child.childNodes.length) {
                this.compile(child)
            }
        });
    }

    isDirective(name) {
        return name.startsWith('v-')
    }

    isElementNode(node) {
        // 判断是否是元素节点
        return node.nodeType === 1
    }

    convertToArray(nodes) {
        // 将childNodes返回的数据转化为数组的方法
        var array = null;
        try {
            array = Array.prototype.slice.call(nodes, 0);
        } catch (ex) {
            array = new Array();
            for (var i = 0, len = nodes.length; i < len; i++) {
                array.push(nodes[i]);
            }
        }
        return array;
    }

    compileElement(node) {
        // console.log(node);
        // <div v-text="msg"></div>
        const attributes = node.attributes
        // console.log(attributes);
        this.convertToArray(attributes).forEach(attr => {
            const { name, value } = attr
            // console.log(value);
            if (this.isDirective(name)) {
                // 是一个指令
                const [, dirctive] = name.split('-') // 切割
                const [dirName, eventName] = dirctive.split(':')
                 console.log('dirName', dirName);
                //  console.log('eventName', eventName);
                // 更新数据 数据驱动视图
                compileUtil[dirName](node, value, this.vm, eventName)

                // 删除标签上的指令
                node.removeAttribute('v-' + dirctive)
            }
        })
    }

    compileText(node) {
        // 匹配双大括号 {{}}
        const content = node.textContent
        if (/\{\{(.+?)\}\}/.test(content)) {
            // console.log(content);
            compileUtil['text'](node, content, this.vm)
        }
    }

    node2Fragment(el) {
        // 创建文档碎片
        let f = document.createDocumentFragment()
        while (el.firstChild) {
            f.appendChild(el.firstChild)
        }
        return f
    }
}

const compileUtil = {
    // node:节点
    // expr:表达式
    // vm:是当前实例
    text(node, expr, vm) {
        let value
        if (expr.indexOf('{{') !== -1) {
            value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                // 绑定观察者，将来数据发生变化，触发这里的回调函数去更是对应的视图
                new Watcher(vm, args[1], (newVal) => {
                    this.updater.textUpdater(node, this.getContentVal(expr, vm))
                })
                return this.getValue(args[1], vm)
            })
        } else {
            value = this.getValue(expr, vm)
            new Watcher(vm, expr, (newVal) => {
                this.updater.textUpdater(node, newVal)
            })
        }

        this.updater.textUpdater(node, value)
    },
    html(node, expr, vm) {
        let value = this.getValue(expr, vm)
        new Watcher(vm, expr, (newVal) => {
            this.updater.htmlUpdater(node, newVal)
        })
        this.updater.htmlUpdater(node, value)
    },
    model(node, expr, vm) {
        const value = this.getValue(expr, vm)
        // 绑定更新函数 数据=>视图
        new Watcher(vm, expr, (newVal) => { // 给输入框加一个观察者
            this.updater.modelUpdater(node, newVal)
        })
        // 视图=>数据=>视图
        node.addEventListener('input', e => {
            // 设置值
            this.setValue(expr, vm, e.target.value)
        })
        this.updater.modelUpdater(node, value)
    },
    on(node, expr, vm, eventName) {
        let fn = vm.$options.methods && vm.$options.methods[expr]
        node.addEventListener(eventName, fn.bind(vm), false)
    },
    // 根据表达式，取到相应的数据
    getValue(expr, vm) {
        expr = expr.replace(/\s+/g, "")
        return expr.split('.').reduce((data, currentVal) => {
            // console.log(currentVal);
            return data[currentVal]
        }, vm.$data)
    },
    setValue(expr, vm, newVal) {
        expr = expr.replace(/\s+/g, "")
        return expr.split('.').reduce((data, currentVal) => {
            data[currentVal] = newVal
        }, vm.$data)
    },
    updater: {
        textUpdater(node, value) {
            node.textContent = value
        },
        htmlUpdater(node, value) {
            node.innerHTML = value
        },
        modelUpdater(node, value) {
            node.value = value
        }
    },
    getContentVal(expr, vm) {
        // 便利表达式，将内容 重新替换成一个完整的内容
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getValue(args[1], vm)
        })
    }
}