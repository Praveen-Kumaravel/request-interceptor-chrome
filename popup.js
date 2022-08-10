/*
* Helper function to create DOM elements at ease.
*/
function createDomElement(tag, className, innerText, additionalAttributes) {
    const element = document.createElement(tag)
    if (className) {
        if (typeof className === 'string') element.classList.add(className)
        else if (Array.isArray(className)) element.classList.add(...className)
    }
    if (innerText) {
        element.innerHTML = innerText
    }

    if (additionalAttributes) {
        Object.keys(additionalAttributes).forEach(attr => {
            element.setAttribute(attr, additionalAttributes[attr])
        })
    }

    return element
}

async function updateHostnameHelpText() {
    const res = await fetch(chrome.runtime.getURL('manifest.json'))
    const manifest = await res.json()
    const {permissions} = manifest
    const hostnameRegex = /.*\..*/
    const hostPermissions = permissions.filter(permission => (permission.match(hostnameRegex)))
    const helpText = `Must match pattern: ${hostPermissions.join(', ')}`

    document.getElementById('hostnameHelp').innerHTML = helpText
}

/*
* Called on load of popup.
* Also use the same method to update UI on message from background.js.
*/
function refreshUI() {
    chrome.storage.sync.get("config", ({ config }) => {
        const redirectConfigList = document.getElementById('redirect-configs-list')
        if (!config || !config.HOSTNAME || !config.REDIRECT_CONFIG || Object.keys(config.REDIRECT_CONFIG).length < 1) {
            const errorMessageElement = createDomElement('h4', ['alert', 'alert-danger'], 'No rules found')
            redirectConfigList.appendChild(errorMessageElement)
            return
        }

        const {REDIRECT_CONFIG, HOSTNAME} = config
        console.log({REDIRECT_CONFIG, HOSTNAME})
        const hostnameInput = document.getElementById('hostname')
        hostnameInput.value = HOSTNAME
        const redirectItems = document.createDocumentFragment()

        const headerWrapper = createDomElement('div', 'row')

        const endpointTitleWrapper = createDomElement('div', 'col-7')
        endpointTitleWrapper.appendChild(createDomElement('h5', 'text-center', 'API'))
        const targetFileTitleWrapper = createDomElement('div', 'col-4')
        targetFileTitleWrapper.appendChild(createDomElement('h5', 'text-center', 'File path'))

        headerWrapper.appendChild(endpointTitleWrapper)
        headerWrapper.appendChild(targetFileTitleWrapper)

        redirectItems.appendChild(headerWrapper)

    
        Object.keys(REDIRECT_CONFIG).forEach(endpoint => {
            const listElementWrapper = createDomElement('div', 'row')
            const endpointInputWrapper = createDomElement('div', 'col-7')
            const endpointInput = createDomElement('input', 'form-control', null, {type: 'text', placeholder: 'API Endpoint', disabled: true, name: endpoint, value: endpoint})
            endpointInputWrapper.appendChild(endpointInput)
            const targetFileWrapper = createDomElement('div', 'col-4')
            const targetFileInput = createDomElement('input', 'form-control', null, {type: 'text', placeholder: 'API Endpoint', name: `file-${endpoint}`, value: REDIRECT_CONFIG[endpoint]})
            targetFileWrapper.appendChild(targetFileInput)
    
            listElementWrapper.appendChild(endpointInputWrapper)
            listElementWrapper.appendChild(targetFileWrapper)
    
            redirectItems.appendChild(listElementWrapper)
        })
        redirectConfigList.appendChild(redirectItems)
      });


    updateHostnameHelpText()
    
}

const messageContainer = document.getElementById('message-container')

let messageTimer
function showMessage(message, type = 'success') {
    messageContainer.classList.add('show', `alert-${type}`)
    console.log("Showing message toast", message)
    messageContainer.innerHTML = message
    messageTimer && clearTimeout(messageTimer)

    messageTimer = setTimeout(() => {
        messageContainer.innerHTML = ""
        messageContainer.classList.remove('show')
    }, 2000)
}

function updateConfigToBackground(newConfig) {
    chrome.runtime.sendMessage({type: 'CONFIG_UPDATE', payload: newConfig}, function (response) {
        const {type} = response
        if (type === 'CONFIG_UPDATE') {
            console.log("Update acknowledged by background", {response})
            showMessage('Successfully updated mock file')
        }
    })
}


function handleUpdate (event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const updatedConfig = {}
    updatedConfig.HOSTNAME = formData.get('hostname')
    const REDIRECT_CONFIG = {}
    for(const formKey of formData.keys()) {
        if (!formKey.includes('file-') && formKey !== 'hostname') {
            REDIRECT_CONFIG[formKey] = formData.get(`file-${formKey}`)
        }
    }

    updatedConfig.REDIRECT_CONFIG = REDIRECT_CONFIG

    updateConfigToBackground(updatedConfig)

}

document.getElementById('config-form').addEventListener('submit', handleUpdate)


function refreshMocks() {
    chrome.runtime.sendMessage({type: 'REFRESH_MOCKS'}, function (response) {
        const {type} = response

        if (type === 'REFRESH_MOCKS') {
            console.log('Refresh acknowledged by background', {response})
            showMessage('Successfully refreshed mock file contents')
        }
    })
}

document.getElementById('refreshMocksBtn').addEventListener('click', refreshMocks)

refreshUI()



