// 4 MOdule dedicated to reading and writing
const { writeJSON, readJSON } = require("fs-extra")
// 5 
const readDB = async (filePath) => {
  try { //8
    const fileJSON = await readJSON(filePath)//9
    return fileJSON
  } catch (error) {//10
    throw new Error(error)
  }
}
// 6
const writeDB = async (filePath, data) => {
  try {
    await writeJSON(filePath, data)
  } catch (error) {
    throw new Error(error)
  }
}
// 7
module.exports = {
  readDB,
  writeDB,
}
