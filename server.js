var express=require('express');
var app=express();
var server=require('http').Server(app);
var io=require('socket.io')(server);
var {v4:uuid }=require('uuid');

const {ExpressPeerServer}=require("peer");
const peerServer = ExpressPeerServer(server,{
    debug:true
});

app.set('view engine','ejs');
app.use(express.static('public'))
app.use("/peerjs", peerServer);

app.get('/',(req,res)=>{
    res.redirect(`/${uuid()}`)
});

app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room })
})
// socket io use now 
io.on('connection',socket=>{
    socket.on('join-room',(RoomId,userId)=>{
        //console.log(`user connected with room id is ${RoomId} and user id is ${userId}`);
        socket.join(RoomId);
        socket.to(RoomId).broadcast.emit('user-connected',userId);

        socket.on('disconnect',()=>{
            socket.to(RoomId).broadcast.emit('user-disconnect',userId);  
        })
    })
})

server.listen(3000,(req,res)=>{console.log('server is listening')})