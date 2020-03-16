// 工具类方法
/**
 * 在指定的索引位置前后插入标签
 * @param {[string]} chunks 
 * @param {[{index: number, value: string}]} execList 
 * @param {string} before 
 * @param {string} after
 */
const insertTags = (chunks, execList, before, after) => {
    if(!Object.prototype.toString.call(chunks) === "[object Array]") {
        throw new TypeError("insertTags的第一个参数必须是字符串");
    }
    const len = chunks.length;
    for(let i = 0; i < len-1; i++) {
        chunks[i] += before + execList[i].value + after;
    }
    return chunks;
}

const languageMap = {
    "JavaScript": {
        marks: ["js", "javascript"]
    }
}

// 获取准确的语言
const getLanguage = mark => {
    for(const language in languageMap) {
        const marks = languageMap[language].marks;
        if(~marks.indexOf(mark)) {
            return language;
        }
    }
}


const runRules = (source, rules, prefix="book-hl-") => {
    for(const rule of rules) {
        let list = [], item = null;
        // 直接将source分割成数组
        while(item = rule.regexp.exec(source)){
            list.push({index: item.index, value: item[0]});
        };
        let chunks = source.split(rule.regexp);
        chunks = insertTags(chunks, list, `<span class="${prefix}${rule.type}">`, `</span>`);
        source = chunks.join("");
    }
    return source;
}

// x`y`z
//  * 第一种情况：x和z中不存在"、'
//  * 第二种情况：x存在"、'
//  * 第三种情况：x存在/*
//  * 第四种情况：x存在//（同一行）
//  * 第五种情况：
//  * 第六种情况：
// 最先找到的是`
const list = [
    {type:"backquote", chunk:"xxx"},
    {}
]

const mountSource = source => {
    // 找出source中的所有 ` " ' /* */ // / /
    const list = [];
    // 对于正则的判断可能需要用到断言
    const regexp = /\`[\s\S]*?[\`$]|\".*?[\"$]|\'.*?[\'$]|\/\*[\s\S]*?(\*\/|$)|\/\/.*|\/+?[^\\]\/ *[^\_\$a-zA-Z0-9]|[^\`\"\'\/$]*?/g;
    // 关键字 [\s\^]var\s|[\s\^]const[\s$]|[\s\^]let\s[\s$]
    // 对象 \{[\s\S]*?\}
    // 箭头函数 [\s\^]\=\>\s[\s$\{\}]|[\s\^]let\s[\s$]|[\s\^]let\s[\s$]
    // 函数表达式 [\s\^]\=\>\s[\s$\{\}]|[\s\^]let\s[\s$]|[\s\^]let\s[\s$]
    // 函数声明·· [\s\^]function\s*\(.*\)[\s\n]*\{[\s\S]*?\}
    while(data = regexp.exec(source)) {
        list.push({chunk: data[0], index: data.index});
    }
    // 得出这样的一个数组 [{type: "`", index: 8}, {type: "/*", index: 16}, {type: "*/", index: 18}, {type: """, index: 27}, {type: "'", index: 34}, {type: "//", index: 41}]
    return list;
}


const hl = element => {
    // 判断语言
    let mark = element.className.toLowerCase().replace("language-","");
    const language = getLanguage(mark);
    // 获取源码
    const source = element.textContent;
    // 递归整个源码
    const list = mountSource(source);
    // 获取规则
    for(const item of list) {
        const chunk = item.chunk;
        const index = item.index
        // 反引号
        if(/^\`/.test(chunk)) {
            list.push({type: 0, chunk, index});
        }
        // 双引号
        else if(/^\"/.test(chunk)) {
            list.push({type: 1, chunk, index});
        }
        // 单引号 
        else if(/^\'/.test(chunk)) {
            list.push({type: 2, chunk, index});
        }
        // 多行注释
        else if(/^\/\*/.test(chunk)) {
            list.push({type: 3, chunk, index});
        }
        // 单行注释
        else if(/^\/\//.test(chunk)) {
            list.push({type: 4, chunk, index});
        }
        // 正则表达式
        else if(/^\//.test(chunk)) {
            list.push({type: 5, chunk, index});
        }
        // 正常代码
        else {
            list.push({type: 6, chunk, index});
        }
    }
    console.log(list);
    // 运行规则
    // element.innerHTML = runRules(source, rules);

}

export default hl;