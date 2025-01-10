var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
require('./models/phone-model');
require('./models/user-model');
require('./models/bill-model');
require('./models/billdetail-model');
require('./models/brand-model');
require('./models/comment-model');
require('./models/image-model');
require('./models/rating-model');
require('./models/type-model');
require('./models/voucher-model');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var billsRouter = require('./routes/bills');
var billdetailsRouter = require('./routes/billdetails');
var brandsRouter = require('./routes/brands');
var commentsRouter = require('./routes/comments');
var imagesRouter = require('./routes/images');
var ratingsRouter = require('./routes/ratings');
var typesRouter = require('./routes/types');
var vouchersRouter = require('./routes/vouchers');
var phonesRouter = require('./routes/phones');

var app = express();

mongoose.connect('mongodb+srv://nguyenquocanh289:KuqqY6sw90O041sW@cluster0.bbfum.mongodb.net/project3')
  .then(() => console.log("Database connected"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/home', indexRouter);
app.use('/users', usersRouter);
app.use('/bills', billsRouter); 
app.use('/billdetails', billdetailsRouter); 
app.use('/brands', brandsRouter); 
app.use('/comments', commentsRouter); 
app.use('/images', imagesRouter); 
app.use('/ratings', ratingsRouter); 
app.use('/types', typesRouter); 
app.use('/vouchers', vouchersRouter); 
app.use('/phones', phonesRouter); 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
