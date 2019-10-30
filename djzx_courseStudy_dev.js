$("body").append("<script src='https://generade.github.io/jszip-utils.min.js'></script>");
$("body").append("<script src='https://generade.github.io/jszip.min.js'></script>");
var alreayStudyList = [];
var courseList = [];
var preCourseList = [];
var courseSelect = "";
var currentCourse = {};
var currentCourseNum = 0;
var currentTotalTime = 0;
var currentPlayTime = 0;
var totalTime = -1;
var speedTimes = 1;
var studyPercent = 0;
var studyCount = 0;
var tempCourseList = [];
var preProject = {};
var maFlag = false;
var addtimeMaxCount = 20;
var updateendMaxCount = 5;
var addtimeFlagCount = 0;
var addtimeAllCount = 0;
var updateendFlagCount = 0;

$(document).ready(function() {
    setTimeout(function(){
		init_compontent();
		init_alreadystudylist();
	},1000);
});
function getTotalHours() {
    $.postJSON("/user/getOutTime", {
        year: "2019",
        userId: ""
    }).then(function success(data) {
        if (typeof(data) != "undefined") {
            totalTime = data.totalHours;
            $("#lblTotalTime").html("<font color='red'>" + totalTime + "</font>");
            $("title").text(totalTime);
            if (totalTime >= parseInt($("#iptTime").val())) stopStudy();
        }
		else setTimeout(getTotalHours,5000);
    },function error(e){
		setTimeout(getTotalHours,5000);
	});
}
function updateEnd(){
    getStudyTimes = Math.floor(preProject.courseDuration * 60);
    console.log("get studyTime;" + getStudyTimes);
    var appKey = userId;
    if (preProject.studyStatus != "2") {
        var receive = {
            timelength: preProject.courseDuration,
            courseId: preProject.courseId,
            userId: appKey,
            studyTimes: getStudyTimes
        };
        var requestParam = {
            courseId: preProject.courseId,
            userId: appKey,
            studyTimes: getStudyTimes
        };
        var timestamp = new Date().getTime();
        var nonce = guid();
        var signatureType = "MD5";
        var authType = "ACCESSKEY";
        var signatureVersion = "1";
        var requestUri = "/bintang/recordProgress";
        var signature=sign(appKey,appSecret,requestUri,timestamp,nonce,requestParam);
        var signatureEntity = {
            "appKey": appKey,
            "timestamp": timestamp,
            "nonce": nonce,
            "signatureType": signatureType,
            "authType": authType,
            "signatureVersion": signatureVersion,
            "requestUri": requestUri,
            "signature": signature
        };
        $.postJSON("/bintang/updateTimeEnd", {
            "signatureEntity": signatureEntity,
            "receive": receive
        }).then(function success(data) {
			if(typeof(data) == "undefined"){
				updateendFlagCount++;
				if(updateendFlagCount < updateendMaxCount){
					setTimeout(updateEnd,3000);
				}
				else {
					updateendFlagCount = 0;
				}				
			}
            if(data.isRecord == false) {
				updateendFlagCount++;
				if(updateendFlagCount < updateendMaxCount){
					setTimeout(updateEnd,3000);
				}
				else {
					updateendFlagCount = 0;
				}
			}
        },function error(e) {
			setTimeout(updateEnd,3000);
		});
    }
}
function StudyProgress() {
    getStudyTimes = Math.ceil(currentPlayTime);
    var appKey = userId;
    var receive = {
        timelength: project.courseDuration,
        courseId: project.courseId,
        userId: appKey,
        studyTimes: getStudyTimes
    };
    var requestParam = {
        courseId: project.courseId,
        userId: appKey,
        studyTimes: getStudyTimes
    };
    var timestamp = new Date().getTime();
    var nonce = guid();
    var signatureType = "MD5";
    var authType = "ACCESSKEY";
    var signatureVersion = "1";
    var requestUri = "/bintang/recordProgress";
    var signature = sign(appKey, appSecret, requestUri, timestamp, nonce, requestParam);
    var signatureEntity = {
        "appKey": appKey,
        "timestamp": timestamp,
        "nonce": nonce,
        "signatureType": signatureType,
        "authType": authType,
        "signatureVersion": signatureVersion,
        "requestUri": requestUri,
        "signature": signature
    };
    $.postJSON("/bintang/recordProgress", {
        "signatureEntity": signatureEntity,
        "receive": receive
    }).then(function(data) {
        if (data.isRecord == false) {
            returnTime = true;
        }
        project.studyTimes = getStudyTimes;
        console.log("learntime:" + project.studyTimes);
    });

}
function catEndTime() {
    var totalStudyTime = parseInt($("#iptTime").val());
    var getTotalMins = 0;
    var getTotalHoursByEndTime = 0;
    for (var i = currentCourseNum; i < courseList.length; i++) {
        getTotalMins += courseList[i].courseDuration;
        getTotalHoursByEndTime += courseList[i].courseHour;
        if (getTotalHoursByEndTime >= (totalStudyTime - totalTime)) break;
    }
    $("#lblEndTime").html(timeFormat(new Date(new Date().setMinutes(new Date().getMinutes() + getTotalMins)).getTime()));

}
function validateSet(){
	$("#lblresult").html("正在验证基础数据。。。");
	if($("#iptTime").val().trim() == "") {
		$("#lblresult").html("请输入结束学时。");
		return false;
	}
	else{
		var reg=/^[1-9]\d*$|^0$/;
		if(reg.test($("#iptTime").val().trim()) == false){
			$("#lblresult").html("结束学时请输入数字，注意数字 0 不要在第一位");
			return false;
		}
	}
	if(totalTime == -1){
		$("#lblresult").html("累计学时没有获取成功，请刷新页面重试。");
		return false;
	}
	else{
		if(parseInt($("#iptTime").val().trim()) - totalTime <=0){
			$("#lblresult").html("结束学时请 大于 累计学时。");
			return false;
		}
	}
	return true;
}
function init_disable(){
	$("#Start").attr("disabled", "disabled");
	$("#courseSelect").attr("disabled", "disabled");
	$("#End").removeAttr("disabled");
	$("#iptTime").attr("disabled", "disabled");
	$("#iptMa").attr("disabled", "disabled");	
}
function init_enable(){
	$("#End").attr("disabled", "disabled");
	$("#Start").removeAttr("disabled");
	$("#courseSelect").removeAttr("disabled");
	$("#iptTime").removeAttr("disabled");	
	$("#iptMa").removeAttr("disabled");	
}
function init_compontent() {
	$(".nav-box").before("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color: #fff;margin: 0 auto;line-height:30px;height:200px;'><div>");
    var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	var iptTime = "<input type='text' id='iptTime' value='70' style='width:40px;height:27px;border: 1px solid;border-radius: 3px;text-align:center;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$("#messageContent").append("<div>" + lblText + courseSelect + iptTime + btnStart + btnEnd + "</div>");
    $("#Start").bind("click",
		function() {
			init_disable();
			if(validateSet() == false){
				init_enable();
				return;
			}
			$("#lblresult").html("");
			startStudy();			
    });
    $("#End").bind("click",
		function() {
			init_enable();
			stopStudy();
    });
	//选择框变化
    $("#courseSelect").change(function() {
        currentCourseNum = $("#courseSelect option:selected").val();
        $("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
    });
    var lblText2 = "当前学习课程：";
    var lblText3 = "</br>当前课程学习进度：";
    var lblText4 = "</br>累计学时：";
    var lblCurrentCourseTitle = "<label id='lblCurrentCourseTitle'></label>";
    var currentPlayTime = "<label id='currentPlayTime'></label>";
    var lblTotalTime = "<label id='lblTotalTime'></label>";
    var lblEndTime = "&nbsp;&nbsp;&nbsp;&nbsp;预计完成：<label id='lblEndTime'></label>";
	var lblresult = "<label id='lblresult' style='color:red'></label>";
    $("#messageContent").append("<div>" + lblText2 + lblCurrentCourseTitle + lblText3 + currentPlayTime + lblText4 + lblTotalTime + lblEndTime + lblresult + "</div>");
    $("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
    $("#messageContent").css("height", "100px");
    $("#courseSelect").change(function() {
        currentCourseNum = $("#courseSelect option:selected").val();
        $("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
    });
	$("#lblresult").html("正在初始化，请稍后。。。");
    getTotalHours();
}
function init_alreadystudylist(){
	 $.postJSON("/user/getschoolfileList", {
        pageSize: 2000,
        pageNo: 1,
        courseType: "",
        studyStatus: "1",
        year: "2019"
    }).then(function(dataSource) {
		if (typeof(dataSource) != "undefined") {
			if(dataSource.data == null){
				init_alllist();
				return;
			}			
			var temptotaltime = 0;
            for(var i=0;i<dataSource.data.length;i++){
				var tempCourse = {};
				tempCourse.courseHour = dataSource.data[i].courseHour;
				tempCourse.courseId = dataSource.data[i].courseId;
				alreayStudyList.push(tempCourse);
				temptotaltime += dataSource.data[i].courseHour;
			}
			if(totalTime - temptotaltime >=100){
				setTimeout(init_alreadystudylist,1500);
				return;
			}
			init_alllist();
        } else {
			setTimeout(init_alreadystudylist,3000);
        }	
    },function error(e) {
		setTimeout(init_alreadystudylist,5000);
	});
}
function init_alllist(){
	var base = new Base64();
	try{
		var promise = new JSZip.external.Promise(function (resolve, reject) {
			JSZipUtils.getBinaryContent('https://generade.github.io/list.zip', function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
		promise.then(JSZip.loadAsync).then(function(zip) {   
			return zip.file("list.txt").async("string"); 
		}).then(function success(text) { 
			preCourseList = eval(base.decode(text));
			if(preCourseList.length == 0){
				$("#lblresult").html("初始化学习列表错误，自动重试中。。。");
				setTimeout(init_alllist,3000);
				return;
			}
			init_studylist();		
		},function error(e) {
			setTimeout(init_alllist,5000);
		});
	}
	catch(error){
		$("#lblresult").html("JSZip加载错误，自动重试中。。。");
		setTimeout(init_alllist,1500);
	}

}
function init_studylist(){
	for (var i = 0; i < preCourseList.length; i++) {
		var isAdd = false;
        for (var j = 0; j < alreayStudyList.length; j++) {
            if (preCourseList[i].courseId == alreayStudyList[j].courseId) {
				alreayStudyList.splice(j,1);
                isAdd = true;
                break;
            }
        }
        if (isAdd == false){
			courseList.push(preCourseList[i]);
		} 
    }
	var selectOptions = "";
	for (var i = 0; i < courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration + "分钟|学时：" + courseList[i].courseHour + "）</option>";
    }
    $("#courseSelect").html(selectOptions);
	$("#lblresult").html("数据初始化完毕，可以进行学习了。");
}
function nextable(){
	if(currentCourseNum >= courseList.length){
		$("#lblresult").html("所有课程已全部学完。");
		return false;
	}
	if (totalTime >= parseInt($("#iptTime").val())){
		$("#lblresult").html("已学够结束学时，学习停止。");
		return false;
	}
	if($("#End").attr("disabled") == "disabled") return false;
	return true;
}
function startNext(){
	studyCount = 0;
    currentPlayTime = 0;
    currentCourseNum++;
	preProject = project;
	getTotalHours();
	if(nextable() == false) return;
	startStudy();
}
function startStudy() {
    currentCourse = courseList[currentCourseNum];
    currentTotalTime = currentCourse.courseDuration * 60;
    project = currentCourse;
	getTotalHours();
	setTimeout(catEndTime,3000);
    addTimeCount();
}
function addTimeCount() {
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].courseName + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].courseHour + "）</font>");
    $.postJSON("/bintang/addTimeCount", currentCourse, ).then(function success(data) {
        var code = data.code;
        console.log(data.isRecord);
		if(data.isRecord == true){
			if(addtimeFlagCount>0){
				addtimeFlagCount = 0;
				$("#lblresult").html("");
			}			
			currentCourse.studyTimes = currentCourse.studyTimes ? currentCourse.studyTimes: 0;
			startStudyProcess();
		}
		else {
			addtimeFlagCount++;
			if(addtimeFlagCount < addtimeMaxCount) {
				setTimeout(addTimeCount,5000);
				$("#lblresult").html("当前学习课程没有记录，正在重试。。。");
			}
			else {
				addtimeFlagCount = 0;
				addtimeAllCount++;
				startNext();
			}
			
		}
    },function error(e){
		setTimeout(addTimeCount,5000);
	});
}
function startStudyProcess() {
	if(nextable() == false) {
		stopStudy();
		return;
	}
    studyCount++;
    currentPlayTime += speedTimes;
    studyPercent = parseInt(currentPlayTime / currentTotalTime * 100) == 100 ? 100 : parseInt(currentPlayTime / currentTotalTime * 100);
    $("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
    var recordProgress = getSetLearnTime2();
	if (currentPlayTime % recordProgress == 0) {		
        StudyProgress();
	}
    if (currentPlayTime > currentTotalTime) {
		studyCount = 0;
        currentPlayTime = 0;
		preProject = project;
        updateEnd();
		setTimeout(startNext,3000);
		return;
    } 
	else setTimeout(startStudyProcess,1000);
}
function stopStudy() {
    currentPlayTime = 0;
    studyCount = 0;
	init_enable();
}
function getSetLearnTime2() {
    var vLength = currentCourse.courseDuration * 60;
    if (vLength > 0 && vLength <= 300) { 
        return (vLength / 2);
    } else if (vLength > 300 && vLength <= 600) { 
        return 3 * 60;
    } else if (vLength > 600 && vLength <= 1800) {
        return 5 * 60;
    } else if (vLength > 1800) {
        return 10 * 60;
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
function Base64() {
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=456";
    this.decode = function (input) {  
        var output = "";  
        var chr1, chr2, chr3;  
        var enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
        while (i < input.length) {  
            enc1 = _keyStr.indexOf(input.charAt(i++));  
            enc2 = _keyStr.indexOf(input.charAt(i++));  
            enc3 = _keyStr.indexOf(input.charAt(i++));  
            enc4 = _keyStr.indexOf(input.charAt(i++));  
            chr1 = (enc1 << 2) | (enc2 >> 4);  
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
            chr3 = ((enc3 & 3) << 6) | enc4;  
            output = output + String.fromCharCode(chr1);  
            if (enc3 != 64) {  
                output = output + String.fromCharCode(chr2);  
            }  
            if (enc4 != 64) {  
                output = output + String.fromCharCode(chr3);  
            }  
        }  
        output = _utf8_decode(output);  
        return output;  
    }  
    _utf8_decode = function (utftext) {  
        var string = "";  
        var i = 0;  
        var c = c1 = c2 = 0;  
        while ( i < utftext.length ) {  
            c = utftext.charCodeAt(i);  
            if (c < 128) {  
                string += String.fromCharCode(c);  
                i++;  
            } else if((c > 191) && (c < 224)) {  
                c2 = utftext.charCodeAt(i+1);  
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
                i += 2;  
            } else {  
                c2 = utftext.charCodeAt(i+1);  
                c3 = utftext.charCodeAt(i+2);  
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
                i += 3;  
            }  
        }  
        return string;  
    }  
}
