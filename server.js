'use strict'

const express = require('express')
const fileUpload = require('express-fileupload');

const app = express()

app.listen(8000, () => console.log('Server running on the port: 8000'))