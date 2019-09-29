var alreayStudyList = [];
var courseList = [];
var preCourseList = [];
var allCourseList = [];
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

//新变量
var baseInfo = {};
$(document).ready(function() {
	init_baseInfo();
    setTimeout(function(){
		init_compontent();
		init_alreadystudylist();
	},1000);
});
//finish
function init_baseInfo(){
	baseInfo.pageSize = 5000;
	baseInfo.publishMonth = "201909";
	baseInfo.userInfo = JSON.parse(sessionStorage.getItem("userInfo")).data;
	baseInfo.playFlag = appToken.token + "undefined";
	baseInfo.totalTime = -1;
	
}
//finish
function getTotalHours() {
	var data = {};
	data.userId = baseInfo.userInfo.userId;
	data.publishMonth = baseInfo.publishMonth;
     $.ajax({
　　　　url : 'http://dkt.dtdjzx.gov.cn/userHours/findSum', 　  
　　　　type : 'post',　　　　　　　　
　　　　data : JSON.stringify(data),
　　　　contentType:'application/json;charset=utf-8',              　　　　
　　}).then(function success(data) {
        if (typeof(data) != "undefined") {
            baseInfo.totalTime = data.data.single;
            $("#lblTotalTime").html("<font color='red'>" + baseInfo.totalTime + "</font>");
            $("title").text(baseInfo.totalTime);
            //if (totalTime >= parseInt($("#iptTime").val())) stopStudy();
        }
		else setTimeout(getTotalHours,5000);
    },function error(e){
		setTimeout(getTotalHours,5000);
	});
}
//finish
function updateStudyRecordEnd(){
    getStudyTimes = Math.floor(preProject.courseDuration * 60);
    console.log("get studyTime;" + getStudyTimes);
    var appKey = baseInfo.userInfo.userId;
    var requestParam = {
        courseId: project.id,
        userId: baseInfo.userInfo.userId,
        studyTimes: getStudyTimes
    };
	var courseType = typeof(project.courseType) == "undefined"?"1":"0";
    var timestamp = new Date().getTime();
    var nonce = guid();
    var signatureType = "MD5";
    var authType = "ACCESSKEY";
    var signatureVersion = "1";
    var requestUri = "/hours/updateStudyRecordEnd";
    var signature=sign("3F1AE863EF8BC2B9251A5526FE1C26BC","B0548940A4131F7D0C82F6B45AE848E0",requestUri,timestamp,nonce,requestParam);
	var receive = {
		courseId: project.id,
		courseType: courseType,
		orgCode:baseInfo.userInfo.orgCode,
		orgId:baseInfo.userInfo.orgId,
		orgName:baseInfo.userInfo.orgName,
		playFlag:baseInfo.playFlag,
		publishMonth:baseInfo.publishMonth,
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
		url : requestUri, 　  
　　　　type : 'post',　　　　　　　　
　　　　data : JSON.stringify(postData),
　　　　contentType:'application/json;charset=utf-8',              
　　}).then(function success(data) {
		if(typeof(data) == "undefined" || data.success == false){
			updateendFlagCount++;
			if(updateendFlagCount < updateendMaxCount){
				setTimeout(updateStudyRecordEnd,3000);
			}
			else {
				updateendFlagCount = 0;
			}				
		}
    },function error(e) {
		setTimeout(updateStudyRecordEnd,3000);
	});
}
//finish
function recordProgress() {
    getStudyTimes = Math.ceil(currentPlayTime);
    var requestParam = {
        courseId: project.id,
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
		courseId: project.id,
		courseType: "1",
		orgCode:baseInfo.userInfo.orgCode,
		orgId:baseInfo.userInfo.orgId,
		orgName:baseInfo.userInfo.orgName,
		playFlag:baseInfo.playFlag,
		publishMonth:baseInfo.publishMonth,
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
		url : requestUri, 　  
　　　　type : 'post',　　　　　　　　
　　　　data : JSON.stringify(postData),
　　　　contentType:'application/json;charset=utf-8',              
　　}).then(function(data) {
        if (data.success == false) {
            returnTime = true;
        }
        project.studyTimes = getStudyTimes;
        console.log("learntime:" + project.studyTimes);
    });

}
//finish
function haveRead(){
	var i = [project.id]
      , postData = {
        userId: baseInfo.userInfo.userId,
        publishMonth: Number(baseInfo.publishMonth),
        courseIds: i
    };
	var requestUri = "/userHours/haveRead";
	$.ajax({
		url : requestUri, 　  
　　　　type : 'post',　　　　　　　　
　　　　data : JSON.stringify(postData),
　　　　contentType:'application/json;charset=utf-8',              
　　}).then(function(dataSource){});

}
//finish
function coursePlay(){
	var courseType = typeof(project.courseType) == "undefined"?"1":"0";
	var postData = {
        userId: baseInfo.userInfo.userId,
        courseId: project.id,
        orgId: baseInfo.userInfo.orgId,
        orgCode: baseInfo.userInfo.orgCode,
        orgName: baseInfo.userInfo.orgName,
        courseType: courseType,
        playFlag: baseInfo.playFlag
    };
	var requestUri = "/hours/coursePlay";
	$.ajax({
		url : requestUri, 　  
　　　　type : 'post',　　　　　　　　
　　　　data : JSON.stringify(postData),
　　　　contentType:'application/json;charset=utf-8',              
　　}).then(function(dataSource){});
}

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

}
function validateSet(){
	$("#lblresult").html("正在验证基础数据。。。");
/* 	if($("#iptTime").val().trim() == "") {
		$("#lblresult").html("请输入结束学时。");
		return false;
	}
	else{
		var reg=/^[1-9]\d*$|^0$/;
		if(reg.test($("#iptTime").val().trim()) == false){
			$("#lblresult").html("结束学时请输入数字，注意数字 0 不要在第一位");
			return false;
		}
	} */
/* 	if(totalTime == -1){
		$("#lblresult").html("累计学时没有获取成功，请刷新页面重试。");
		return false;
	}
	else{
		if(parseInt($("#iptTime").val().trim()) - totalTime <=0){
			$("#lblresult").html("结束学时请 大于 累计学时。");
			return false;
		}
	} */
	return true;
}

function init_disable(){
	$("#Start").attr("disabled", "disabled");
	$("#courseSelect").attr("disabled", "disabled");
	$("#publishMonth").attr("disabled", "disabled");
	$("#End").removeAttr("disabled");

}
function init_enable(){
	$("#End").attr("disabled", "disabled");
	$("#Start").removeAttr("disabled");
	$("#courseSelect").removeAttr("disabled");
	$("#publishMonth").removeAttr("disabled");
}
function init_compontent() {
	$(".header").append("<div id='messageContent' style='width:1050px;padding:10px 10px;background-color:#fff;margin: 0 auto;line-height:30px;height:200px;'></div>");
    var lblText = "请选择开始课程：";
	var courseSelect = "<select id='courseSelect' style='width:500px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
	var publishMonth = "<select id='publishMonth' style='width:80px;height:30px;' ></select>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnStart = "<input type='button' value='开始' id='Start' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
    var btnEnd = "<input type='button' value='暂停' id='End' disabled='disabled' style='height:30px;width:60px;border: 1px solid ;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnopenwin = "<input type='button' value='五开' id='btnopenwin' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	var btnopenexam = "<input type='button' value='考试' id='btnopenexam' style='height:30px;width:60px;border: 1px solid;border-radius: 3px;background: #fff;'>&nbsp;&nbsp;&nbsp;&nbsp;";
	$("#messageContent").append("<div>" + lblText + courseSelect + publishMonth + btnStart + btnEnd + btnopenwin + btnopenexam + "</div>");
    $("#Start").bind("click",
		function() {
			$("#messageContent").css("height","140px");
			init_disable();
			if(validateSet() == false){
				init_enable();
				return;
			}
			$("#lblresult").html("");
			setTimeout(openExam,1000);
			startStudy();			
    });
    $("#End").bind("click",
		function() {
			init_enable();
			stopStudy();
    });
	$("#btnopenwin").bind("click",
		function() {
			openWin();
    });
	$("#btnopenexam").bind("click",
		function() {
			openExam();
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
   
	//选择框变化
	//
	
    $("#courseSelect").change(function() {
        currentCourseNum = $("#courseSelect option:selected").val();
        $("#lblCurrentCourseTitle").html("<font color='red'>" + $("#courseSelect option:selected").text() + "</font>");
    });
	
	$("#lblresult").html("正在初始化，请稍后。。。");
    getTotalHours();
}

//finish
function init_alreadystudylist(){
	var postData = {
		userId: baseInfo.userInfo.userId,
		publishMonth: Number(baseInfo.publishMonth)
	};
	$.ajax({
		url : 'http://dkt.dtdjzx.gov.cn/hours/getStudyRecordFinish?pagenum=0&pagesize=' + baseInfo.pageSize, 　  
　　	type : 'post',　　　　　　　　
　　	data : JSON.stringify(postData),
　　	contentType:'application/json;charset=utf-8',              
	}).then(function(dataSource) {
		if (typeof(dataSource) != "undefined") {
			if(dataSource.data == null){
				init_alllist();
				return;
			}			
			var temptotaltime = 0;
            for(var i=0;i<dataSource.data.length;i++){
				var tempCourse = {};
				tempCourse.courseHour = dataSource.data[i].courseHours;
				tempCourse.courseId = dataSource.data[i].courseId;
				alreayStudyList.push(tempCourse);
				temptotaltime += dataSource.data[i].courseHours;
			}
			init_alllist();
        } else {
			setTimeout(init_alreadystudylist,3000);
        }	
    },function error(e) {
		setTimeout(init_alreadystudylist,5000);
	});
}
//finishs
function init_alllist(){
	try{
		$.get("https://blackgullon.github.io/djzx_dkt_courselist.txt",function(dataSource){ 
			allCourseList = eval(dataSource);
			if(allCourseList.length == 0){
				$("#lblresult").html("初始化学习列表错误，自动重试中。。。");
				setTimeout(init_alllist,3000);
				return;
			}
			init_publishMonth();
			init_studylist();		
		});
	}
	catch(error){
		$("#lblresult").html("初始化学习列表错误，自动重试中。。。");
		setTimeout(init_alllist,1500);
	}

}
//finish
function init_studylist(){
	for(var i =0;i<allCourseList.length;i++){
		if(allCourseList[i].publishMonth == baseInfo.publishMonth) {
			preCourseList = allCourseList[i].data;
			break;
		}
	}
	for (var i = 0; i < preCourseList.length; i++) {
		var isAdd = false;
        for (var j = 0; j < alreayStudyList.length; j++) {
            if (preCourseList[i].id == alreayStudyList[j].courseId) {
				alreayStudyList.splice(j,1);
                isAdd = true;
                break;
            }
        }
        if (isAdd == false){
			courseList.push(preCourseList[i]);
		} 
    }
	init_courseSelect();
	$("#lblresult").html("数据初始化完毕，可以进行学习了。");
}
//finish
function init_publishMonth(){
	var selectOptions = "";
	for (var i = 0; i < allCourseList.length; i++) {
		if(baseInfo.publishMonth == allCourseList[i].publishMonth){
			selectOptions += "<option value='" + allCourseList[i].publishMonth + "'>" + allCourseList[i].publishMonth + "</option>";
			continue;
		}
        selectOptions += "<option value='" + allCourseList[i].publishMonth + "'>" + allCourseList[i].publishMonth + "</option>";
    }
    $("#publishMonth").html(selectOptions);
}
//finish
function init_courseSelect(){
	var selectOptions = "";
	for (var i = 0; i < courseList.length; i++) {
        selectOptions += "<option value='" + i + "'>" + courseList[i].courseName + "（时长：" + courseList[i].courseDuration + "分钟|学时：" + courseList[i].courseHours + "）</option>";
    }
    $("#courseSelect").html(selectOptions);
}

function nextable(){
	if(currentCourseNum >= courseList.length){
		$("#lblresult").html("所有课程已全部学完。");
		return false;
	}
/* 	if (totalTime >= parseInt($("#iptTime").val())){
		$("#lblresult").html("已学够结束学时，学习停止。");
		return false;
	} */
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
//finish
function addTimeCount() {
	$("#lblCurrentCourseTitle").html("<font color='red'>" + courseList[currentCourseNum].courseName + "（时长：" + courseList[currentCourseNum].courseDuration + "分钟|学时：" + courseList[currentCourseNum].courseHours + "）</font>");
/*  $.postJSON("/bintang/addTimeCount", currentCourse, ).then(function success(data) {
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
	}); */
	haveRead();
	coursePlay();
	startStudyProcess();
}
//finish 
function startStudyProcess() {
	if(nextable() == false) {
		stopStudy();
		return;
	}
    studyCount++;
    currentPlayTime += speedTimes;
    studyPercent = parseInt(currentPlayTime / currentTotalTime * 100) == 100 ? 100 : parseInt(currentPlayTime / currentTotalTime * 100);
    $("#currentPlayTime").html("<font color='red'>" + studyPercent + "%</font>");
    var recordProgressNum = getSetLearnTime2();
	if (currentPlayTime % recordProgressNum == 0) {		
        recordProgress();
	}
    if (currentPlayTime > currentTotalTime) {
		studyCount = 0;
        currentPlayTime = 0;
		preProject = project;
        updateStudyRecordEnd();
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
        return 3 * 60;
    } else if (vLength > 1800) {
        return 3 * 60;
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
function openExam(){
	var message = {};
	message.url = 'http://dkt.dtdjzx.gov.cn/static/moni/moni.html?' + baseInfo.publishMonth;
	var openE = "<a id='openExam' href='"+message.url+"' target='_blank'>123</a>";
	$("body").append(openE);
	document.getElementById("openExam").click();
}
function openWin(){
	var link1 = "<a id='link1' href='http://dkt.dtdjzx.gov.cn/#/home' target='_blank'>link1</a>";
	var link2 = "<a id='link2' href='http://dkt.dtdjzx.gov.cn/#/home' target='_blank'>link2</a>";
	var link3 = "<a id='link3' href='http://dkt.dtdjzx.gov.cn/#/home' target='_blank'>link3</a>";
	var link4 = "<a id='link4' href='http://dkt.dtdjzx.gov.cn/#/home' target='_blank'>link4</a>";
	var link5 = "<a id='link5' href='http://dkt.dtdjzx.gov.cn/#/home' target='_blank'>link5</a>";
	$("body").append(link1);
	$("body").append(link2);
	$("body").append(link3);
	$("body").append(link4);
	$("body").append(link5);
	document.getElementById("link1").click();
	document.getElementById("link2").click();
	document.getElementById("link3").click();
	document.getElementById("link4").click();
	document.getElementById("link5").click();	
}

//*******************************************************************************************
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /*
     * Local polyfil of Object.create
     */
    var create = Object.create || (function () {
        function F() {}

        return function (obj) {
            var subtype;

            F.prototype = obj;

            subtype = new F();

            F.prototype = null;

            return subtype;
        };
    }())

    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {


        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                var subtype = create(this);

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Create default initializer
                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
                    subtype.init = function () {
                        subtype.$super.init.apply(this, arguments);
                    };
                }

                // Initializer's prototype is the subtype object
                subtype.init.prototype = subtype;

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.init.prototype.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];

            var r = function (m_w) {
                var m_w = m_w;
                var m_z = 0x3ade68b1;
                var mask = 0xffffffff;

                return function () {
                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
                    var result = ((m_z << 0x10) + m_w) & mask;
                    result /= 0x100000000;
                    result += 0.5;
                    return result * (Math.random() > 0.5 ? 1 : -1);
                }
            };

            for (var i = 0, rcache; i < nBytes; i += 4) {
                var _r = r((rcache || Math.random()) * 0x100000000);

                rcache = _r() * 0x3ade67b7;
                words.push((_r() * 0x100000000) | 0);
            }

            return new WordArray.init(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return new WordArray.init(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return new WordArray.init(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     *
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = new WordArray.init();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         *
         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The processed data.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (doFlush) {
            var processedWords;
            
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return new WordArray.init(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            var hash = this._doFinalize();

            return hash;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return new hasher.init(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Constants table
    var T = [];

    // Compute constants
    (function () {
        for (var i = 0; i < 64; i++) {
            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
        }
    }());

    /**
     * MD5 hash algorithm.
     */
    var MD5 = C_algo.MD5 = Hasher.extend({
        _doReset: function () {
            this._hash = new WordArray.init([
                0x67452301, 0xefcdab89,
                0x98badcfe, 0x10325476
            ]);
        },

        _doProcessBlock: function (M, offset) {
            // Swap endian
            for (var i = 0; i < 16; i++) {
                // Shortcuts
                var offset_i = offset + i;
                var M_offset_i = M[offset_i];

                M[offset_i] = (
                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
                );
            }

            // Shortcuts
            var H = this._hash.words;

            var M_offset_0  = M[offset + 0];
            var M_offset_1  = M[offset + 1];
            var M_offset_2  = M[offset + 2];
            var M_offset_3  = M[offset + 3];
            var M_offset_4  = M[offset + 4];
            var M_offset_5  = M[offset + 5];
            var M_offset_6  = M[offset + 6];
            var M_offset_7  = M[offset + 7];
            var M_offset_8  = M[offset + 8];
            var M_offset_9  = M[offset + 9];
            var M_offset_10 = M[offset + 10];
            var M_offset_11 = M[offset + 11];
            var M_offset_12 = M[offset + 12];
            var M_offset_13 = M[offset + 13];
            var M_offset_14 = M[offset + 14];
            var M_offset_15 = M[offset + 15];

            // Working varialbes
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];

            // Computation
            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
            d = II(d, a, b, c, M_offset_7,  10, T[49]);
            c = II(c, d, a, b, M_offset_14, 15, T[50]);
            b = II(b, c, d, a, M_offset_5,  21, T[51]);
            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
            d = II(d, a, b, c, M_offset_3,  10, T[53]);
            c = II(c, d, a, b, M_offset_10, 15, T[54]);
            b = II(b, c, d, a, M_offset_1,  21, T[55]);
            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
            d = II(d, a, b, c, M_offset_15, 10, T[57]);
            c = II(c, d, a, b, M_offset_6,  15, T[58]);
            b = II(b, c, d, a, M_offset_13, 21, T[59]);
            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
            d = II(d, a, b, c, M_offset_11, 10, T[61]);
            c = II(c, d, a, b, M_offset_2,  15, T[62]);
            b = II(b, c, d, a, M_offset_9,  21, T[63]);

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
            var nBitsTotalL = nBitsTotal;
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
            );
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
            );

            data.sigBytes = (dataWords.length + 1) * 4;

            // Hash final blocks
            this._process();

            // Shortcuts
            var hash = this._hash;
            var H = hash.words;

            // Swap endian
            for (var i = 0; i < 4; i++) {
                // Shortcut
                var H_i = H[i];

                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
            }

            // Return final computed hash
            return hash;
        },

        clone: function () {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        }
    });

    function FF(a, b, c, d, x, s, t) {
        var n = a + ((b & c) | (~b & d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function GG(a, b, c, d, x, s, t) {
        var n = a + ((b & d) | (c & ~d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function HH(a, b, c, d, x, s, t) {
        var n = a + (b ^ c ^ d) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    function II(a, b, c, d, x, s, t) {
        var n = a + (c ^ (b | ~d)) + x + t;
        return ((n << s) | (n >>> (32 - s))) + b;
    }

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.MD5('message');
     *     var hash = CryptoJS.MD5(wordArray);
     */
    C.MD5 = Hasher._createHelper(MD5);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacMD5(message, key);
     */
    C.HmacMD5 = Hasher._createHmacHelper(MD5);
}(Math));

//**********************************************************************************************
var sign = function(ak, sk, url, timestamp, nonce, requestParam) {
  console.clear()
  requestParam = sortMap(requestParam)
  console.info('sortMap')
  console.info(requestParam)
  var requestParamStr = requestParam2Str(requestParam)
  console.info('requestParamStr')
  console.info(requestParamStr)
  var encodeParam = md5Encrypt(requestParamStr)
  console.info('encodeParam')
  console.info(encodeParam)
  var encodeArray = [url, ak, sk, timestamp, nonce, encodeParam]
  console.info('encodeArray')
  console.info(encodeArray)
  var sortedArray = sortArray(encodeArray)
  console.info('sortedArray')
  console.info(sortedArray)
  var encodeStr = getSignatureText(sortedArray)
  console.info('encodeStr')
  console.info(encodeStr)
  var reslute = encrypt(encodeStr)
  console.info('reslute')
  console.info(reslute)
  return reslute
}

function getSignatureText(encodeArray) {
  // 获取签名参数
  var paramStr = encodeArray.join(',').toLowerCase()
  // 过滤无效字符
  // params = escapeSignatureValue(params);
  // 转换unicode
  console.info('paramStr')
  console.info(paramStr)
  return decToHex(paramStr)
}

function encrypt(encodeStr) {
  return md5Encrypt(md5Encrypt(encodeStr))
}

function sortMap(requestParam) {
  if (requestParam === undefined) {
    return undefined
  }
  var keys = []
  for (var key in requestParam) {
    keys.push(key)
  }
  keys.sort(function(a, b) {
    if (/^\d/.test(a) ^ /^\D/.test(b)) return a > b ? 1 : (a === b ? 0 : -1)
    return a > b ? -1 : (a === b ? 0 : 1)
  })

  var result = {}
  for (var index in keys) {
    var keyValue = keys[index]
    var value = requestParam[keyValue]
    if (value === undefined) {
      value = ''
    }
    result[keyValue] = value
  }
  console.info(result)
  return result
}

function sortArray(array) {
  array.sort()
  return array
}

function requestParam2Str(requestParam) {
  if (requestParam === undefined) {
    return ''
  }
  var str = ''
  for (var key in requestParam) {
    str = str + key + '=' + requestParam[key] + '&'
  }
  return str.substr(0, str.length - 1)
}

function md5Encrypt(encryptString) {
  return CryptoJS.MD5(encryptString).toString(CryptoJS.enc.Hex)
}

// js Unicode编码转换
function decToHex(str) {
  var res = []
  for (var i = 0; i < str.length; i++) {
    res[i] = ('00' + str.charCodeAt(i).toString(16)).slice(-4)
  }
  return '\\u' + res.join('\\u')
}

function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}


