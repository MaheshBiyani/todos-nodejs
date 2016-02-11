var express = require('express');
var bodyParser = require('body-parser')
var _ = require('underscore');
var db = require('./db.js');

var idIncrement = 1;
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('To do API root');
})

/*app.get('/todos' , function ( req, resp) {
	resp.json(todos);
});
*/
app.get('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id);

	db.todo.findById(todoId).then(function (todo){
		console.log('added');
		console.log(todo);
		if (!todo){
			return res.status(404).send();	
		}
		res.json(todo);
	}, function (error){
		resp.status(500).json(error);
	})

	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	todos.forEach(function (todo){
		
		if (todoId===todo.id){
	
			matchedTodo=todo;
		}
	});
	if (matchedTodo) {
		res.json(matchedTodo);

	} else {
		res.status(404).send();
	}*/

});


/*app.get('/todos', function (req , res) {

	var queryParams = req.query;
	var filteredTodos = todos;
	
	if (queryParams.hasOwnProperty('completed') && queryParams.completed==='true'){
		filteredTodos=_.where(filteredTodos ,{completed : true});
		console.log(filteredTodos);	
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed==='false') {
		
		filteredTodos = _.where (filteredTodos ,{completed : false});
		console.log(filteredTodos);

	}
	res.json(filteredTodos);
})
*/
app.get('/todos', function(req, res) {

	var queryParams = req.query;
	var where = {} ;
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
		return res.status(404).send();
	});

})


app.post('/todos', function(req, resp) { 
	var body = _.pick(req.body, 'description', 'completed');
	db.todo.create(body).then(function(todo){
			console.log('cretaed todo');
			resp.json(todo.toJSON());
	}).catch(function (err){
		resp.status(400).json(err);
	})
})

app.listen(PORT, function() {
	console.log("Express listen at" + PORT);
})

app.delete('/todos/:id', function(req, resp) {
	var todoId = parseInt(req.params.id);

	db.todo.destroy({
		where :{
			id :todoId
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
	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		resp.send(matchedTodo);
	} else {
		resp.status(404).send();
	}*/

})

app.put('/todos/:id', function(req, resp) {
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

	db.todo.findById(todoId).then(function(todo){
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

db.sequelize.sync().then