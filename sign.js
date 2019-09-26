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

/* function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
} */

