// 找出source中的所有的字符串、注释、正则表达式
const mountSource = source => {
    const mountedList = [];
    let data = null;
    const regexp = /\`[\s\S]*?[\`$]|\".*?[\"$]|\'.*?[\'$]|\/\*[\s\S]*?(\*\/|$)|\/\/.*|(?<![a-zA-Z0-9\\])\/.*?(?<!\\)\/[a-zA-Z]*/g;
    while(data = regexp.exec(source)) {
        mountedList.push({chunk: data[0], index: data.index});
    }
    // 得出这样的一个数组 [{chunk: "`", index: 8}, {chunk: "/*", index: 16}, {chunk: "*/", index: 18}, {chunk: """, index: 27}, {chunk: "'", index: 34}, {chunk: "//", index: 41}]
    const list = [];
    // 获取规则
    for(const item of mountedList) {
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
        // 其他代码
        else {
            list.push({type: 7, chunk, index});
        }
    }
    return list;
}

const transformToElement = (source, list, language="js") => {
    let pivot = 0; // 起始点
    let delta = 0; // 相对于index的偏移量
    let result = "";
    for(const item of list) {
        const {type, chunk, index} = item;
        const normal = source.slice(pivot, index);
        const special = `<span class="hl-${language}-${type}">${chunk}</span>`;
        // delta += `<span class="hl-${language}-${type}"></span>`.length;
        pivot = index + chunk.length;
        result += normal + special;
    }
    return result;
}

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

const hl = element => {
    let source = "";
    if(typeof element === "string") {
        source = element;
    }
    else {
        source = getSourceFromElement(element);
    }
    // 递归整个源码
    const list = mountSource(source);
    const result = transformToElement(source, list);
    if(element instanceof Element && element.nodeType === 1) {
        element.innerHTML = result;
    }
    else {
        element = result;
    }
    return element;
}

export default hl;
