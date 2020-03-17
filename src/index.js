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
        marks: ["js", "javascript"],
        rules: [
            {
                type: "backquote", // 反引号字符串 优先级最高， 因为即使注释在里面都会被忽略
                regexp: /\`[\s\S\n\r]*?\`/g
            },
            {
                type: "comment", // 注释
                regexp: /\/\*[\s\S\n\r]*?\*\/|\/\/.*/g
            },
            // {
            //     type: "dot",
            //     regexp: /\./g
            // },
            // {
            //     type: "var",
            //     regexp: /(var|const|let)\s/g
            // }
        ]
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

const hl = (element) => {
    // 判断语言
    let mark = element.className.toLowerCase().replace("language-","");
    const language = getLanguage(mark);
    // 获取源码
    const source = element.textContent;
    // 递归整个源码
    const lines = source.split("\n");
    const len = lines.length;
    const map = {
        backquote:[],
        comment:[],
        beginComment:[],
        endComment:[]
    }
    for(let i = 0; i< len; i++) {
        const line = lines[i];
        let backQuoteIndex = 0, commentIndex = 0, beginCommentIndex = 0, endCommentIndex = 0;
        if(backQuoteIndex = ~line.indexOf("`")) {
            map.backquote.push([i, ~backQuoteIndex]);
        };
        if(commentIndex = ~line.indexOf("\/\/")) {
            map.comment.push([i, ~commentIndex])
        };
        if(beginCommentIndex = ~line.indexOf("\/\*")) {
            map.beginComment.push([i, ~beginCommentIndex])
        };
        if(endCommentIndex = ~line.indexOf("\*\/")) {
            map.endComment.push([i, ~endCommentIndex])
        };
    }
    console.log(map);
    
    // 获取规则
    // const rules = languageMap[language].rules;
    
    // 运行规则
    // element.innerHTML = runRules(source, rules);
}

export default hl;