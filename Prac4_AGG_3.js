db.getCollection("LMS_BOOK_DETAILS").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $lookup: // Equality Match
            {
                from: "LMS_BOOK_ISSUE",
                localField: "BOOK_CODE",
                foreignField: "BOOK_CODE",
                as: "books_issued"
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
            $match: {
                // enter query here
                "books_issued": 
                {
                    "$ne": []
                }
            }
        },

        // Stage 3
        {
            $unwind: {
                path: "$books_issued",
            }
        },

        // Stage 4
        {
            $group: {
                _id: {
                        "book_code": "$BOOK_CODE",
                        "book_name": "$BOOK_TITLE"
                     },
                "book_count": {
                                  "$sum": 1.0
                              }
            }
        },

        // Stage 5
        {
            $match: {
                // enter query here
                "book_count": {"$gt": 2.0}
            }
        },

        // Stage 6
        {
            $sort: {
                "_id.book_name": 1.0
                
            }
        },

        // Stage 7
        {
            $project: {
                "Book_Name": "$_id.book_name",
                "Book_Code": "$_id.book_code",
                _id: 0.0    
            }
        }
    ],

    // Options
    {

    }

    // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);