var express = require('express')
var fileRouter = express.Router()
var fileModel = require('../models/file')
var multer =  require('multer');
var bodyParser = require('body-parser');
let {checkAuth } = require('../middleware/index')
const AccountModel = require('../models/account');
fileRouter.use('/uploads', express.static('uploads'));

const nodemailer =  require('nodemailer');

// sơn test chuyển word sang pdf npm i docx-pdf
// phải cài cả npm i phantomjs-prebuilt 
var docxConverter = require('docx-pdf');


fileRouter.use(checkAuth)
var path = require('path');


var pathh = path.resolve(__dirname,'public');
fileRouter.use(express.static(pathh));
fileRouter.use(bodyParser.urlencoded({extended:false}));

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads')
    },
    filename:function(req,file,cb){
        var namefile = file.originalname
        cb(null,file.originalname)
    }
})
var upload = multer({storage:storage})

//cài đặt mail 
var transporter =  nodemailer.createTransport({ // set up mail server
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'nguyenminhsonhandsome@gmail.com', //Tài khoản gmail 
        pass: 'minhson123a' //Mật khẩu tài khoản 
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
    });


fileRouter.get('/',(req,res)=>{
    let email = req.cookies.email
    fileModel.find({studentemail:email},(err,data)=>{
        if(err){
            console.log(err)
        }
        else if(data.length>0){
            res.render('file/uploadFile',{data:data})
        }
        else{
            res.render('file/uploadFile',{data:{data}})
        }
    })
})

fileRouter.get('/dieukhoan',(req,res)=>{
    res.render('file/dieukhoan')
})

fileRouter.post('/upload',upload.single('filePath'),(req,res)=>{
    var x = 'uploads/'+req.file.originalname;  
    //lấy địa chỉ thử mục cần chuyển sang pdf
    var x1 = './public/' + x
    //cài đặt địa chỉ để lưu file pdf sau khi chuyển  
    var xx = x1.split('.');
    filePath1 = '.' + xx[1] + '.pdf'
    console.log(filePath1)
    //đổi tên để lưu vào db
    var filePath = x.split('.');
    filePath = filePath[0] + '.pdf'
    //đổi tên địa chỉ để lưu vào db
    var y = req.file.originalname;
    var yy = y.split('.');
    nameFile = yy[0] + '.pdf'
    console.log(nameFile)
    //tiến hành chuyển word sang pdf
    docxConverter(x1,filePath1,function(err,result){
        if(err){
          console.log(err);
        }
        console.log('result'+result);
      });
    //lưu thông tin file vào db
    let email = req.cookies.email
    var temp = new fileModel({
        filePath:filePath,
        nameFile : nameFile,
        studentemail: email
    })
  
    temp.save((err,data)=>{
        if(err){
            console.log(err)
        }
        //nội dung mail
        let email = req.cookies.email
        var content = 'Bạn vừa upload 1 bài báo lên hệ thống. Name: ' + x;
        var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: 'NQH-Test nodemailer',
            to: email,  // gửi vào mail của sơn để test, thay bằng mail học sinh bằng email = req.cookies.email
            subject: 'Bạn vừa đăng 1 bài báo',
            text: content //nội dungdung
        }
        // gửi mail cho học sinh vừa upload file
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
            } else {
                console.log('Message sent: ' +  info.response);
            }
        });
        let slug = req.cookies.slug
        console.log("slug là : ",slug)
        AccountModel.findOne({
            role: "MarketingCoordinator",
            slug: slug
        },function(err, result){
            console.log("DUPLICATE STATUS: ", result.email);
            //tiến hành gửi mail cho MarketingCoordinator 
            var content = email + 'vừa upload 1 bài báo lên hệ thống. Name: ' + x;
            var mainOptions2 = { // thiết lập đối tượng, nội dung gửi mail
            from: 'NQH-Test nodemailer',
            to: result.email,  // địa chỉ gửi mail
            subject: 'bài đăng mới',
            text: content //nội dungdung
        }
            // gửi mail cho MarketingCoordinator 
            transporter.sendMail(mainOptions2, function(err, info){
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' +  info.response);
                }
        });
        })
        res.redirect('/file')
    })
})

fileRouter.get('/download/:id',(req,res)=>{
    fileModel.find({_id:req.params.id},(err,data)=>{
         if(err){
             console.log(err)
         }
         else{
             var x= __dirname+'/public/'+data[0].filePath;
             res.download(x)
         }
    })
})

module.exports = fileRouter