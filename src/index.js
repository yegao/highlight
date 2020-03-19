const $Element = this.Element || new Function(); // node.js环境中不存在Element，为方便测试先这样简单处理，后续要删除
const getSourceFromElement = element => {
    if(element instanceof $Element && element.nodeType === 1) {
        return element.textContent;
    }
    else if(typeof element === "string"){
        return element;
    }
    else {
        throw TypeError("getSourceFromElement的参数必须是字符串类型或者是节点类型");
    }
}

// 得出这样的一个数组 [{chunk: "function x (){}", index: 8}, {chunk: "// hello world", index: 41}]
const parse = (source, regexp) => {
    const list = [];
    let data = null;
    while(data = regexp.exec(source)) {
        list.push({chunk: data[0], index: data.index});
    }
    return list;
}

// 分别处理 字符串、注释、正则表达式 函数名（待完善） 
const onion = (source, language, ...args) => {
    const [arg, ...rest] = args;
    if(!arg) {
        return source;
    }
    let {action, what, regexp} = arg;
    
    let list = parse(source, regexp);
    if(typeof action === "function") {
        list = action(list);
    }
    let cursor = 0; // 标记
    let result = "";
    for(const item of list) {
        const {type = what, chunk, index} = item;
        const wrapped = `<span class="hl-${language}-${type}">${chunk}</span>`;
        let temp = source.slice(cursor, index);
        temp = onion(temp, language, ...rest);
        result += temp + wrapped;
        cursor = index + chunk.length;
    }
    // 判断cursor是否已经到最后了
    if(cursor < source.length) {
        let temp = source.slice(cursor);
        temp = source.slice(cursor);
        result += onion(temp, language, ...rest);
    }
    return result;
}

const onionArgs = [
    {
        // 字符串、注释、正则表达式
        action(origin) {
            const list = [];
            // 获取规则
            for(const item of origin) {
                const {chunk, index} = item;
                // 多行注释
                if(/^\/\*/.test(chunk)) {
                    list.push({type: 1, chunk, index});
                }
                // 单行注释
                else if(/^\/\//.test(chunk)) {
                    list.push({type: 2, chunk, index});
                }
                // 正则表达式
                else if(/^\//.test(chunk)) {
                    list.push({type: 3, chunk, index});
                }
                // 双引号
                else if(/^\"/.test(chunk)) {
                    list.push({type: 4, chunk, index});
                }
                // 单引号 
                else if(/^\'/.test(chunk)) {
                    list.push({type: 5, chunk, index});
                }
                // 反引号
                else if(/^\`/.test(chunk)) {
                    list.push({type: 6, chunk, index});
                }
                // 正常代码
                else {
                    list.push({type: 7, chunk, index});
                }
            }
            return list;
        },
        regexp: /\`[\s\S]*?[\`$]|\".*?[\"$]|\'.*?[\'$]|\/\*[\s\S]*?(\*\/|$)|\/\/.*|(?<![a-zA-Z0-9\\])\/.*?(?<!\\)\/[a-zA-Z]*/g
    },
    {
        // 函数名（未完）
        what: "function-variable",
        regexp: /(?<=[^\s]*function\s+)[\$_a-zA-Z][\$_a-zA-Z0-9]*(?=\s*\()/g
        // (?<=(var|const|let))[\$\s]+[_a-zA-Z][\$_a-zA-Z0-9]*(?=(\s*\=\s*)([\(\$_a-zA-Z0-9\,\)]*\=\>\s*\{function\s*\())
    },
    {
        // 保留字
        what: "reserved-word",
        regexp: /(?<![_a-zA-Z0-9])(abstract|arguments|async|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)(?![$_a-zA-Z0-9])/g
    }
]

const hl = element => {
    let source = getSourceFromElement(element);
    const result = onion(source, "js", ...onionArgs);
    if(element instanceof $Element && element.nodeType === 1) {
        element.innerHTML = result;
    }
    else {
        element = result;
    }
    return element;
}

// export default hl; // 暂时调试，未发布，暂时先简单做成Node.js版本，后续再使用打包工具
module.exports = hl;

