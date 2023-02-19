// -----------------------------
// join tryout 
// -----------------------------

// general syntax [MongoDB does a left join by default ]
/*
{
    from: "<collection to join>",
    localField: "<field from the input documents>",
    foreignField: "<field from the documents of the 'from' collection>",
    as: "<output array field>"
}
*/

// example translation of oracle left join in mongodb using $lookup operator

//select lms_members.* 
// from lms_members left join lms_book_issue 
// on (lms_members.member_id = lms_book_issue.member_id ) ;

db.LMS_MEMBERS.aggregate(
[
    {$lookup : 
        {
            from: "LMS_BOOK_ISSUE",
            localField: "MEMBER_ID",
            foreignField: "MEMBER_ID",
            as: "output array of_issuances"
        }
    },
//    {$unwind:
//        {
//            "path": "$output array of_issuances"
//        }
//        
//    }    
]
);

// Demo Example but for inner join and not left join 
// all members who have issued a book
// using joins 

//select lms_members.* 
//from lms_members inner JOIN lms_book_issue 
// on (lms_members.member_id = lms_book_issue.member_id ) ;
/*

// Equality Match [Left JOIN]
{
    from: "<collection to join>",
    localField: "<field from the input documents>",
    foreignField: "<field from the documents of the 'from' collection>",
    as: "<output array field>"
}
+ $match
*/
// solution 1 members left join issuances followed by discarding empty issuances 
db.getCollection("LMS_MEMBERS").aggregate(
    [
        { 
            "$lookup" : { 
                "from" : "LMS_BOOK_ISSUE", 
                "localField" : "MEMBER_ID", 
                "foreignField" : "MEMBER_ID", 
                "as" : "issued_members"
            }
        }, 
        { 
            "$match" : { 
                "issued_members"  : { 
                    "$ne" : []
                }
            }
        }
    ]
);

//  name of the suppliers who reside in 'pune/mumbai/chennai'[CI]
// who have supplied a book placed on rack_numbers A1/A2/A3
// and their category is not JAVA 


/*
select lms_book_details.book_title
from lms_suppliers_details inner join lms_book_details on (lms_suppliers_details.supplier_id = lms_book_details.supplier_id )
where lower(lms_suppliers_details.address) in ('pune','mumbai','chennai')
and rack_num in ('A1','A2','A3')
and category != 'JAVA';
*/


// solution 1 with 3 match clauses 
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_SUPPLIERS_DETAILS",
                "localField" : "SUPPLIER_ID",
                "foreignField" : "SUPPLIER_ID",
                "as" : "supplier_details_array"
            }
        }, 
        {
            "$unwind" : {
                "path" : "$supplier_details_array"
            }
        }, 
        {
            "$match" : {
                "supplier_details_array.ADDRESS" : {
                    "$in" : [
                        /pune/i,
                        /mumbai/i,
                        /chennai/i
                    ]
                }
            }
        }, 
        {
            "$match" : {
                "RACK_NUM" : {
                    "$in" : [
                        "A1",
                        "A2",
                        "A3"
                    ]
                }
            }
        }, 
        {
            "$match" : {
                "CATEGORY" : {
                    "$ne" : "JAVA"
                }
            }
        }, 
        {
            "$project" : {
                "_id" : 0.0,
                "Book_Name" : "$BOOK_TITLE"
            }
        }
    ]
);

// solution 2 with one match and using and clause
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_SUPPLIERS_DETAILS",
                "localField" : "SUPPLIER_ID",
                "foreignField" : "SUPPLIER_ID",
                "as" : "supplier_details_array"
            }
        }, 
        {
            "$unwind" : {
                "path" : "$supplier_details_array"
            }
        }, 
        {
            "$match" : {
                "$and" : [
                    {
                        "supplier_details_array.ADDRESS" : {
                            "$in" : [
                                /pune/i,
                                /mumbai/i,
                                /chennai/i
                            ]
                        }
                    },
                    {
                        "RACK_NUM" : {
                            "$in" : [
                                "A1",
                                "A2",
                                "A3"
                            ]
                        }
                    },
                    {
                        "CATEGORY" : {
                            "$ne" : "JAVA"
                        }
                    }
                ]
            }
        }, 
        {
            "$project" : {
                "_id" : 0.0,
                "Book_Name" : "$BOOK_TITLE"
            }
        }
    ]
);



//--------------------
// JOINS continued
//--------------------

// name of the supplier , book_title , member_id 
// such that the supplier may or may not have supplied a book
// and the supplier book may or may not be issued to a member

/*
LMS_SUPPLIER_DETAILS LEFT JOIN LMS_BOOK_DETAILS
ON(LMS_SUPPLIER_DETAILS.SUPPLIER_ID = LMS_BOOK_DETAILS.SUPPLIER_ID)
LEFT JOIN LMS_BOOK_ISSUE ON (LMS_BOOK_DETAILS.BOOK_CODE = LMS_BOOK_ISSUE.BOOK_CODE ) */

db.getCollection("LMS_SUPPLIERS_DETAILS").aggregate(
[
    {"$lookup" : {
                     "from" : "LMS_BOOK_DETAILS",
                     "localField" : "SUPPLIER_ID",
                     "foreignField" : "SUPPLIER_ID",
                     "as" : "supplied_books_details"
                 }
    },
    {"$unwind" : {
                     "path" : "$supplied_books_details",
                     "preserveNullAndEmptyArrays" : true
                 }
    },
    {"$lookup" : {
                     "from" : "LMS_BOOK_ISSUE",
                     "localField" : "supplied_books_details.BOOK_CODE",
                     "foreignField" : "BOOK_CODE",
                     "as" : "issuance_details"
                 }
    },
    {$unwind : {
                   "path" : "$issuance_details",
                   "preserveNullAndEmptyArrays" : true
               }
    },
    {$project : {
                    "SUPPLIER_NAME" : 1.0,
                    "title_of_book" : "$supplied_books_details.BOOK_TITLE",
                    "member_id" : "$issuance_details.MEMBER_ID"
                }
    } 
]
);


////////////////////////////////////////
db.getCollection("LMS_SUPPLIERS_DETAILS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_BOOK_DETAILS",
                "localField" : "SUPPLIER_ID",
                "foreignField" : "SUPPLIER_ID",
                "as" : "supplied_books"
            }
        }, 
        {
            "$unwind" : {
                "path" : "$supplied_books",
                "preserveNullAndEmptyArrays" : true
            }
        }, 
        {
            "$lookup" : {
                "from" : "LMS_BOOK_ISSUE",
                "localField" : "supplied_books.BOOK_CODE",
                "foreignField" : "BOOK_CODE",
                "as" : "issuance_details"
            }
        }, 
        {
            "$unwind" : {
                "path" : "$issuance_details",
                "preserveNullAndEmptyArrays" : true
            }
        }, 
        {
            "$project" : {
                "SUPPLIER_NAME" : 1.0,
                "title_of_book" : "$supplied_books.BOOK_TITLE",
                "member_id" : "$issuance_details.MEMBER_ID"
            }
        }
    ]
);

////////////////////////////////////////////////////////////////////

// book_code and name of the book which has been issued more than 4 times and has more than 0 suppliers
// (Note: Java how to program has 2 book codes because of different published date)
/*
select lms_book_issue.BOOK_CODE,lms_book_details.BOOK_TITLE, count(*) from
lms_book_details INNER JOIN  lms_book_issue on (lms_book_issue.BOOK_CODE = lms_book_details.BOOK_CODE)
where lms_book_details.supplier_id is not null 
group by lms_book_issue.BOOK_CODE,lms_book_details.BOOK_TITLE
having count(book_issue_no) > 4 
*/

// possible solution 1 
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        { 
            $lookup: 
            { 
                "from" : "LMS_BOOK_ISSUE", 
                "localField" : "BOOK_CODE", 
                "foreignField" : "BOOK_CODE", 
                "as" : "Books_issued"
            }
        }, 
        { 
            $match : 
            { 
                "Books_issued" : 
                { 
                    "$ne" : []
                }, 
                "SUPPLIER_ID" : 
                { 
                    "$ne" : null
                }
            }
        }, 
        { 
            $unwind : 
            { 
                "path" : "$Books_issued"
            }
        }, 
        { 
            $group : 
            { 
                "_id" : 
                { 
                    "book_code" : "$Books_issued.BOOK_CODE"
                }, 
                "cnt" : 
                { 
                    "$sum" : 1.0
                }
            }
        }, 
        { 
            $match : 
            { 
                "cnt" : 
                { 
                    "$gt" : 4.0
                }
            }
        }, 
        { 
            $project : 
            { 
                "_id" : 0.0, 
                "cnt" : 1.0, 
                "book_code" : "$_id.book_code"
            }
        }
    ]
);
// possible solution 2
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        { 
            "$lookup" : { 
                "from" : "LMS_BOOK_ISSUE", 
                "localField" : "BOOK_CODE", 
                "foreignField" : "BOOK_CODE", 
                "as" : "Books_issued"
            }
        }, 
        { 
            "$unwind" : { 
                "path" : "$Books_issued"
            }
        }, 
        { 
            "$group" : { 
                "_id" : { 
                    "book_code" : "$Books_issued.BOOK_CODE", 
                    "SUPPLIER_ID" : "$SUPPLIER_ID"
                }, 
                "cnt" : { 
                    "$sum" : 1.0
                }
            }
        }, 
        { 
            "$match" : { 
                "_id.SUPPLIER_ID" : { 
                    "$ne" : null
                }, 
                "cnt" : { 
                    "$gt" : 4.0
                }
            }
        }, 
        { 
            "$project" : { 
                "_id" : 0.0, 
                "cnt" : 1.0, 
                "book_code" : "$_id.book_code"
            }
        }
    ]
);
// possible solution 3 
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_BOOK_ISSUE",
                "localField" : "BOOK_CODE",
                "foreignField" : "BOOK_CODE",
                "as" : "BOOK_ISSUED"
            }
        }, 
        {
            "$project" : {
                "BOOK_CODE" : 1.0,
                "BOOK_TITLE" : 1.0,
                "SUPPLIER_ID" : 1.0,
                "my_cnt" : {
                    "$size" : "$BOOK_ISSUED"
                }
            }
        }, 
        {
            "$match" : {
                "my_cnt" : {
                    "$gt" : 4.0
                },
                "SUPPLIER_ID" : {
                    "$ne" : null
                }
            }
        }
    ]
);

// apt solution
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        { 
            "$lookup" : { 
                "from" : "LMS_BOOK_ISSUE", 
                "localField" : "BOOK_CODE", 
                "foreignField" : "BOOK_CODE", 
                "as" : "Books_issued"
            }
        }, 
        { 
            "$match" : { 
                "SUPPLIER_ID" : { 
                    "$ne" : null
                }, 
                "Books_issued.4" : { 
                    "$exists" : true
                }
            }
        }, 
        { 
            "$project" : { 
                "_id" : 0.0, 
                "book_code" : "$BOOK_CODE", 
                "BOOK_TITLE" : 1.0
            }
        }
    ]
);

///////////////////////////////////////////////////////////////////

/* name of the book which has been issued atleast twice 
and sort the result based on name of the book  ascending */ 

// SQL Query
/*
select lms_book_issue.BOOK_CODE,lms_book_details.BOOK_TITLE, count(*) from
lms_book_details INNER JOIN  lms_book_issue on (lms_book_issue.BOOK_CODE = lms_book_details.BOOK_CODE)
where lms_book_details.supplier_id is not null 
group by lms_book_issue.BOOK_CODE,lms_book_details.BOOK_TITLE
having count(book_issue_no) > 4 
*/

// Requires official MongoShell 3.6+
db = db.getSiblingDB("LMS_mongo_data");
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_BOOK_ISSUE",
                "localField" : "BOOK_CODE",
                "foreignField" : "BOOK_CODE",
                "as" : "books_issued"
            }
        }, 
        {
            "$match" : {
                "books_issued" : {
                    "$ne" : []
                }
            }
        }, 
        {
            "$unwind" : {
                "path" : "$books_issued"
            }
        }, 
        {
            "$group" : {
                "_id" : {
                    "book_code" : "$BOOK_CODE",
                    "book_name" : "$BOOK_TITLE"
                },
                "book_count" : {
                    "$sum" : 1.0
                }
            }
        }, 
        {
            "$match" : {
                "book_count" : {
                    "$gt" : 2.0
                }
            }
        }, 
        {
            "$sort" : {
                "_id.book_name" : 1.0
            }
        }, 
        {
            "$project" : {
                "Book_Name" : "$_id.book_name",
                "Book_Code" : "$_id.book_code",
                "_id" : 0.0
            }
        }
    ], 
    {
        "allowDiskUse" : false
    }
);

/////////////////////////////////////////////////////////////////////////////////////////////

/*
-- total number of books placed on given rack number 
-- such that edition of the book is atleast 3 
-- and it is supplied by a supplier who has a rediff / gmail account
-- and the book is issued to the students who are permanent in status
*/

// Side note : the count that we are doing should be that of book_code and not of number of issuances

/* sample O/P
RACK_NUM	Total
A1			2
A3			1
*/

/*
select det.rack_num , count(distinct iss.book_code) total

//select det.rack_num , count( iss.book_code) total
FROM LMS_BOOK_dETAILS det inner join lms_suppliers_details sdet  on (det.supplier_id = sdet.supplier_id)
inner join lms_book_issue iss on (det.book_code = iss.book_code)
inner join lms_members mem on(mem.member_id = iss.member_id)

where det.BOOK_EDITION > = 3 
and  ( lower(sdet.EMAIL) like '%gmail.com' or lower(sdet.EMAIL) like '%redif.com' ) 
and lower(mem.MEMBERSHIP_STATUS) = 'permanent'

group by det.rack_num ;
*/
db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        { 
            "$lookup" : { 
                "from" : "LMS_SUPPLIERS_DETAILS", 
                "localField" : "SUPPLIER_ID", 
                "foreignField" : "SUPPLIER_ID", 
                "as" : "supplier_list"
            }
        }, 
        { 
            "$unwind" : { 
                "path" : "$supplier_list"
            }
        }, 
        { 
            "$match" : { 
                "BOOK_EDITION" : { 
                    "$gte" : 3.0
                }, 
                "supplier_list.EMAIL" : { 
                    "$in" : [
                        /.*gmail.com/, 
                        /.*rediff.com/, 
                        /.*redif.com/
                    ]
                }
            }
        }, 
        { 
            "$lookup" : { 
                "from" : "LMS_BOOK_ISSUE", 
                "localField" : "BOOK_CODE", 
                "foreignField" : "BOOK_CODE", 
                "as" : "issued_books"
            }
        }, 
        { 
            "$unwind" : { 
                "path" : "$issued_books"
            }
        }, 
        { 
            "$lookup" : { 
                "from" : "LMS_MEMBERS", 
                "localField" : "issued_books.MEMBER_ID", 
                "foreignField" : "MEMBER_ID", 
                "as" : "member_details"
            }
        }, 
        { 
            "$unwind" : { 
                "path" : "$member_details"
            }
        }, 
        { 
            "$match" : { 
                "member_details.MEMBERSHIP_STATUS" : "Permanent"
            }
        }, 
        { 
            "$group" : { 
                "_id" : { 
                    "rack_num" : "$RACK_NUM", 
                    "book_code" : "$BOOK_CODE"
                }
            }
        }, 
        { 
            "$group" : { 
                "_id" : { 
                    "rack_num" : "$_id.rack_num"
                }, 
                "cnt" : { 
                    "$sum" : 1.0
                }
            }
        }, 
        { 
            "$project" : { 
                "rack_num" : "$_id.rack_num", 
                "count_of_books" : "$cnt", 
                "_id" : 0.0
            }
        }
    ], 
    { 
        "allowDiskUse" : false
    }
);


/////////////////////////////////////////////////////////////////////////////////

/*
 ----------------------------
 Corelated Subqueries 
 ----------------------------
*/
// expr example

db.getCollection("LMS_BOOK_DETAILS").find({ "BOOK_EDITION" :  5 })
db.getCollection("LMS_BOOK_DETAILS").find({ "BOOK_EDITION" : { $gte : 6 }})

db.getCollection("LMS_BOOK_DETAILS").find({ "BOOK_EDITION" : { $lt : "$PRICE" }})

db.getCollection("LMS_BOOK_DETAILS").find({$expr : { $lt :[ "BOOK_EDITION","PRICE"]} })

//----------------------------

// Q- name of the members and the city 
// such that they have atleast one supplier from their city 
//    and the supplier email ends with gmail.com

/*
select member_name , city from lms_members mem where 
exists (select * from lms_suppliers_details sdet
         where lower(sdet.address) = lower(mem.city)
         and lms_suppliers_details.email like '%gmail.com'
        );
*/

db.getCollection("LMS_MEMBERS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_SUPPLIERS_DETAILS",
                "localField" : "CITY",
                "foreignField" : "ADDRESS",
                "as" : "members_on_suppliers"
            }
        }, 
        {
            "$match" : {
                "members_on_suppliers" : {
                    "$elemMatch" : {
                        "EMAIL" : /gmail.com/i
                    }
                }
            }
        }
    ]
);

db.LMS_MEMBERS.find();

db.LMS_SUPPLIERS_DETAILS.find();

db.getCollection("LMS_MEMBERS").aggregate(
    [
        {
            "$lookup" : {
                "from" : "LMS_SUPPLIERS_DETAILS",
                "localField" : "cityadd",
                "foreignField" : "ADDRESS",
                "let" : {"cityadd": {"$toUpper": "CITY"}},
                "pipeline" : 
                [
                    {
                        "$match" : {
                                       "EMAIL" : /gmail.com/i,
                                       "cityadd" : "$ADDRESS"
                                   }
                        
                    }
         
                ],
                "as" : "members_on_suppliers"
            }
        },
        {
            $unwind: {"path": "$members_on_suppliers"}
            
        },
        {
            $project:{
                         "Name":"$MEMBER_NAME",
                         "City":"$CITY"
                     }
        }
    ]
);

//---------------------------------------------------------------------------------------

/*
// Q- list the book_code and book_name of the book that has arrived later than they have been issued 
// [we are trying to see if we have some invalid date arrivals in our book_details]

select book_code , book_name 
from lms_book_details bd 
where exists 
(   select 1 from lms_book_issue bi 
    where bi.book_code = bd.book_code 
    and  bd.date_arrival > bi.date_issue 
)

*/

db.getCollection("LMS_BOOK_DETAILS").aggregate(
    [
        { 
            "$lookup" : { 
                "from" : "LMS_BOOK_ISSUE", 
                "let" : { 
                    "date_arrival" : "$DATE_ARRIVAL", 
                    "book_code" : "$BOOK_CODE"
                }, 
                "pipeline" : [
                    { 
                        "$match" : { 
                            "$expr" : { 
                                "$and" : [
                                    { 
                                        "$eq" : [
                                            "$BOOK_CODE", 
                                            "$$book_code"
                                        ]
                                    }, 
                                    { 
                                        "$lt" : [
                                            "$DATE_ISSUE", 
                                            "$$date_arrival"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ], 
                "as" : "data"
            }
        }, 
        { 
            "$match" : { 
                             data : {$ne : []}
                             //"data.0" : {$exists : true}
            }
        }
    ]
);

////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------
/// Indexes DEMO 
//---------------------------------------

db.LMS_BOOK_ISSUE.dropIndex({ "BOOK_ISSUE_NO" : 1 } );

db.LMS_BOOK_ISSUE.find({BOOK_ISSUE_NO : {$gte : 5 }},{});
db.LMS_BOOK_ISSUE.createIndex( { "BOOK_ISSUE_NO" : 1 }, { unique: true } )
db.LMS_BOOK_ISSUE.find({BOOK_ISSUE_NO : {$gte : 5 }},{});

db.LMS_BOOK_ISSUE.dropIndex({ "BOOK_ISSUE_NO" : 1  } );

db.LMS_BOOK_ISSUE.createIndex( { "BOOK_ISSUE_NO" : 1 , MEMBER_ID :1 }, {name : "test_ind"},{ unique: true })

db.LMS_BOOK_ISSUE.find({BOOK_ISSUE_NO : {$gte : 5 }},{});

db.LMS_BOOK_ISSUE.getIndexes();

/////////////////////////////////////////////////////////////////////////

//---------------------------------------
/// Creating VIEWS in Mongodb
//---------------------------------------

// Demo on Creating a view 
// need the book_name and category of the book 
// such that the supplier has a contact number with 94 value in it 

db.LMS_BOOK_DETAILS.aggregate(
    {$lookup: { from:"LMS_SUPPLIERS_DETAILS", localField:"SUPPLIER_ID", foreignField:"SUPPLIER_ID", as:"Supplier_details"}},
    {$unwind: { path:"$Supplier_details"}},
    {$addFields: { result: { $regexMatch: { input: {$toString: "$Supplier_details.CONTACT"}, regex: /94/ }}}},
    {$match: {result:true}}
);

// syntax 1 :
db.createCollection(
  "my_first_view",
  {
    "viewOn" : "LMS_BOOK_DETAILS",
    "pipeline" : 
                [
                    {$lookup: { from:"LMS_SUPPLIERS_DETAILS", localField:"SUPPLIER_ID", foreignField:"SUPPLIER_ID", as:"Supplier_details"}},
                    {$unwind: { path:"$Supplier_details"}},
                    {$addFields: { result: { $regexMatch: { input: {$toString: "$Supplier_details.CONTACT"}, regex: /94/ }}}},
                    {$match: {result:true}}
                ]
  }
)
db.my_first_view.find();

// syntax2
db.createView(
  "my_second_view",
  "LMS_BOOK_DETAILS",
   [
                    {$lookup: { from:"LMS_SUPPLIERS_DETAILS", localField:"SUPPLIER_ID", foreignField:"SUPPLIER_ID", as:"Supplier_details"}},
                    {$unwind: { path:"$Supplier_details"}},
                    {$addFields: { result: { $regexMatch: { input: {$toString: "$Supplier_details.CONTACT"}, regex: /94/ }}}},
                    {$match: {result:true}}
    ]
);

db.my_second_view.find({BOOK_EDITION:5},{});



// create a view named "supplier_names"
// such the supplier has supplied a book with edition greater than 5

db.createCollection(
"supplier_names",
{
    viewOn:"LMS_SUPPLIERS_DETAILS",
    pipeline:[
                { 
                    "$lookup" : { 
                        "from" : "LMS_BOOK_DETAILS", 
                        "localField" : "SUPPLIER_ID", 
                        "foreignField" : "SUPPLIER_ID", 
                        "as" : "book_Details"
                    }
                }, 
                { 
                    "$unwind" : { 
                        "path" : "$book_Details"
                    }
                }, 
                { 
                    "$match" : { 
                        "book_Details.BOOK_EDITION" : { 
                            "$gt" : 5.0
                        }
                    }
                }, 
                { 
                    "$group" : { 
                        "_id" : { 
                            "supplier_name" : "$SUPPLIER_NAME"
                        }
                    }
                }, 
                { 
                    "$project" : { 
                        "_id" : 0.0, 
                        "SUPPLIER_NAME" : "$_id.supplier_name"
                    }
                }
            ]

});

db.supplier_names.find();
