var express = require('express');
var bodyParser=require('body-parser')
var _= require('underscore');
var idIncrement=1;
var app = express();
var PORT = process.env.PORT || 3000;
var todos=[];

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('To do API root');
})

app.get('/todos' , function ( req, resp) {
	resp.json(todos);
});

app.get('/todos/:id', function (req, res){

	var todoId = parseInt(req.params.id);
	var matchedTodo=_.findWhere(todos,{ id : todoId});

	/*todos.forEach(function (todo){
		
		if (todoId===todo.id){
	
			matchedTodo=todo;
		}
	});*/
	if (matchedTodo) {
		res.json(matchedTodo);

	}
	else {
		res.status(404).send();
	}
	
});


app.post('/todos', function (req, resp){
	var body = _.pick(req.body , 'description','completed');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length===0 ){

		resp.status(404).send();
	}
	body.description=body.description.trim();
	
	body.id=idIncrement++; 
	
	todos.push(body);

	resp.send(body);
})

app.listen(PORT, function(){
	console.log("Express listen at" +PORT);
})

app.delete('/todos/:id', function (req, resp){
	var todoId = parseInt(req.params.id);
	var matchedTodo=_.findWhere(todos,{ id : todoId});
	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		resp.send(matchedTodo);	
	} else {
		resp.status(404).send();
	}
	
})