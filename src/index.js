const getSourceFromElement = element => {
    if(element instanceof Element && element.nodeType === 1) {
        return element.textContent;
    }
    else if(typeof element === "string"){
        return element;
    }
    else {
        throw TypeError("getSourceFromElement的参数必须是字符串类型或者是节点类型");
    }
}

const parse = (source, regexp) => {
    console.log(source, regexp);
    const list = [];
    let data = null;
    while(data = regexp.exec(source)) {
        list.push({chunk: data[0], index: data.index});
    }
    // 得出这样的一个数组 [{chunk: "`", index: 8}, {chunk: "/*", index: 16}, {chunk: "*/", index: 18}, {chunk: """, index: 27}, {chunk: "'", index: 34}, {chunk: "//", index: 41}]
    return list;
}

// 包装方法名 (必须要在包装保留字之前处理)
// 处理保留字符串
// const x = x => {}
// const x = (x) => {}
// const x = function(){}
// function x () {}
// x()
// x ()
// const list = parse(source, /(?<=(var|const|let))[\$\s]+[_a-zA-Z][\$_a-zA-Z0-9]*(?=(\s*\=\s*)([\(\$_a-zA-Z0-9\,\)]*\=\>\s*\{|function\s*\())|(?=[$\s]*function[\s]*)[\$\s]+[_a-zA-Z][\$_a-zA-Z0-9]*(?=\s*\()/g);

// 包装保留字
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
        action() {

        }
        // what: "function-variable",
        // regexp: /(?<=[^\s]*function\s+)[\$_a-zA-Z][\$_a-zA-Z0-9]*(?=\s*\()/g
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
    if(element instanceof Element && element.nodeType === 1) {
        element.innerHTML = result;
    }
    else {
        element = result;
    }
    return element;
}

export default hl;
