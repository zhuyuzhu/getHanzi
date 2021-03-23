/**
 * 匹配js中的汉字，通过引号内包含汉字的方式去匹配
 * 还需要过滤min.js文件
*/

var fs = require("fs");
var path = require('path');
var xlsx = require('node-xlsx');
const { match } = require("assert");

var reg = /[\u4E00-\u9FA5]+/g; //匹配中文片段

var regJsp = /\'\s*[\u4E00-\u9FA5]+\s*\'|\"\s*[\u4E00-\u9FA5]+\s*\"|\'.*[\u4E00-\u9FA5]+.*\'|\".*[\u4E00-\u9FA5]+.*\"|\>((\s|\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009)*[\u4E00-\u9FA5]+\-*(\s|\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009)*)+\<|\/\/.+|\<\!\-\-.+\-\-\>|[\u4E00-\u9FA5]+/g; //也匹配注释部分

var regJs = /\'.*[\u4E00-\u9FA5]+.*\'|\".*[\u4E00-\u9FA5]+.*\"/g; //匹配引号内包含中文的片段


//包含项目中使用到的中文符号、英文符号、特殊符号
var zh_cnSymbol = /”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|\.|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\//

var yinhaoZh_CN = /"((\.|\w| |”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\')*[\u4E00-\u9FA5]+(\.|\w| |”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\')*)+"|'((\.|\w| |”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\")*[\u4E00-\u9FA5]+(\.|\w| |”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\")*)+'/g

var regJspElement = /\>((\.|\w|\s|”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\/|\"|\')*[\u4E00-\u9FA5]+(\.|\w|\s|”|“|……|【|】|？|，|。|、|！|：|；|）|（|~|\?|!|\-|\)|\(|,|:|\&nbsp;|\+|\*|&|%|\$|#|@|\.\.\.|\/|\"|\')*)+\</g

//匹配引号内包含中文的任何片段
var reghasZh_CN = /\'.*[\u4E00-\u9FA5]+.*\'|\".*[\u4E00-\u9FA5]+.*\"/g;



/**
 * 匹配js中的汉字，通过引号内包含汉字的方式去匹配
 * 还需要过滤min.js文件
 */

var hanziarr = [['文件路径', '备注', '中文文字', '英文翻译', 'key名']]; //需要翻译的汉字
var hanziItem = []; //一位数组，存储不重复的汉字项
var filesJspNum = 0;
var filesJsNum = 0;

var allNum = 0;

var languageJSON = fs.readFileSync('./jmsLanguage.json', "utf-8");
var zh_CN1 = JSON.parse(languageJSON).zh_CN1;
var en_US = JSON.parse(languageJSON).en_US;


// 查找指定目录中的jsp文件
function findDirJspSync(dirpath) {
    if (dirpath.match(/page_concat_resource|jslib/)) {
        return;
    }
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
            readFileToArrSync(fileordirpath)
        }
    })
}

/**
 * 读取文件内容，根据正则表达式，将需要的内容存入缓存数组中
 * @param {*} fReadName 文件名字（包含后缀）
 */
function readFileToArrSync(fReadName) {

    hanziarr.push([null, null, null], [fReadName, null, null])


    var filedata = fs.readFileSync(fReadName, "utf-8");
    //查找JSP的标签内容——>相当齐全。js中也有字符串标签模块

    filedata = filedata.replace(regJspElement, function (match) {
        allNum++;
        var key = match.slice(1, -1); //去除左右两边的><
        key = key.trim(); //去除两边的空白字符
        if (hanziItem.indexOf(key) == -1) {
            hanziItem.push(key);
            hanziarr.push([null, null, key])
        }
        return '';
    })

    filedata = filedata.replace(yinhaoZh_CN, function (match) { //引号中有中文的内容
        allNum++;
        var key = match.slice(1, -1); //去掉两边的引号
        key = key.trim(); //去除两边的空白字符
        if (hanziItem.indexOf(key) == -1) {
            hanziItem.push(key);
            hanziarr.push([null, null, key])
        }
        return '';
    })


    filedata = filedata.replace(reghasZh_CN, function (match) { //额外遗漏的含有中文的片段
        allNum++;
        var key = match.slice(1, -1) //去掉两边的引号
        key = key.trim(); //去除两边的空白字符
        if (hanziItem.indexOf(key) == -1) {
            hanziItem.push(key);
            hanziarr.push([null, null, key])
        }
        return '';
    })
}

//查找指定目录中的js文件
function findDirJsSync(dirpath) {
    if (dirpath.match(/i18n|jlib/)) {
        return;
    }
    var filesNameArr = fs.readdirSync(dirpath);
    filesNameArr.forEach(fileName => {
        var fileordirpath = path.join(dirpath, fileName);
        var stats = fs.statSync(fileordirpath); //获取文件状态
        if (stats.isDirectory()) {
            findDirJsSync(fileordirpath)
        }
        if (stats.isFile() && fileordirpath.match(/\.js$/) && (!fileordirpath.match(/min\.js$|searchIndexs\.js$|echarts-all\.js$|myMeeting-all\.js|easyui-lang-jp\.js$|easyui-lang-zh_TW\.js$|mo-portal\.js$|echarts-plain-map\.js$|echarts-plain\.js$|livestreaming\.js$|inspectiondomain\.js$|cascadeMeeting\.js$|timezones\.js$|realtimemeetings\.js$|mock\\data/))) {
            filesJsNum++
            console.log(fileordirpath); //执行程序，控制台打印正在操作的文件
            readFileToArrSync(fileordirpath)
        }
    })
}


findDirJspSync('../movision/jms-parent/movision-jms-webapp/webapp', 'jsp');
findDirJsSync('../movision/jms-parent/movision-jms-webapp/webapp', 'js');

console.log("The number of JSP is " + filesJspNum);
console.log("The number of JS is " + filesJsNum);


console.log('allNum  ' + allNum)

// 没有重复需要翻译的汉字
// var buffer = xlsx.build([{ name: "mySheetName", data: hanziarr }]); // Returns a buffer
// fs.writeFileSync('./6.1sp4前端页面JMS最终版excel.xlsx', buffer, "buffer");
