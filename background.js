
// Helper function.
// Used in chrome.runtime.onInstalled listener.
function readFile(path) {
  return new Promise((resolve, reject) => {
    chrome.runtime.getPackageDirectoryEntry(function(root) {
      root.getFile(path, {}, function(fileEntry) {
        fileEntry.file(function(file) {
          let reader = new FileReader()
          reader.onloadend = function(e) {
            const {result} = reader
            resolve(result)
          };
          reader.readAsText(file)
        })
      })
    })
  })
}

/*
* Key: Space separated keys with method name in upper case first, followed by relative URL of endpoint.
* Value: File path relative to extension root dir to send as response for source endpoint.
* All files are parsed to json in redirected response and for that reason, only json file's paths are to be included as values.
*/
const REDIRECT_CONFIG = {
  'GET /crm/phone/numbers': 'sample.json'
}

/*
* Only those that match pattern in manifest.json/permissions will be taken into account.
*/
let HOSTNAME = 'https://demomicrm-org.myfreshworks.dev'


/*
* Here goes implementation.
*/
let redirectContentsMap


const _urls = []
const formattedConfigs = []

Object.keys(REDIRECT_CONFIG).forEach(urlWithMethod => {
  const [method, url] = urlWithMethod.split(/\s+/)

  _urls.push(`${HOSTNAME}${url}*`)
  formattedConfigs.push({
    method, url, targetFilePath: REDIRECT_CONFIG[urlWithMethod]
  })
})


const refreshConfigs = async () => {
  const redirectContents = await Promise.all(Object.values(REDIRECT_CONFIG).map(async filePath => {
    return {key: filePath, value: await readFile(filePath)}
  }))

  redirectContentsMap = redirectContents.reduce((mapped, curr) => {
    mapped[curr.key] = curr.value

    return mapped
  }, {})


  console.log("Interceptor registered with config: ", {REDIRECT_CONFIG, _urls, formattedConfigs, redirectContentsMap})

  //  To display in popup.
  chrome.storage.sync.set({ config: {REDIRECT_CONFIG, HOSTNAME} });
}

chrome.runtime.onInstalled.addListener(refreshConfigs);


chrome.webRequest.onBeforeRequest.addListener(function (details) {
  console.log("Interepted network request", {details})
  const {url, method} = details

  const targetConfig = formattedConfigs.find(({url: _url, method: _method}) => {
    return `${HOSTNAME}${_url}` === url && _method === method
  })
  if (targetConfig) {
    const {targetFilePath} = targetConfig
    
    console.log('Redirecting call to url: ', {from: details.url, method: details.method})
    
    const fileContents = redirectContentsMap[targetFilePath]
    
    return {redirectUrl: `data:application/json;base64,${window.btoa(fileContents)}`}
  }
},
  { urls: _urls },
  ['blocking'])