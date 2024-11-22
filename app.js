
const save=false;
const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
var path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://suhasrajeshmysore:Chinnu2004@rock.uopia.mongodb.net/todolistdb?retryWrites=true&w=majority");

const itemSchema= new mongoose.Schema({
  name: String
});

const model=new mongoose.model("Item",itemSchema);

const item1=new model({
     name: "Welcome to your ToDoList"
});

const item2=new model({
     name: "Hit the + button to add list"
});

const item3=new model({
  name: "<-- Hit this button to remove item"
});

const defaultItems=[item1,item2,item3];

const listSchema= new mongoose.Schema({
     name: String,
     items: [itemSchema]
});

const model1=new mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  model.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        return model.insertMany(defaultItems);
      } else {
        return foundItems;
      }
    })
    .then((foundItems) => {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    })
    .catch((err) => {
      console.log(err);
    });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const additem =new model({
    name: itemName
  });

  if(listName==="Today"){
    additem.save()
  .then(() =>{
    console.log("added additional item");
  })
  .catch((err) =>{
    console.log(err);
  });
  res.redirect("/");
  }
  else{
    model1.findOne({name:listName})
    .then((foundList)=>{
      foundList.items.push(additem);
      foundList.save()
      .then(() =>{
        console.log("added additional item");
      })
      .catch((err) =>{
        console.log(err);
      });
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete",function(req,res){
   
  const del=req.body.d;
  const listName=req.body.lname;
  if(listName==="Today"){
  model.deleteOne({_id:del})
  .then(() =>{
    console.log("Deleted item");
  })
  .catch((err) =>{
    console.log(err);
  });
  res.redirect("/");
 }
 else{
  model1.findOne({name: listName})
  model1.findOneAndUpdate({name:listName},{$pull :{items:{_id:del}}})
  .then(()=>{
    res.redirect("/"+listName);
  })
  .catch((err)=>{
    console.log(err);
  })
 }
});

app.get("/:listId", function(req, res) {
  const lname = _.capitalize(req.params.listId);

  model1.findOne({ name: lname })
    .then((foundList) => {
      if (!foundList) {
        // Create and save a new list if it does not exist
        const list = new model1({
          name: lname,
          items: defaultItems,
        });
        return list.save().then(() => list); // Pass the newly created list
      }
      return foundList; // Pass the existing list
    })
    .then((list) => {
      // Render the list (either new or existing)
      res.render("list", { listTitle: list.name, newListItems: list.items });
    })
    .catch((err) => {
      console.log(err); // Log any errors that occur
      res.redirect("/"); // Redirect to the home page in case of errors
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
