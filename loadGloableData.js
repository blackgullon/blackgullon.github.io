function setData(){
	if(sessionStorage.getItem("userInfo") == null) {
		setTimeout(setData,1000);
	}
	var baseInfo = {};
	baseInfo.userInfo = JSON.parse(sessionStorage.getItem("userInfo")).data;
	baseInfo.playFlag = appToken.token + "undefined";
	
	var div=document.createElement("div");
	div.id = "baseInfo";
	div.style.display = "none";
	div.appendChild(document.createTextNode(JSON.stringify(baseInfo)));  
	document.body.appendChild(div);
}
setData();
