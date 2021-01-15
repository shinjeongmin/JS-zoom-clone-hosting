const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express()
const server = require('https').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const options = {
    // 공개키와 cert가 있는 서버에서의 경로
    key : fs.readFileSync('/etc/letsencrypt/live/mylifeisgood.cf/privkey.pem', 'utf8'),
    cert : fs.readFileSync('/etc/letsencrypt/live/mylifeisgood.cf/fullchain.pem', 'utf8')
};

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req,res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) =>{
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', ()=>{
            socket.to(roomId).broadcast.emit('user-disconnected', 
            userId)
        })
    })
})

//server.listen(3000)

https.createServer(options, app).listen(3000);