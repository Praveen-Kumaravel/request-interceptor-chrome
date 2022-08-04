
chrome.runtime.onInstalled.addListener(() => {
  console.log("Interceptor registered")
});

/*
* Key: Space separated keys with method name in upper case first, followed by relative URL of endpoint.
* Value: File path relative to extension root dir to send as response for source endpoint.
*/
const REDIRECT_CONFIG = {
  'GET /users': 'sample.json'
}

const HOSTNAME = 'http://localhost:3000'


/*
* Here goes implementation.
*/

const _urls = []
const formattedConfigs = []

Object.keys(REDIRECT_CONFIG).forEach(urlWithMethod => {
  const [method, url] = urlWithMethod.split(/\s+/)

  _urls.push(`${HOSTNAME}${url}`)
  formattedConfigs.push({
    method, url, targetFilePath: REDIRECT_CONFIG[urlWithMethod]
  })
})

console.log({_urls, formattedConfigs});

chrome.webRequest.onBeforeRequest.addListener(function (details) {
  console.log("Interepted network request", {details})
  const {url, method} = details

  const targetConfig = formattedConfigs.find(({url: _url, method: _method}) => {
    return `${HOSTNAME}${_url}` === url && _method === method
  })
  if (targetConfig) {
    const {targetFilePath} = targetConfig
    const toUrl = chrome.runtime.getURL(targetFilePath)
    console.log('Redirected call to url: ', {from: details.url, method: details.method, to: toUrl})
    return {redirectUrl: toUrl}
  }
},
  { urls: _urls },
  ['blocking'])