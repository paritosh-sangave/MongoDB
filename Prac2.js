// Update the inserted documents

// update my_first_collectIon  set my_third_field = 'Updated' // Update Many
db.my_first_collectIon.updateOne({},{$set : {my_third_field : "Updated" } })
db.my_first_collectIon.updateMany({},{$set : {my_fourth_field : "Updated_again" } })
db.my_first_collectIon.updateMany({},{$set : {my_fifth_field : "Updated_here_again" } })


// update members collection set status = 'Temporary ' for all members who belong to Pune (CI)
// /pune/ lower(city) like '%pune%'
db.LMS_MEMBERS.updateMany({CITY: /pune/i}, {$set: {MEMBERSHIP_STATUS: "Temporary"}});


// Upsert to true 
db.LMS_MEMBERS.updateMany({CITY:"BOGUS_CITY"},{$set:{MEMBERSHIP_STATUS:"Permanent" , MEMBER_NAME : 'Bogus_member'} });
//if matching condition not found, modification is not done


db.LMS_MEMBERS.updateMany({CITY:"BOGUS_CITY"},
                          {$set:{MEMBERSHIP_STATUS:"Permanent" , MEMBER_NAME : 'Bogus_member'} },
                          {upsert : true});
//setting upsert: True will create new document if matching condition is not found


db.LMS_MEMBERS.find({CITY:"BOGUS_CITY"},{});


// update book details and set edition number = 10 for all books with python category
/*
update  LMS_BOOK_DETAILS
set  BOOK_EDITION = 10
where category = 'python'
*/

db.LMS_BOOK_DETAILS.updateMany({CATEGORY: /python/i}, {$set: {BOOK_EDITION: NumberInt(10)}})

// update book details and set edition number = 15 and price 10,000 for all books with python category
// update lms_book_details set edition = 15 , price = 10000 where category   = 'python';

db.LMS_BOOK_DETAILS.updateMany({CATEGORY: /python/i}, 
                               {$set: {BOOK_EDITION: NumberInt(15), PRICE: 10000}});                               
db.LMS_BOOK_DETAILS.find();



//----------------------------------
//DEMO -- Simple selects using find()
//----------------------------------
// select *  from customer 
db.customer.find({},{});


// select *  from customer where address = 'Pune'
db.customer.find({address: {$regex: /Pune/}}, {});

// select * from customer where lower(address) like '%pune%'
db.customer.find({address: /pune/i});


// select * from customer where street_no = 123
db.customer.find({"billing_address.street_no": 123});
//or
//db.customer.find({"billing_address.street_no": {$eq: 123}}, {});


// select * from  customer.Cart.added_products[] where [].product_id = 'X001' 
// invalid syntax in SQL, just for reference
db.customer.find({ "Cart.added_products": {$elemMatch: { "product_id" : "X001"} }  },{});
//or
db.customer.find({"Cart.added_products.product_id": "X001"});

// select * from  customer.Cart.added_products[] where [].product_id = 'X003' 
// invalid syntax just for reference         
db.customer.find({"Cart.added_products.product_id": "X003"});       


// select * from customer where total_cost > 350 and address = 'Pune'                      
db.customer.find({"Cart.total_cost": {$gt: NumberInt(350)}, address: /pune/i}, {});                               
//or
db.customer.find({$and: [{"Cart.total_cost": {$gt: 350} }, {address : "Pune"}]  },{});
//db.customer.find({$or: [{"Cart.total_cost": {$gt: 350} }, {address : "Pune"}]  },{});


// select * from customer where address in ('Pune','Chennai')
db.customer.find({address: {$in: [/pune/i, /chennai/i]}}, {});


// select * from customer where address != 'Chennai'
db.customer.find({address: {$nin: [/chennai/i]}} );
//or
db.customer.find({address: {$ne: "Chennai"}}, {});


// select * from customer where address != 'chennai' 
// not so useful use case of toLowerCase()
db.customer.find({address: { $ne : "Chennai".toLowerCase() }}, {});
db.customer.find({address: { $ne : "Chennai".toUpperCase() }}, {}); 
//or
db.customer.find({},{"name_lower": $_id.name.toLowerCase()}); 
// good use case of toLowerCase()


/*--------------------------------------------
  Exercises on simple selects 
-------------------------------------------- */

// Name of the supplier that reside in chennai  [Case insensitive ]
db.LMS_SUPPLIERS_DETAILS.find({ADDRESS: {$in: [/chennai/i]}} );


// Name of the supplier , contact , email , Address 
// who resides in either Mumbai Or Delhi [CI] 
// and email does not belong to gmail account
db.LMS_SUPPLIERS_DETAILS.find({ADDRESS: {$in: [/mumbai/i, /delhi/i]}, EMAIL: {$nin: [/gmail/i]}}, 
                              {
                                  SUPPLIER_NAME: 1,
                                  CONTACT: 1,
                                  EMAIL: 1,
                                  ADDRESS: 1,
                                  _id: 0 
                              });
//Note: $in is equivalent of like in SQL


// book_name,book_publication
// of all books placed on rack_num = a1 
// and publication is not equal to tata mcgraw hill
db.LMS_BOOK_DETAILS.find({RACK_NUM: {$in: [/a1/i]}, PUBLICATION: {$nin: [/tata/i]}},
                         {
                             "Book_Name": "$BOOK_TITLE",
                             "Book_Publication": "$PUBLICATION",
                             _id: 0
                         });                            