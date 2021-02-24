var fs = require("fs");
var path = require('path');
var xlsx = require('node-xlsx');

var reg = /[\u4E00-\u9FA5]+/g; //匹配中文片段

var regJsp = /\'\s*[\u4E00-\u9FA5]+\s*\'|\"\s*[\u4E00-\u9FA5]+\s*\"|\'.*[\u4E00-\u9FA5]+.*\'|\".*[\u4E00-\u9FA5]+.*\"|\/\/.+|\<\!\-\-.+\-\-\>|[\u4E00-\u9FA5]+/g; //也匹配注释部分

var regJs = /\'.*[\u4E00-\u9FA5]+.*\'|\".*[\u4E00-\u9FA5]+.*\"/g; //匹配引号内包含中文的片段

/**
 * 匹配js中的汉字，通过引号内包含汉字的方式去匹配
 * 还需要过滤min.js文件
 */

var hanziarr = [];
var filesJspNum = 0;
var filesJsNum = 0;

// 同步写法


// 查找指定目录中的jsp文件
function findDirJspSync(dirpath) {
    var filesNameArr = fs.readdirSync(dirpath);
    filesNameArr.forEach(fileName => {
        var fileordirpath = path.join(dirpath, fileName);
        var stats = fs.statSync(fileordirpath); //获取文件状态
        if (stats.isDirectory()) {
            findDirJspSync(fileordirpath)
        }
        if (stats.isFile() && fileordirpath.match(/\.jsp$/)) {
            filesJspNum++
            console.log(fileordirpath); //执行程序，控制台打印正在操作的文件
            readFileToArrSync(fileordirpath, "jsp")
        }
    })
}

/**
 * 读取文件内容，根据正则表达式，将需要的内容存入缓存数组中
 * @param {*} fReadName 文件名字（包含后缀）
 * @param {*} fileType 文件类型jsp或js
 */
function readFileToArrSync(fReadName, fileType) {
    var filedata = fs.readFileSync(fReadName, "utf-8");
    var filehanziArr = null; //match方法匹配文件后的结果
    if(fileType === "jsp"){
        filehanziArr = filedata.match(regJsp);
    }else if(fileType === "js"){
        filehanziArr = filedata.match(regJs);
    }
    if (filehanziArr) {
        hanziarr.push([null, null, null], [fReadName, null, null])
        filehanziArr.forEach(item => {
            if(fileType === "jsp" && (item.startsWith('//') || item.startsWith('<!--'))) {
                return;
            }
            hanziarr.push([null, null, item])
            
        })
    }
}

//查找指定目录中的js文件
function findDirJsSync(dirpath) {
    var filesNameArr = fs.readdirSync(dirpath);
    filesNameArr.forEach(fileName => {
        var fileordirpath = path.join(dirpath, fileName);
        var stats = fs.statSync(fileordirpath); //获取文件状态
        if (stats.isDirectory()) {
            findDirJsSync(fileordirpath)
        }
        // 此处对项目中的文件进行过滤，请结合实际项目进行过滤
        if (stats.isFile() && fileordirpath.match(/\.js$/) && (fileordirpath.match(/zh\_CN\.min\.js$/) || !fileordirpath.match(/min\.js$|searchIndexs\.js$|echarts-all\.js$/))) {
            filesJsNum++
            console.log(fileordirpath); //执行程序，控制台打印正在操作的文件
            readFileToArrSync(fileordirpath, "js")
        }
    })
}
// 获取该地址文件夹中的所有的jsp文件的中文
findDirJspSync('./movision-parent/movision-bmc-webapp/webapp');
// 获取该地址文件夹中的所有的js文件的中文
findDirJsSync('./movision-parent/movision-bmc-webapp/webapp');

console.log("The number of JSP is "+ filesJspNum);
console.log("The number of JS is "+ filesJsNum);

console.log(hanziarr);

var buffer = xlsx.build([{ name: "mySheetName", data: hanziarr }]); // Returns a buffer
fs.writeFileSync('./projectJspJs.xlsx', buffer, "binary");
