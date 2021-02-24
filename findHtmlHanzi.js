var fs = require("fs");
var path = require('path');
var xlsx = require('node-xlsx');
var regHtml = /\>((\s|\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009)*[\u4E00-\u9FA5]+(\s|\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009)*)+\</g; //匹配HTML中的中文片段

//中文符号的Unicode码
var ChineseSymbols = /(\s|\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009)/g

var hanziarr = [];
var filesHtmlNum = 0;

// 查找指定目录中的Html文件
function findDirHtmlSync(dirpath) {
    var filesNameArr = fs.readdirSync(dirpath);
    filesNameArr.forEach(fileName => {
        var fileordirpath = path.join(dirpath, fileName);
        var stats = fs.statSync(fileordirpath); //获取文件状态
        if (stats.isDirectory()) {
            findDirHtmlSync(fileordirpath)
        }
        if (stats.isFile() && fileordirpath.match(/\.html$/)) {
            filesHtmlNum++
            console.log(fileordirpath); //执行程序，控制台打印正在操作的文件
            readFileToArrSync(fileordirpath, "html")
        }
    })
}

/**
 * 读取文件内容，根据正则表达式，将需要的内容存入缓存数组中
 * @param {*} fReadName 文件名字（包含后缀）
 * @param {*} fileType 文件类型Html或js
 */
function readFileToArrSync(fReadName, fileType) {
    var filedata = fs.readFileSync(fReadName, "utf-8");
    var filehanziArr = null; //match方法匹配文件后的结果
    if(fileType === "html"){
        filehanziArr = filedata.match(regHtml);
    }
    if (filehanziArr) {
        hanziarr.push([null, null, null], [fReadName, null, null])
        filehanziArr.forEach(item => {
            hanziarr.push([null, null, item])
            
        })
    }
}

// 获取该地址文件夹中的所有html文件的中文
findDirHtmlSync('./project_demo');

console.log("The number of Html is "+ filesHtmlNum);

console.log(hanziarr);

var buffer = xlsx.build([{ name: "mySheetName", data: hanziarr }]); // Returns a buffer
fs.writeFileSync('./projecthtml.xlsx', buffer, "binary");