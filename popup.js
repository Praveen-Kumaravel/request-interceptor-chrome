
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

        const endpointTitleWrapper = createDomElement('div', 'col-8')
        endpointTitleWrapper.appendChild(createDomElement('h5', 'text-center', 'API'))
        const targetFileTitleWrapper = createDomElement('div', 'col-4')
        targetFileTitleWrapper.appendChild(createDomElement('h5', 'text-center', 'File path'))

        headerWrapper.appendChild(endpointTitleWrapper)
        headerWrapper.appendChild(targetFileTitleWrapper)

        redirectItems.appendChild(headerWrapper)

    
        Object.keys(REDIRECT_CONFIG).forEach(endpoint => {
            const listElementWrapper = createDomElement('div', 'row')
            const endpointInputWrapper = createDomElement('div', 'col-8')
            const endpointInput = createDomElement('input', 'form-control', null, {type: 'text', placeholder: 'API Endpoint', value: endpoint})
            endpointInputWrapper.appendChild(endpointInput)
            const targetFileWrapper = createDomElement('div', 'col-4')
            const targetFileInput = createDomElement('input', 'form-control', null, {type: 'text', placeholder: 'API Endpoint', value: REDIRECT_CONFIG[endpoint]})
            targetFileWrapper.appendChild(targetFileInput)
    
            listElementWrapper.appendChild(endpointInputWrapper)
            listElementWrapper.appendChild(targetFileWrapper)
    
            redirectItems.appendChild(listElementWrapper)
        })
        redirectConfigList.appendChild(redirectItems)
      });
}

refreshUI()



