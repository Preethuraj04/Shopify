const express = require('express')
const app = express()
const getRawBody = require('raw-body')
var mongo = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/shopifyDB";
var url = "mongodb+srv://shoper:cart@cluster0-gekc4.mongodb.net/test?retryWrites=true&w=majority";
//mongodb+srv://shoper:cart@cluster0-gekc4.mongodb.net/test?retryWrites=true&w=majority
app.set("view engine", "ejs");

var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');

app.use(bodyParser());
	
app.post('/webhooks/orders/create',function(req, res){
  
  const order=req.body;
  

  console.log('We got an order!')
  mongo.connect(url, function(err, db) {
  if (err) throw err;
  
  var myobj = { 
				name: order.customer.first_name+' '+order.customer.last_name,
				email: order.customer.email,
				address:order.customer.default_address.address2 + " " + order.customer.default_address.address1 + " " + order.customer.default_address.city + " " + order.customer.default_address.province + " " + order.customer.default_address.country + " " + order.customer.default_address.zip,
				item:order.line_items[0].title,
				price:order.line_items[0].price};
  var dbo = db.db("shopifyDB");
  dbo.collection("orders").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 document inserted");
	
    
		});
  
  
	});
  res.sendStatus(200)
});

//LIST ORDERS
app.get('/',function(err,res){
	mongo.connect(url, function(err, db) {
	if (err) throw err;
	var dbo = db.db("shopifyDB");
	dbo.collection("orders").find({}).toArray(function(err, order) {
		if (err) throw err;
		else{
			res.render("orders",{order:order});
		
			}
		});
	});
});

//EDIT ORDERS

app.get('/edit/:id',function(req,res) {
		
		mongo.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("shopifyDB");
			
			dbo.collection("orders").find({"_id":ObjectId(req.params.id)}).toArray(function(err, forder) {
				if (err) throw err;
				else{
						
						res.render("edit",{forder:forder});
		
					}
				});

		});
});


//UPDATE ORDERS

app.post('/:id',function(req,res){
		var updated =req.body;
		console.log(updated);
		mongo.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("shopifyDB");
			var newvalues={ $set: updated};
		dbo.collection("orders").updateOne({"_id":ObjectId(req.params.id)},newvalues,function(err,res){
			if (err) throw err;
		else{
			console.log("updated");
			
			}
		});

	});

res.redirect("/");
});


app.listen(3000, () => console.log('Example app listening on port 3000!'))
