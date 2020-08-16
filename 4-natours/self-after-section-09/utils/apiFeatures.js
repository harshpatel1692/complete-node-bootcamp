
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {...this.queryString}; //destructuring. need to COPY object to avoid altering of the main object
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B. Advance Filtering
        //http://127.0.0.1:3000/api/v1/tours?duration[gte]=5&page=1&price[lt]=1500&difficulty=easy
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        queryStr = JSON.parse(queryStr);

        this.query.find(queryStr);

        return this; //return entire object
    }

    sort() {
        if (this.queryString.sort) {
            // sort(price ratingsAverage)
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt') // minus createdAt
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v') //minus means exclude
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page-1)*limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures;