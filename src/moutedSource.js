const mountSource = source => {
  // 找出source中的所有 ` " ' /* */ // / /
  const mountedList = [];
  let data = null;
  // 对于正则的判断可能需要用到断言
  const regexp = /\`[\s\S]*?[\`$]|\".*?[\"$]|\'.*?[\'$]|\/\*[\s\S]*?(\*\/|$)|\/\/.*|(?<![a-zA-Z0-9\\])\/.*?(?<!\\)\/[a-zA-Z]*/g;
  // 关键字 [\s\^]var\s|[\s\^]const[\s$]|[\s\^]let\s[\s$]
  // 对象 \{[\s\S]*?\}
  // 箭头函数 [\s\^]\=\>\s[\s$\{\}]|[\s\^]let\s[\s$]|[\s\^]let\s[\s$]
  // 函数表达式 [\s\^]\=\>\s[\s$\{\}]|[\s\^]let\s[\s$]|[\s\^]let\s[\s$]
  // 函数声明·· [\s\^]function\s*\(.*\)[\s\n]*\{[\s\S]*?\}
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
      // 正则表达式
      else if(/^\//.test(chunk)) {
          list.push({type: 7, chunk, index});
      }
      // 正常代码
      else {
          list.push({type: 8, chunk, index});
      }
  }
  return list;
}

export default mountSource;
