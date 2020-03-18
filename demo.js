// 测试例子
var source = `// 工具类方法
/**
 * 测试例子
 * @param {[string]} chunks 
 * @param {[{index: number, value: string}]} execList 
 * @param {string} before 
 * @param {string} after
 */
const foo = (chunks, execList, before, after) => {
    if(!Object.prototype.toString.call(chunks) === "[object Array]") {
        throw new TypeError("foo的第一个参数必须是字符串");
    }
    console.log(chunks)
    return chunks;
}

module.exports = {
    "module": {
        rules: [
            {
                type: "test", // 
                regexp: /\\\`[\\s\\S\\n\\r]*?\\\`/g
            }
        ],
        say:\`hello 
        world!\`
    }
}
`

try {
    console.log(hl(source));
}
catch(err){
    console.log(err);
}
