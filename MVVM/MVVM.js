// 基类
class Vue {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;

        // 这个根元素存在， 将其模板进行编译
        if (this.$el) {
            new Compiler(this.$el, this);
        }
    }
}

// 解释器 && 编译模板
class Compiler {
    constructor(el ,vm) {
        // el 可能有多种情况
        // 判断el属性，是不是一个属性，如果不是元素，那就获取它
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        
        // 1.获取模板，
        // 2.不能重复进行替换(会造成页面回流&重绘)
        // 放在内存里面，到时候整提替换
        // 获取到之后，将当前节点(#app)中的元素，放在内存里面
        this.vm = vm;
        let fragment = this.node2fragment(this.el);
        
        // 把节点中的内容进行替换

        // 编译模板 ，用数据(data) 编译
        this.compile(fragment);
        console.log('fragment', fragment)

        // 把内容塞到页面当中
        this.el.appendChild(fragment);

    }
    // 用来编译内存中的dom节点
    compile (node) {
        // 先拿到文档碎片当中的子节点
        let chilNodes = node.chilNodes;
        console.log(chilNodes)
    }
    // 获取节点类 并且把节点移动到内存中
    node2fragment (node) {
        // 创建一个文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            // appendChild 具有移动性
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    // 判断是不是元素节点
    isElementNode(node) {
        return node.nodeType === 1;
    }
}