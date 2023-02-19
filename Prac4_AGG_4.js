db.getCollection("LMS_BOOK_DETAILS").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $lookup: // Equality Match
            {
                from: "LMS_SUPPLIERS_DETAILS",
                localField: "SUPPLIER_ID",
                foreignField: "SUPPLIER_ID",
                as: "supplier_list"
            }
            
            // Uncorrelated Subqueries
            // (supported as of MongoDB 3.6)
            // {
            //    from: "<collection to join>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to execute on the collection to join> ],
            //    as: "<output array field>"
            // }
            
            // Correlated Subqueries
            // (supported as of MongoDB 5.0)
            // {
            //    from: "<foreign collection>",
            //    localField: "<field from local collection's documents>",
            //    foreignField: "<field from foreign collection's documents>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to run> ],
            //    as: "<output array field>"
            // }
        },

        // Stage 2
        {
            $unwind: {
                path: "$supplier_list",
            
            }
        },

        // Stage 3
        {
            $match: {
                // edition greater than 3
                // and it is supplied by a supplier who has a rediff / gmail account
                "BOOK_EDITION": {$gte: 3.0},
                "supplier_list.EMAIL": 
                    {$in: [/.*gmail.com/, /.*redif.com/, /.*rediff.com/ ]}
            }
        },

        // Stage 4
        {
            $lookup: // Equality Match
            {
                from: "LMS_BOOK_ISSUE",
                localField: "BOOK_CODE",
                foreignField: "BOOK_CODE",
                as: "issued_books"
            }
            
            // Uncorrelated Subqueries
            // (supported as of MongoDB 3.6)
            // {
            //    from: "<collection to join>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to execute on the collection to join> ],
            //    as: "<output array field>"
            // }
            
            // Correlated Subqueries
            // (supported as of MongoDB 5.0)
            // {
            //    from: "<foreign collection>",
            //    localField: "<field from local collection's documents>",
            //    foreignField: "<field from foreign collection's documents>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to run> ],
            //    as: "<output array field>"
            // }
        },

        // Stage 5
        {
            $unwind: {
                path: "$issued_books"
            }
        },

        // Stage 6
        {
            $lookup: // Equality Match
            {
                from: "LMS_MEMBERS",
                localField: "issued_books.MEMBER_ID",
                foreignField: "MEMBER_ID",
                as: "member_details"
            }
            
            // Uncorrelated Subqueries
            // (supported as of MongoDB 3.6)
            // {
            //    from: "<collection to join>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to execute on the collection to join> ],
            //    as: "<output array field>"
            // }
            
            // Correlated Subqueries
            // (supported as of MongoDB 5.0)
            // {
            //    from: "<foreign collection>",
            //    localField: "<field from local collection's documents>",
            //    foreignField: "<field from foreign collection's documents>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to run> ],
            //    as: "<output array field>"
            // }
        },

        // Stage 7
        {
            $unwind: {
                path: "$member_details",
            
            }
        },

        // Stage 8
        {
            $match: {
                "member_details.MEMBERSHIP_STATUS": "Permanent"
                
            }
        },

        // Stage 9
        {
            $group: {
                _id: {
                        "rack_num": "$RACK_NUM",
                         "book_code": "$BOOK_CODE" 
                     },
            
            }
        },

        // Stage 10
        {
            $group: {
                _id: {"rack_num" : "$_id.rack_num"},
                 "count1" : {"$sum": 1.0}
            }
        },

        // Stage 11
        {
            $project: {
                "rack_number": "$_id.rack_num",
                "count_of_books" : "$count1",
                "_id" : 0.0
            }
        }
    ],

    // Options
    {

    }

    // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);