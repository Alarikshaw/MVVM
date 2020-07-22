import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
export default {
    input: './src/index.js', // 以那个文件作为打包的入口
    output: {
        file: 'dist/umd/vue.js', // 出口路径
        name: 'Vue', // 指定打包后全局变量的名字
        format: 'umd', // 同意模块儿规范
        sourcemap: true, // es5=>es6 开启源代码调试，可以找到源代码的
    },
    plugins: [ // 使用的插件
        babel({
            exclude: "node_modules/**" // 该目录不进入打包序列
        }),
        // 如果环境变量是开发 则启动下方的服务
        process.env.ENV === 'development'? serve({ // 启动服务
            open: true, // 自动打开html文件
            openPage: '/public/index.html', //默认打开html的路径
            port: 3000,
            contentBase: ''  // 静态文件的位置
        }) : null
    ]
}