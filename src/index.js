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

const mountSource = source => {
    // 找出source中的所有 ` " ' /* */ // / /
    const list = [];
    let data = null;
    // 对于正则的判断可能需要用到断言
    const regexp = /\`[\s\S]*?[\`$]|\".*?[\"$]|\'.*?[\'$]|\/\*[\s\S]*?(\*\/|$)|\/\/.*|(?<![a-zA-Z0-9\\])\/.*?(?<!\\)\/[a-zA-Z]*/g;
    // 关键字 [\s\^]var\s|[\s\^]const[\s$]|[\s\^]let\s[\s$]
    // 对象 \{[\s\S]*?\}
    // 箭头函数 [\s\^]\=\>\s[\s$\{\}]|[\s\^]let\s[\s$]|[\s\^]let\s[\s$]
    // 函数表达式 [\s\^]\=\>\s[\s$\{\}]|[\s\^]let\s[\s$]|[\s\^]let\s[\s$]
    // 函数声明·· [\s\^]function\s*\(.*\)[\s\n]*\{[\s\S]*?\}
    while(data = regexp.exec(source)) {
        list.push({chunk: data[0], index: data.index});
    }
    console.log(list);
    // 得出这样的一个数组 [{type: "`", index: 8}, {type: "/*", index: 16}, {type: "*/", index: 18}, {type: """, index: 27}, {type: "'", index: 34}, {type: "//", index: 41}]
    return list;
}

const getSourceFromElement = element => {
    // 判断语言
    let mark = element.className.toLowerCase().replace("language-","");
    const language = getLanguage(mark);
    // 获取源码
    // const source = element.textContent;
    return element.textContent;
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
    // 获取规则
    // for(const item of list) {
    //     const chunk = item.chunk;
    //     const index = item.index
    //     // 反引号
    //     if(/^\`/.test(chunk)) {
    //         list.push({type: 0, chunk, index});
    //     }
    //     // 双引号
    //     else if(/^\"/.test(chunk)) {
    //         list.push({type: 1, chunk, index});
    //     }
    //     // 单引号 
    //     else if(/^\'/.test(chunk)) {
    //         list.push({type: 2, chunk, index});
    //     }
    //     // 多行注释
    //     else if(/^\/\*/.test(chunk)) {
    //         list.push({type: 3, chunk, index});
    //     }
    //     // 单行注释
    //     else if(/^\/\//.test(chunk)) {
    //         list.push({type: 4, chunk, index});
    //     }
    //     // 正则表达式
    //     else if(/^\//.test(chunk)) {
    //         list.push({type: 5, chunk, index});
    //     }
    //     // 正常代码
    //     else {
    //         list.push({type: 6, chunk, index});
    //     }
    // }
    console.log(list);
    // 运行规则
    // element.innerHTML = runRules(source, rules);
}




// test


// var source = `// 工具类方法
// /**
//  * 在指定的索引位置前后插入标签
//  * @param {[string]} chunks 
//  * @param {[{index: number, value: string}]} execList 
//  * @param {string} before 
//  * @param {string} after
//  */
// const insertTags = (chunks, execList, before, after) => {
//     if(!Object.prototype.toString.call(chunks) === "[object Array]") {
//         throw new TypeError("insertTags的第一个参数必须是字符串");
//     }
//     const len = chunks.length;
//     for(let i = 0; i < len-1; i++) {
//         chunks[i] += before + execList[i].value + after;
//     }
//     return chunks;
// }

// const languageMap = {
//     "JavaScript": {
//         marks: ["js", "javascript"],
//         rules: [
//             {
//                 type: "backquote", // 反引号字符串 优先级最高， 因为即使注释在里面都会被忽略
//                 regexp: /\\\`[\\s\\S\\n\\r]*?\\\`/g
//             },
//             {
//                 type: "comment", // 注释
//                 regexp: /\\/\\*[\\s\\S\\n\\r]*?\\*\\/|\\/\\/.*/g
//             }
//         ],
//         say:\`hello 
//         world!\`
//     }
// }
// `

// try {
//     setTimeout(function(){
//         throw new Error("死循环了！");
//     },1000)
//     console.log(hl(source))
// }
// catch(err){
//     console.log(err);
// }
export default hl;