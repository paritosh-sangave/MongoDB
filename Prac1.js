//----------------------------------------
//CRUD DEMO
//----------------------------------------

db.createCollection("First_Collection");
show collections;

//insert

db.First_Collection.insertOne({"First_field": "One"});
db.First_Collection.insertOne({"Second_field": "Two"});
db.First_Collection.insertOne({
                                  "Second_field": NumberInt(2),
                                  "Third_field": "Three"
                              });
                              
db.First_Collection.insertMany(
[
    {
        "Second_field": "2",
        "Third_field": "3",
        "Fourth_field": "Four"
    },
    
    {
        "First_field": NumberInt(1),
        "Second_field": 2.2,
        "Third_field": NumberInt(3)    
    },
    
    {
        "Fourth_field": "4",
        "Fifth_field": NumberInt(4)    
    }
]
);

// insert 

db.First_Collection.insertOne(
    {
        _id: 123,
        "First_field": 1.0,
        "Second_field": "2"
    }
);

db.First_Collection.insertOne(
    {
        _id: NumberInt(123), // duplicate ID, entry won't be made
        "First_field": 3,
        "Second_field": "5"
    }
);


//delete

db.First_Collection.deleteOne({_id:123});

db.First_Collection.deleteOne({"Third_field":"Three"});
db.First_Collection.deleteMany({"Third_field":"3"});


// Customer_Product_ database
db.customer.find();
db.customer.deleteOne({address:"Pune"});
db.customer.deleteMany({address:"Bangalore"});

db.getCollection("customer").find({_id:"C003"}, {"Cart.added_products":1.0});

db.customer.updateOne({_id:"C003"},{$pull: {"Cart.added_products": {"product_id": "X001"}}});


//---------------------------------
//Update elements

db.First_Collection.updateOne({}, {$set: {Third_field: "Updated"}});
db.First_Collection.updateMany({}, {$set: {Fifth_field: "Updated_again"}});

db.First_Collection.updateOne({First_field: "One"}, {$set: {Third_field: "Three_new"}})
db.First_Collection.updateMany({First_field: "One"}, {$set: {Third_field: "Three_new"}})
