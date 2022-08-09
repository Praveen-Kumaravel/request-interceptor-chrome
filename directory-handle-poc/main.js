const pathToFile = 'frontend/public/robots.txt'

const getFileHandleForPath = async (dirHandle, pathToFile) => {
    const traversal = pathToFile.split('/')

    let currentHandle
    for (let i=0; i< traversal.length; i++) {
        const handleToUse = currentHandle || dirHandle
        if (i < traversal.length - 1) {
            currentHandle = await handleToUse.getDirectoryHandle(traversal[i])
        } else {
            const fileHandle = await handleToUse.getFileHandle(traversal[i])
            console.log({fileHandle})
            return fileHandle
        }
    }
}


const butDir = document.getElementById('butDirectory');
butDir.addEventListener('click', async () => {
  const dirHandle = await window.showDirectoryPicker();
  const fileHandle = await getFileHandleForPath(dirHandle, pathToFile)
  const file = await fileHandle.getFile();
  const contents = await file.text();
  console.log({contents})
});