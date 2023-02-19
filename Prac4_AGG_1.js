db.getCollection("LMS_MEMBERS").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $lookup: {
                        from: "LMS_BOOK_ISSUE",
                        localField: "MEMBER_ID",
                        foreignField: "MEMBER_ID",
                        as: "output array of_issuances"
            }
        },

        // Stage 2
        {
            $unwind: {
                "path": "$output array of_issuances"
            //    includeArrayIndex: true, // optional
            //    preserveNullAndEmptyArrays: true // optional
            }
        }
    ],

    // Options
    {

    }

    // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);