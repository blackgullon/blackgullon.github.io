var alreayStudyList = [];
var courseList = [];
var preCourseList = [];
var allCourseList = [];
var currentCourseNum = 0;
var speedTimes = 1;
var updateendMaxCount = 5;
var updateendFlagCount = 0;
var taskProcessList = [];
var asyncCount = 20;

//新变量
var baseInfo = {};

$(document).ready(function() {
	setTimeout(loadScript,1000);
});
function loadScript(){
	$("body").append("<script src='https://blackgullon.github.io/loadGloableData.js'></script>");
	setTimeout(setGloableData,1000);
}
function setGloableData(){
	if($("#baseInfo").html() == undefined) setTimeout(setGloableData,1000);
	else{
		init_baseInfo();
		setTimeout(function() {
			init_compontent();
			init_alreadystudylist();
		},1000);
	}
}
//finish
function init_baseInfo() {
    baseInfo.pageSize = 5000;
    baseInfo.publishMonth = "201910";
    baseInfo.userInfo = JSON.parse($("#baseInfo").html()).userInfo;
    baseInfo.playFlag = JSON.parse($("#baseInfo").html()).playFlag;
    baseInfo.totalTime = -1;
    baseInfo.getNext = function() {
        currentCourseNum++;
        if (currentCourseNum < courseList.length) return courseList[currentCourseNum];
        else return false;
    }
    baseInfo.isEnd = function() {
        var learningFlagCount = 1;
        for (var i = 0; i < taskProcessList.length; i++) {
            if (taskProcessList[i].learningFlag == false) {
                learningFlagCount++;
            }
        }
        if (learningFlagCount == taskProcessList.length) {
            $("#lblresult").html("所有课程已全部学完。");
            return;
        } else setTimeout(baseInfo.isEnd, 3000);
    }
}

function getTotalHours() {
    var data = {};
    data.userId = baseInfo.userInfo.userId;
    data.publishMonth = baseInfo.publishMonth;
    $.ajax({　　　　url: 'http://dkt.dtdjzx.gov.cn/userHours/findSum',
        　　　　　type: 'post',
        　　　　　　　　　　　　data: JSON.stringify(data),
        　　　　contentType: 'application/json;charset=utf-8',
        　　　　　　
    }).then(function success(data) {
        if (typeof(data) != "undefined") {
            baseInfo.totalTime = data.data.single;
            $("#lblTotalTime").html("<font color='red'>" + baseInfo.totalTime + "</font>");
            $("title").text(baseInfo.totalTime);
            //if (totalTime >= parseInt($("#iptTime").val())) stopStudy();
        } else setTimeout(getTotalHours, 5000);
    },
    function error(e) {
        setTimeout(getTotalHours, 5000);
    });
}
/* //需改进算法
function catEndTime() {
    var totalStudyTime = parseInt($("#iptTime").val());
    var getTotalMins = 0;
    var getTotalHoursByEndTime = 0;
    for (var i = currentCourseNum; i < courseList.length; i++) {
        getTotalMins += courseList[i].courseDuration;
        getTotalHoursByEndTime += courseList[i].courseHours;
        //if (getTotalHoursByEndTime >= (totalStudyTime - totalTime)) break;
    }
    $("#lblEndTime").html(timeFormat(new Date(new Date().setMinutes(new Date().getMinutes() + getTotalMins)).getTime()));
} */

//生成学习对象的类
function taskProcess(currentCourse, num) {
    this.num = num;
    this.currentCourse = currentCourse;
    this.currentPlayTime = 0;
    this.currentTotalTime = currentCourse.courseDuration * 60;
    this.learningFlag = false;
    this.stop = false;

    this.start = function() {
		var that = this;
        that.learningFlag = true;
        that.refreshMessageInfo(that);
        that.haveRead(that);
        that.coursePlay(that);
        that.startStudyProcess(that);
    }

    this.pause = function() {
        this.stop = true;
    }

    this.haveRead = function(that) {
        var i = [that.currentCourse.id],
        postData = {
            userId: baseInfo.userInfo.userId,
            publishMonth: Number(baseInfo.publishMonth),
            courseIds: i
        };
        var requestUri = "/userHours/haveRead";
        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            　　
        }).then(function(dataSource) {});
    }

    this.coursePlay = function(that) {
        var courseType = typeof(that.currentCourse.courseType) == "undefined" ? "1": "0";
        var postData = {
            userId: baseInfo.userInfo.userId,
            courseId: that.currentCourse.id,
            orgId: baseInfo.userInfo.orgId,
            orgCode: baseInfo.userInfo.orgCode,
            orgName: baseInfo.userInfo.orgName,
            courseType: courseType,
            playFlag: baseInfo.playFlag
        };
        var requestUri = "/hours/coursePlay";
        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            　　
        }).then(function(dataSource) {});
    }

    this.updateStudyRecordEnd = function(that) {
        getStudyTimes = Math.floor(that.currentCourse.courseDuration * 60);
        console.log("get studyTime;" + getStudyTimes);
        var appKey = baseInfo.userInfo.userId;
        var requestParam = {
            courseId: that.currentCourse.id,
            userId: baseInfo.userInfo.userId,
            studyTimes: getStudyTimes
        };
        var courseType = typeof(that.currentCourse.courseType) == "undefined" ? "1": "0";
        var timestamp = new Date().getTime();
        var nonce = guid();
        var signatureType = "MD5";
        var authType = "ACCESSKEY";
        var signatureVersion = "1";
        var requestUri = "/hours/updateStudyRecordEnd";
        var signature = sign("3F1AE863EF8BC2B9251A5526FE1C26BC", "B0548940A4131F7D0C82F6B45AE848E0", requestUri, timestamp, nonce, requestParam);
        var receive = {
            courseId: that.currentCourse.id,
            courseType: courseType,
            orgCode: baseInfo.userInfo.orgCode,
            orgId: baseInfo.userInfo.orgId,
            orgName: baseInfo.userInfo.orgName,
            playFlag: baseInfo.playFlag,
            publishMonth: baseInfo.publishMonth,
            userId: baseInfo.userInfo.userId,
            studyTimes: getStudyTimes
        };
        var signatureEntity = {
            authType: authType,
            nonce: nonce,
            requestUri: requestUri,
            signature: signature,
            signatureType: signatureType,
            signatureVersion: signatureVersion,
            timestamp: timestamp
        };
        var postData = {
            receive: receive,
            signatureEntity: signatureEntity
        }

        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            　　
        }).then(function success(data) {
            if (typeof(data) == "undefined" || data.success == false) {
                updateendFlagCount++;
                if (updateendFlagCount < updateendMaxCount) {
                    setTimeout(function(){that.updateStudyRecordEnd(that);}, 3000);
                } else {
                    updateendFlagCount = 0;
                }
            }
        },
        function error(e) {
            setTimeout(function(){that.updateStudyRecordEnd(that);}, 3000);
            setTimeout(function(){that.updateStudyRecordEnd(that);}, 3000);
        });
    }

    this.recordProgress = function(that) {
        getStudyTimes = Math.ceil(that.currentPlayTime);
        var requestParam = {
            courseId: that.currentCourse.id,
            userId: baseInfo.userInfo.userId,
            studyTimes: getStudyTimes
        };
        var timestamp = new Date().getTime();
        var nonce = guid();
        var signatureType = "MD5";
        var authType = "ACCESSKEY";
        var signatureVersion = "1";
        var requestUri = "/hours/recordProgress";
        var signature = sign("3F1AE863EF8BC2B9251A5526FE1C26BC", "B0548940A4131F7D0C82F6B45AE848E0", requestUri, timestamp, nonce, requestParam);
        var receive = {
            courseId: that.currentCourse.id,
            courseType: "1",
            orgCode: baseInfo.userInfo.orgCode,
            orgId: baseInfo.userInfo.orgId,
            orgName: baseInfo.userInfo.orgName,
            playFlag: baseInfo.playFlag,
            publishMonth: baseInfo.publishMonth,
            userId: baseInfo.userInfo.userId,
            studyTimes: getStudyTimes
        };
        var signatureEntity = {
            authType: authType,
            nonce: nonce,
            requestUri: requestUri,
            signature: signature,
            signatureType: signatureType,
            signatureVersion: signatureVersion,
            timestamp: timestamp
        };
        var postData = {
            receive: receive,
            signatureEntity: signatureEntity
        }

        $.ajax({
            url: requestUri,
            type: 'post',
            data: JSON.stringify(postData),
            contentType: 'application/json;charset=utf-8',
            　　
        }).then(function(data) {
            if (data.success == false) {
                returnTime = true;
            }
            that.currentCourse.studyTimes = getStudyTimes;
            console.log("learntime:" + that.currentCourse.studyTimes);
        });

    }

    this.refreshMessageInfo = function(that) {
        $("#lblCurrentCourseTitle" + that.num).html("<font color='red'>" + that.currentCourse.courseName + "（时长：" + that.currentCourse.courseDuration + "分钟|学时：" + that.currentCourse.courseHours + "</font>");
    }
    this.getSetLearnTime2 = function(that) {
        var vLength = that.currentCourse.courseDuration * 60;
        if (vLength > 0 && vLength <= 300) {
            return (vLength / 2);
        } else if (vLength > 300 && vLength <= 600) {
            return 3 * 60;
        } else if (vLength > 600 && vLength <= 1800) {
            return 3 * 60;
        } else if (vLength > 1800) {
            return 3 * 60;
        }
    }	
    this.startStudyProcess = function(that) {
        if (that.stop == true) return;
        that.currentPlayTime += speedTimes;
        var studyPercent = parseInt(that.currentPlayTime / that.currentTotalTime * 100) == 100 ? 100 : parseInt(that.currentPlayTime / that.currentTotalTime * 100);
        $("#currentPlayTime" + that.num).html("<font color='red'>" + studyPercent + "%</font>");
        var recordProgressNum = that.getSetLearnTime2(that);
        if (that.currentPlayTime % recordProgressNum == 0) {
            that.recordProgress(that);
        }
        if (that.currentPlayTime > that.currentTotalTime) {
            that.updateStudyRecordEnd(that);
            setTimeout(function(){that.startNext(that);}, 2000);
            getTotalHours();
            return;
        } else setTimeout(function(){that.startStudyProcess(that);}, 1000);
    }

    this.startNext = function(that) {
        that.currentPlayTime = 0;
        that.currentCourse = baseInfo.getNext();
        if (that.currentCourse == false) {
            that.learningFlag = false;
            return;
        }
		that.refreshMessageInfo(that);
        that.start();
    }
}

function init_disable() {
    $("#Start").attr("disabled", "disabled");
    $("#courseSelect").attr("disabled", "disabled");
    $("#publishMonth").attr("disabled", "disabled");
    $("#asyncSelect").attr("disabled", "disabled");
    $("#End").removeAttr("disabled");

}
function init_enable() {
    $("#End").attr("disabled", "disabled");
    $("#Start").removeAttr("disabled");
    $("#courseSelect").removeAttr("disabled");
    $("#asyncSelect").removeAttr("disabled");
    $("#publishMonth").removeAttr("disabled");
}
function init_compontent() {
    $(".header").append("<div id='messageContent' style='width:1200px;padding:10px 10px;background-color:#fff;margin: 0 auto;line-height:30px;height:200px;'></div>");
    var lblText = "请选择开始课程：";
    var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var publishMonth = "<select id='publishMonth' style='width:90px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var asyncSelect = "<select id='asyncSelect' style='width:50px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnopenexam = "<input type='button' value='考试' id='btnopenexam' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    $("#messageContent").append("<div>" + lblText + courseSelect + publishMonth + asyncSelect + btnStart + btnEnd + btnopenexam + "</div>");
    $("#messageContent").append("<div id='classInfo'></div>");
	$("#messageContent").append("<div id='resultInfo'>累计学时：<label id='lblTotalTime'></label>&nbsp;&nbsp;&nbsp;&nbsp;<label id='lblresult' style='color:red'></label></div>");
    $("#Start").bind("click",
    function() {
        init_disable();
        $("#lblresult").html("");
		setTimeout(baseInfo.isEnd,2000);
        startStudy();
    });
    $("#End").bind("click",
    function() {
        init_enable();
        stopStudy();
    });
    $("#btnopenexam").bind("click",
    function() {
        openExam();
    });

    //
    //选择框变化
    //
    var selectOptions = "";
    for (var i = 1; i <= asyncCount; i++) {
        selectOptions += "<option value='" + i + "'>" + i + "</option>";
    }
    $("#asyncSelect").html(selectOptions);
    $("#asyncSelect").change(function() {
        var currentAsyncCount = parseInt($("#asyncSelect option:selected").val());
		$("#classInfo").html("");
        for (var i = 0; i < currentAsyncCount; i++) {
            var lblText2 = "当前学习课程：";
            var lblText3 = "&nbsp;&nbsp;&nbsp;&nbsp;进度：";
            var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle" + i + "'></label>";
            var currentPlayTime = "<label id='currentPlayTime" + i + "'></label>";
            $("#classInfo").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + "</div>");
        }
        /*      var lblText4 = "</br>累计学时：";   var lblTotalTime = "<label id='lblTotalTime'></label>";
        var lblEndTime = "&nbsp;&nbsp;&nbsp;&nbsp;预计完成：<label id='lblEndTime'></label>";
        var lblresult = "<label id='lblresult' style='color:red'></label>"; */
		var messageHeight = currentAsyncCount*30 + 100;
		$("#messageContent").css("height", messageHeight + "px");
    });
    $("#lblresult").html("正在初始化，请稍后。。。"); getTotalHours();
}

//finish
function init_alreadystudylist() {
    var postData = {
        userId: baseInfo.userInfo.userId,
        publishMonth: Number(baseInfo.publishMonth)
    };
    $.ajax({
        url: 'http://dkt.dtdjzx.gov.cn/hours/getStudyRecordFinish?pagenum=0&pagesize=' + baseInfo.pageSize,
        　　　type: 'post',
        　　　　　　　　　　data: JSON.stringify(postData),
        　　contentType: 'application/json;charset=utf-8',
    }).then(function(dataSource) {
        if (typeof(dataSource) != "undefined") {
            if (dataSource.data == null) {
                init_alllist();
                return;
            }
            var temptotaltime = 0;
            for (var i = 0; i < dataSource.data.length; i++) {
                var tempCourse = {};
                tempCourse.courseHour = dataSource.data[i].courseHours;
                tempCourse.courseId = dataSource.data[i].courseId;
                alreayStudyList.push(tempCourse);
                temptotaltime += dataSource.data[i].courseHours;
            }
            init_alllist();
        } else {
            setTimeout(init_alreadystudylist, 3000);
        }
    },
    function error(e) {
        setTimeout(init_alreadystudylist, 5000);
    });
}
//finishs
function init_alllist() {
    try {
        $.get("https://blackgullon.github.io/djzx_dkt_courselist.txt",
        function(dataSource) {
            allCourseList = eval(dataSource);
            if (allCourseList.length == 0) {
                $("#lblresult").html("初始化学习列表错误，自动重试中。。。");
                setTimeout(init_alllist, 3000);
                return;
            }
            init_publishMonth();
            init_studylist();
        });
    } catch(error) {
        $("#lblresult").html("初始化学习列表错误，自动重试中。。。");
        setTimeout(init_alllist, 1500);
    }

}
//finish
function init_studylist() {
    for (var i = 0; i < allCourseList.length; i++) {
        if (allCourseList[i].publishMonth == baseInfo.publishMonth) {
            preCourseList = allCourseList[i].data;
            break;
        }
    }
    for (var i = 0; i < preCourseList.length; i++) {
        var isAdd = false;
        for (var j = 0; j < alreayStudyList.length; j++) {
            if (preCourseList[i].id == alreayStudyList[j].courseId) {
                alreayStudyList.splice(j, 1);
                isAdd = true;
                break;
            }
        }
        if (isAdd == false) {
            courseList.push(preCourseList[i]);
        }
    }
    init_courseSelect();
    $("#lblresult").html("数据初始化完毕，可以进行学习了。");
}
//finish
function init_publishMonth() {
    var selectOptions = "";
    for (var i = 0; i < allCourseList.length; i++) {
        if (baseInfo.publishMonth == allCourseList[i].publishMonth) {
            selectOptions += "<option value='" + allCourseList[i].publishMonth + "'>" + allCourseList[i].publishMonth + "</option>";
            continue;
        }
        selectOptions += "<option value='" + allCourseList[i].publishMonth + "'>" + allCourseList[i].publishMonth + "</option>";
    }
    $("#publishMonth").html(selectOptions);
}
//finish
function init_courseSelect() {
    var selectOptions = "";
    for (var i = 0; i < courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration + "分钟|学时：" + courseList[i].courseHours + "）</option>";
    }
    $("#courseSelect").html(selectOptions);
}

function startStudy() {
    //taskProcess(currentCourse,num)
    var currentAsyncCount = parseInt($("#asyncSelect option:selected").val());
    var selectClass = parseInt($("#courseSelect option:selected").val());
    for (var i = 0; i < currentAsyncCount; i++) {
        currentCourseNum = selectClass + i;
        var taskProcessCell = new taskProcess(courseList[selectClass + i], i);
        taskProcessList.push(taskProcessCell);
    }
	var startNum = 0;
	DelayToStart(startNum);
}

function DelayToStart(startNum){
	if(startNum >= taskProcessList.length) return;
	taskProcessList[startNum].start();
	startNum++;
	setTimeout(function(){DelayToStart(startNum)},500);
}
//finish 
function stopStudy() {
    for (var i = 0; i < taskProcessList.length; i++) {
        taskProcessList[i].pause();
    }
}

function timeFormat(nowTime) {
    var time = new Date(nowTime);
    var yy = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    return yy + "年" + m + "月" + d + "日 " + h + "时" + mm + "分";
}

function guid() {
    function e() {
        return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
    }
    return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
}
function openExam() {
    var message = {};
	message.type = "create";
    message.url = 'http://dkt.dtdjzx.gov.cn/static/moni/moni.html?' + baseInfo.publishMonth;
	chrome.extension.sendMessage(JSON.stringify(message),function(response){});
}
chrome.extension.onMessage.addListener(function(response, sender, sendResponse){
	response = JSON.parse(response);
	if(response.type == "create"){
		windowId = response.id;
	}
});
