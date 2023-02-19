db.getCollection("LMS_MEMBERS").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $lookup: // Equality Match
            {
                from: "LMS_BOOK_ISSUE",
                localField: "MEMBER_ID",
                foreignField: "MEMBER_ID",
                as: "issued_members"
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
            $match: // enter query here
            { 
                "issued_members"  : {"$ne" : [] }
            }
        },

        // Stage 3
        {
            $unwind: {
                path: "$issued_members",
            //    includeArrayIndex: <string>, // optional
            //    preserveNullAndEmptyArrays: <boolean> // optional
            }
        },

        // Stage 4
        {
            $project: {
                // specifications
                _id:0,
                "MEMBER_NAME": 1
            }
        }
    ],

    // Options
    {

    }

    // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);