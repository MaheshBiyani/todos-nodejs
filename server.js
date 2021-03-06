var express = require('express');
var bodyParser = require('body-parser')
var _ = require('underscore');
var bcrypt = require('bcryptjs');

var db = require('./db.js');
var middleware = require('./middleware')(db);
var idIncrement = 1;
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];


app.use(bodyParser.json());

app.get('/',middleware.requireAuthentication, function(req, res) {
	res.send('To do API root');
})


app.get('/todos/:id', middleware.requireAuthentication,function(req, res) {

	var todoId = parseInt(req.params.id);

	db.todo.findOne({
		where :{
			id : todoId,
			userId : req.user.get('id')
		}
	}).then(function (todo){
		console.log('added');
	
		if (!todo){
			return res.status(404).send();	
		}
		res.json(todo);
	}, function (error){
		resp.status(500).json(error);
	})

	
});


app.get('/todos',middleware.requireAuthentication, function(req, res) {

	var queryParams = req.query;
	var where = {
		userId : req.user.get('id')
	} ;
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
			where.completed=true;

	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
			where.completed=false;
	}
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
			where.description ={
				$like :'%' + queryParams.q +'%' 
			}
	}
	console.log(where);
	db.todo.findAll({where:where}). then(function (todo){
		 return res.json(todo);
	}, function (e){
		console.log(e);
		return res.status(404).send();
	});

})


app.post('/todos',middleware.requireAuthentication, function(req, resp) { 
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body).then(function(todo){
			req.user.addTodo(todo).then(function(){
				return todo.reload();
			}).then (function (){
				resp.json(todo);
			})
	}).catch(function (err){
		resp.status(400).json(err);
	})
})

app.listen(PORT, function() {
	console.log("Express listen at" + PORT);
})

app.delete('/todos/:id',middleware.requireAuthentication, function(req, resp) {
	var todoId = parseInt(req.params.id);

	db.todo.destroy({
		where :{
			id :todoId ,
			userId : req.user.get('id')
		}
	}). then (function (number){
		if (number===0){
			resp.status(404).json({
				error : 'no to do with id'
			})
		}
		else {
			console.log("Deleted number of rows are "+ number);	
			resp.send(200).send();			
		}
		
	}, function (e){
		resp.send(404);
	});
	
})

app.put('/todos/:id',middleware.requireAuthentication, function(req, resp) {
	console.log('put method');
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	var todoId = parseInt(req.params.id);
	
	
	if (body.hasOwnProperty('completed') ) {
		attributes.completed = body.completed;
	} 
	if (body.hasOwnProperty('description') ) {
		attributes.description = body.description;
	} 

	db.todo.findOne({
		where :{
			id  : todoId ,
			userId : req.user.get('id')
		}
	}).then(function(todo){
		if (todo) {
			todo.update(attributes);
			return resp.json(todo);
		} else{
			return resp.status(404).send();
		}
	}, function(e){
		resp.status(500).send();
	});
	
	
	
})

app.post('/user' , function (req, res) {
	
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user){
			console.log('cretaed user');
			res.send(user.toPublicJson());
	}).catch(function (err){
		console.log(err);
		res.status(400).json(err);
	})
})




app.post('/user/login', function (req, res){
	console.log("user login block");
	var body = _.pick( req.body, 'email', 'password');
	var userInstance ;
	db.user.authenticate(body).then(function (user){
		var token = user.generateToken('authenticattion');
		userInstance =user;
		return db.token.create({
			token : token
		});
	}).then(function(tokenInstance){
		res.header('Auth', tokenInstance.token).json(userInstance.toPublicJson());
	}).catch(function (error){
		console.log(error);
		res.status(404).send();
	});
});

app.delete('/users/login',middleware.requireAuthentication, function (req, res){
	req.token.destroy().then(function(){
		res.status(200).send();
	}).catch(function (error){
		res.status(404).send();
	});

});



















db.sequelize.sync({force: true}).then