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

/*app.get('/todos' , function ( req, resp) {
	resp.json(todos);
});
*/
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


app.get('/todos', function (req , res) {

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

app.put('/todos/:id' , function (req, resp) {
	console.log('put method');
	var body = _.pick(req.body , 'description','completed');
	var validAttributes = {};

	var todoId = parseInt(req.params.id);
	var matchedTodo=_.findWhere(todos,{ id : todoId});
	if (!matchedTodo) {
		return resp.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed) ){
		validAttributes.completed= body.completed;
	} else if (body.hasOwnProperty('completed')){
		
		return resp.status(404).send();
	}
	
	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length>0 ){
		validAttributes.description= body.description;
	} else if (body.hasOwnProperty('description')){
		console.log('description');
		return resp.status(404).send();
		
	}
		
	matchedTodo= _.extend(matchedTodo , validAttributes);
	resp.json(matchedTodo);
	//resp.send(matchedTodo);

})