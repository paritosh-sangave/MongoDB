// Working with ARRAYS 

// updating an array element using $ positional operator
// works only when you have one array field in the filter clause
//  this updates first occurance of multiple matches of the filter to array

db.students.insertMany( [
       { _id : 1, "grades" : [ 85, 85, 80 ] },
       { "_id" : 2, "grades" : [ 88, 90, 92 ] },
       { "_id" : 3, "grades" : [ 85, 100, 90 ] }
] );
                                  
db.students.find({_id: 1, grades: 80}, {});
db.students.find({_id: 2}, {});

db.students.updateOne({ _id: 1, grades: 80 }, { $set: { "grades.$" : 82 } });
db.students.updateMany({grades: 90}, {$set: {"grades.$": 79}});

// example where there are multiple arrays fields
db.students_deans_list.insertMany(
[
    {
        _id: 8,
        activity_ids: [1,2],
        grades: [90, 95],
        deans_list: [2021, 2021, 2020],
        peans_list: [2021, 2021, 2020]
    }                                  
]);


// updating an array element using $ positional operator when there are 
// multiple arrays field in filter clause
// does not works as expected since it does not know where to go in which array
// also it updates any one of the elements from the array 
// and not first element of multiple matches as with $ operator

db.students_deans_list.updateOne({ activity_ids: 1, grades: 95, deans_list: 2021 }, 
                                 { $set: { "deans_list.$": 2022 } });
                                 

// using array filter we can update as expected even 
// when we have multiple array elements that match the array filter 
// here all elements that match the array filter are updated 
// and not just first element of the matched array filter like $

db.students_deans_list.updateOne(
                                 { deans_list: 2021 },
                                 { $set: { "deans_list.$[element]": 2022} },
                                 { arrayFilters: [ { "element": { $eq: 2021 } } ] }
);


// we can use the same array filter across multiple arrays                       
db.students_deans_list.updateOne(
   { activity_ids: 1, grades: 95, deans_list: 2021 },
   { $set: { "deans_list.$[element]": 2022,"peans_list.$[element]": 2022, "grades.$[element]": 2022} },
   { arrayFilters: [ { "element": { $eq: 2021 } } ] }
);


// updates all elements of the array since we are using $[]
db.students_deans_list.updateOne(
   { activity_ids: 1, grades: 95, deans_list: 2021 },
   { $set: { "deans_list.$[]": 2022 } }
);


// pull few elements from deans_list
db.students_deans_list.updateOne(
   { activity_ids: 1, grades: 95, deans_list: 2022 },
   { $pull: { deans_list: 2022 } }
);


// pop last element from peans_list
db.students_deans_list.updateOne(
   { activity_ids: 1, grades: 95, deans_list: 2020 },
   { $pop: { peans_list: -1 } }
);


// push one array element to the grades
db.students_deans_list.updateOne(
   { activity_ids: 1, grades: 95, deans_list: 2020 },
   { $push: { grades: 83, deans_list: 2022 } }
);


// push multiple array element to the grades
db.students_deans_list.updateOne(
   { activity_ids: 1 },
   { $push: { grades: { $each: [ 57, 75, 91 ] } } }
)

//db.students_deans_list.updateOne(
//   { activity_ids: 1, grades: 95, deans_list: 2022 },
//   { $pull: { grades:  57} }
//)


// push multiple array element to the grades , sort(1 asc , -1 desc ) them in asc and slice top 3 
db.students_deans_list.updateOne(
    {activity_ids: 1},
    {$push: {grades: {$each: [4,1,2], $sort: 1}}}
);


//, , $slice: 3 
db.students_deans_list.updateOne(
   { activity_ids: 1 },
   { $push: { grades: { $each: [ 10, 5, 15 ], $sort: -1,$slice: 3 } } }
);
// sort: -1 sorts by descending order, $slice: 3 keeps first three elements in array an deletes rest


// pull all elements from deans_list
db.students_deans_list.updateOne(
    {activity_ids: 1},
    {$pull: {grades: {$gt: -500}}}
);


// push an element that already exists 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $push: { grades: 11 } }
);


// add to set an element that already exists , it does not add to the array
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $addToSet: { grades: 11 } }
);


// add to set an element that does not already exists 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $addToSet: { grades: 82 } }
);


// add to set an element at a given position 
//To use the $position modifier, it must appear with the $each modifier.
// for now we could not find a way to add a single element without each operator 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $push: { grades: {$each: [97]  ,  $position: 3 } }}
);


// difference between elemMatch and $all

db.trial.insertMany(
[
{
   "_id" : "abc",
    "city" : ["Pune","Mumbai","Nagpur"]
},
{
   "_id" : "pqr",
    "city" : ["Mumbai","Pune","Bangalore","Nagpur"]
},
{
   "_id" : "xyz",
    "city" : ["Chennai","Kolkatta","Delhi"]
},
{
   "_id" : "lmn",
    "city" : ["Chennai","Kolkatta","Pune"]
}
]
);


// $all is all of the list of values 
db.trial.find({"city" : {$all : ["Pune","Mumbai"]}},{});

// $elemMatch is all of the list of Queries  
db.trial.find({"city" : {$elemMatch : {$eq: "Pune",$eq: "Mumbai"}}},{});

// $elemMatch is list of Queries (we used $in to make it work like 
// or between queries) 
db.trial.find({"city" : {$elemMatch : {$in: [/Pune/,/Mumbai/]}}},{});

// $size will provide  size of the array 
db.trial.find({"city" : { $size: 3 } },{});

// using $inc operator in the array to increment by a given value 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $inc: { "grades.$[]": 1 } }
);

// using $min value 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $min: { "peans_list.$[]": 60 } }
);

db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $min: { "grades.$[]": 60 } }
);
// updates all values in array greater than 60 to 60


// using $max value 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $max: { "grades.$[]": 80 } }
);
//updates all values less than 80 to 80


// using $mul value 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $mul: { "grades.$[]": 2 } }
);
//multiplies all array elements by 2


// using $rename field 
db.students_deans_list.updateOne(
   { activity_ids: 1},
   { $rename: { "peans_list": "peas_list" } }
);


// update without $setOnInsert clause
db.students_deans_list.updateOne(
   {"_id" : 9.0},
   {$set : {"grades" : [1,2,3]}},
   {upsert  : true }
);

//----------------------------------------
//exercises on aggregate function with simple where and project clauses 
//----------------------
// select *  from customer 
db.customer.find({},{});

// select *  from customer where address = 'Pune'
// select * from customer where street_no = 123
// select * from customer where total_cost > 350
// select * from customer where total_cost > 350 and address = 'Pune'
// select * from customer where address in ('Pune','Chennai')
// select * from customer where lower(address) in ('pune','chennai')
// select * from customer where address != 'Chennai'
// select * from customer where address like '%pune%'
// select * from customer where lower(address) like '%pune%'

// select * from  customer.Cart.added_products[] where [].product_id = 'X001' // invalid syntax just for reference
db.customer.find({ "Cart.added_products": {$elemMatch: { "product_id" : "X001"} }  },{});

// select * from  customer.Cart.added_products[] where [].product_id = 'X003' // invalid syntax just for reference
db.customer.find({ "Cart.added_products": {$elemMatch: { "product_id" : "X003"} }  },{});



//-----
//solutions
//------
// select *  from customer 
db.customer.find({},{});
db.customer.aggregate([]);

// select *  from customer where address = 'Pune'
db.customer.find({address: "Pune"},{});
db.customer.aggregate(
[
    {$match : {address: "Pune" }}
]);


// select * from customer where street_no = 123
db.customer.find({"billing_address.street_no": 123},{});
db.customer.aggregate(
[
    {$match : {"billing_address.street_no": 123 }}
]);


// select * from customer where total_cost > 350
db.customer.find({"Cart.total_cost": {$gt : 350}},{});
db.customer.aggregate(
[
    {$match : {"Cart.total_cost": {$gt : 350} }}
]);


// select * from customer where total_cost > 350 and address = 'Pune'
db.customer.find({"Cart.total_cost": {$gt : 350} , "address" : "Pune" },{});
db.customer.aggregate(
[
    {$match : {"Cart.total_cost": {$gt : 350} , "address" : "Pune"}}
]);


// select * from customer where address in ('Pune','Chennai')
db.customer.find({address: {$in : ["Pune","Chennai"]}},{});
db.customer.aggregate(
[
    {$match : {address: {$in : ["Pune","Chennai"]}}}
]);


// select * from customer where lower(address) in ('pune','chennai')
db.customer.find({address: {$in : [/Pune/i,/Chennai/i]}},{});
db.customer.aggregate(
[
    {$match : {address: {$in : [/Pune/i,/Chennai/i]}}}
]);

