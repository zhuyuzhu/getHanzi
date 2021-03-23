/**
 * 读取JMS翻译内容到JSON对象中
 */

var fs = require("fs");
var path = require('path');
var xlsx = require('node-xlsx');


var languageResource = {
    en_US: {

    },
    zh_CN: {

    },
    zh_CN1: {

    }
    
};
// Parse a buffer
const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(`./中英文对照表.xlsx`));


/**
 * item[0]=>文件路径
 * item[1]=>备注信息
 * item[2]=>中文文字
 * item[3]=>英文翻译
 * item[4]=>key名
 */
workSheetsFromBuffer[0].data.forEach((item, index) => {
    
    if (index == 0 || !item[3]) {//过滤第一行、空值
        return;
    }
    var key = item[3];
    var arr = [];
    
    if(item[4]){ // 如果有自定义的key名，使用该key名
        key = item[4]
    }else{
        
        arr = key.toLocaleLowerCase().split(' ')
        var len = arr.length;
        if (len > 3) {
            arr.splice(3, len-3); //截掉前面三个单词
            key = arr.join(' ');
        }
        key = key.replace(/\s(\w)/g, function (match, p1) {
            return p1.toString().toUpperCase()
        })
        key = key.replace(/\,|\d|\[|\]|\.|~|!|\-|\.|\\|\)|\(|@|\s|\{|\}|\/|\'|\&|;/g, ''); //删除key名中的-和.和\和@和空字符
        key = key.replace(/^([A-Z])/, function(match, p1){
            return p1.toString().toLocaleLowerCase();
        })
    }
    if(languageResource.en_US.hasOwnProperty(key)){ //如果存储对象中此key
        key = key+index;
    }

    languageResource.en_US[key] = item[3];
    languageResource.zh_CN[key] = item[2];

    languageResource.zh_CN1[item[2]] = key;
})


fs.writeFile("./language.json", JSON.stringify(languageResource), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

