const express = require("express")// 1st step
const path = require("path")
const { check, validationResult, sanitizeBody } = require("express-validator")//30
const fs = require("fs-extra")
const multer = require("multer")
const { join } = require("path") // 13
const { readDB, writeDB } = require("../../utilities") // 11

const booksJsonPath = path.join(__dirname, "books.json") // 14

const booksFolder = join(__dirname, "../../../public/img/books/") //12
const upload = multer({})
const booksRouter = express.Router()// 2 step

// 3
booksRouter.get("/", async (req, res, next) => {
  try { //15
    const data = await readDB(booksJsonPath) //20

    res.send({ numberOfItems: data.length, data }) //21
  } catch (error) { // 16
    console.log(error) //18
    const err = new Error("While reading books list a problem occurred!") //19
    next(err) //17
  }
})
//3
booksRouter.get("/:asin", async (req, res, next) => {//22
  try {//23
    const books = await readDB(booksJsonPath) //24
    const book = books.find((b) => b.asin === req.params.asin)//25
    if (book) {//26
      res.send(book)//27
    } else {//28
      const error = new Error()//29
      error.httpStatusCode = 404//29
      next(error)//29
    }
  } catch (error) {//23
    console.log(error)//23
    next("While reading books list a problem occurred!")//23
  }
})
//3
booksRouter.post(
  "/",
  [
    check("asin").exists().withMessage("You should specify the asin"),//31 
    check("title").exists().withMessage("Title is required"),//32
    check("category").exists().withMessage("Category is required"),
    check("img").exists().withMessage("Img is required"),
    sanitizeBody("price").toFloat(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)//33
    if (!errors.isEmpty()) {//34
      const error = new Error()//35
      error.httpStatusCode = 400//35
      error.message = errors//35
      next(error)//35
    }
    try {//36
      const books = await readDB(booksJsonPath)//38
      const asinCheck = books.find((x) => x.asin === req.body.asin) // 39 get a previous element with the same asin
      if (asinCheck) {//40
        //if there is one, just abort the operation
        const error = new Error()//42
        error.httpStatusCode = 400//42
        error.message = "ASIN should be unique"//42
        next(error)//42
      } else {//41
        books.push(req.body)//43
        await writeDB(booksJsonPath, books)//44
        res.status(201).send("Created")//45
      }
    } catch (error) {//37
      next(error)
    }
  }
)

booksRouter.put("/:asin", async (req, res, next) => {
  try {//46
    const books = await readDB(booksJsonPath)//47
    const book = books.find((b) => b.asin === req.params.asin)//48
    if (book) {//50
      const position = books.indexOf(book)//51
      const bookUpdated = { ...book, ...req.body } //52 In this way we can also implement the "patch" endpoint
      books[position] = bookUpdated//53
      await writeDB(booksJsonPath, books)//54
      res.status(200).send("Updated")//55
    } else {//49
      const error = new Error(`Book with asin ${req.params.asin} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {//46
    next(error)
  }
})

booksRouter.delete("/:asin", async (req, res, next) => {
  try {//56
    const books = await readDB(booksJsonPath)//57
    const book = books.find((b) => b.asin === req.params.asin)//57
    if (book) {//58
      await writeDB( // 60
        booksJsonPath,
        books.filter((x) => x.asin !== req.params.asin)
      )
      res.send("Deleted")
    } else {//59
      const error = new Error(`Book with asin ${req.params.asin} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {//56
    next(error)
  }
})

booksRouter.post("/upload", upload.single("avatar"), async (req, res, next) => {
  try {
    await fs.writeFile(
      join(booksFolder, req.file.originalname),
      req.file.buffer
    )
  } catch (error) {
    next(error)
  }
  res.send("OK")
})

module.exports = booksRouter
