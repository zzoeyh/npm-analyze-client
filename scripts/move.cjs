const fs = require('node:fs')
const path = require('node:path')

function copyDir(dirPath, destPath) {
  try {
    const dir = path.relative(path.resolve(__dirname, '../'), destPath)
    fs.mkdirSync(dir)
  } catch (err) {
  }
  const result = fs.readdirSync(dirPath)
  for (let file of result) {
    const pathName = path.resolve(dirPath, file)
    if (fs.lstatSync(pathName).isFile()) {
      fs.copyFile(pathName, path.resolve(destPath, file), 2, () => {
        console.log(pathName, '复制至', destPath)
      })
    } else {
      copyDir(pathName, path.resolve(destPath, file))
    }
  }
}

const distPath = path.resolve(__dirname, '../dist')
const destPath = path.resolve(__dirname, '../../', 'npa-cli', 'public');

copyDir(distPath, destPath)
