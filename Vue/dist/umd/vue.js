(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  /**
   * 当前数据是不是对象
   * @param {*} data 
   */
  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }

  // 重写数组的7个方法(此类方法会导致数组本身发生改变)
  var oldArrayProtoMethods = Array.prototype;
  var arrayMethods = Object.create(oldArrayProtoMethods);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProtoMethods[method].apply(this, args);
      var ob = this.__ob__;
      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
      }

      if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测

      return result;
    };
  });

  // 特点 Object.defineProperty 不能兼容ie8及ie8以下 vue2 无法兼容ie8版本

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

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
        this.walk(value);
      }
    }

    _createClass(Observer, [{
      key: "observerAray",
      value: function observerAray(value) {
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 让对象上的所有属性依次进行观测
        var keys = Object.keys(data);
        keys.forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value); // 递归实现深层检测

    Object.defineProperty(data, key, {
      get: function get() {
        // 获取值的时候做一些操作
        return value;
      },
      set: function set(newValue) {
        if (newValue == value) return;
        observe(newValue); // 继续劫持用户设置的值,因为有可能用户设置的值是一个对象

        value = newValue;
      }
    });
  }

  function observe(data) {
    var isObj = isObject(data);

    if (!isObj) {
      return;
    }

    return new Observer(data); // 用来观测数据(劫持)
  }

  function initState(vm) {
    var opts = vm.$options; // vue的数据来源 
    // 先属性 再方法 数据 计算属性 watch

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      // 判断是否有data
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data; //  对象劫持 用户改变了数据，我希望可以得到通知 => 刷新页面
    // MVVM 模式，数据变化可以驱动视图变化
    // Object.defineProperty () 给属性增加get方法和set方法

    observe(data); // 响应式原理
  }

  function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      // 数据的劫持
      // 拿到实例
      var vm = this; // vue 中使用 this.$options 指代的就是用户传递的属性

      vm.$options = options; // 初始化状态

      initState(vm); // 分割代码
    };
  }

  function Vue(options) {
    // 进行Vue的初始化操作
    this._init(options);
  } // 通过引入文件的方式，给vue原型上添加方法


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
