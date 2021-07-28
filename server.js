import express from "express";
import multer from "multer";
import crypto from "crypto"
import path from "path";
import DecompressZip from 'decompress-zip'
import { readFile, readFileSync, unlink } from "fs"
import XML2JS from 'xml2js'

function generateUniqueCode () {
  return crypto.randomBytes(4).toString('hex')
}

function getExtension (file) {
  return path.extname(file)
}

const application = express()
const storageConfig = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, './scorm-zips')
  },
  filename: (req, file, cb) => {
    cb(null, `scorm_${generateUniqueCode()}${getExtension(file.originalname)}`)
  }
})

const fileParser = multer({
  storage: storageConfig 
})

application.use('/scorms', express.static('./scorm-repo'))
application.use('/static', express.static('./static-assets'))

application.post('/upload-scorm', fileParser.single('scorm_file'), (req, res) => {
  const scormPackage = req.file.path
  const destination = 'scorm-repo\\' + path.basename(scormPackage, getExtension(scormPackage))
  const unzipper = new DecompressZip(scormPackage)

  unzipper.on('error', (error) => { res.status(500).json(error.message) })
  unzipper.extract({ path: destination })

  unzipper.on('extract', () => {
    unlink(scormPackage, (error) => {
      if (error) {
        res.status(500).json({
          message: 'Clean up interrupted'
        })
        return
      }
      readFile(destination + '\\imsmanifest.xml', (error, data) => {
        if (error) {
          res.json(500).json({message: error.message})
          return
        }
        const xml2js = new XML2JS.Parser()
        xml2js.parseString(data, (error, jsonEquivalent) => {
          const indexPath = jsonEquivalent.manifest.resources[0].resource[0].$.href
          let launchURL = req.protocol + '://' + req.hostname + (req.hostname === 'localhost' ? ':5000/' : '') + destination + '\\' + indexPath
          launchURL = launchURL.replace(/\\/g, '/')
          res.json({
            launchURL
          })
        })
      })
      // res.status(200).json(req.file)
    })
  })

})

function _eval (body, ...args) {
  const Fn = Function
  return new Fn(args.toString(), 'return ' + body)
}

application.get('/player', (req, res) => {
  const indexPath = req.query.path
  let html = readFileSync('player/index.html', { encoding: 'utf-8' })
  html = _eval(html, 'indexPath')(indexPath)
  res.send(html)
})

application.listen(process.env.PORT || s5000, () => {
  console.log(`server: http://localhost:5000/
service running...`);
})
