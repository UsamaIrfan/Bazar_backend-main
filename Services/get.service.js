
const AdvanceFetch = (model, populate) => async (
    req,
    res,
    next
) => {

    let FindQuery;

    // Destructuring from req.query
    const { select, sort, page, limit, query } = req.query;

    // const reqQuery = { ...req.query };
    // These are the fields which will be removed from req Query
    // const removeField: string[] = ['select', 'sort', 'page', 'limit'];
    // Removing Select, Sort, Page & limit fields for Search by field Name Query
    // removeField.forEach((param) => delete reqQuery[param]);
    // console.log(JSON.stringify(populate, null, 2));

    // Supports all operators ($regex, $gt, $gte, $lt, $lte, $ne, etc.)
    // GET /Api?query={"name":"Bob"}
    // GET /Api?query={"name":{"$regex":"^(Bob)"}}
    // GET /Api?query={"age":{"$gt":12}}
    // GET /Api?query={"age":{"$gte":12}}
    // GET /Api?query={"age":{"$lt":12}}
    // GET /Api?query={"age":{"$lte":12}}
    // GET /Api?query={"age":{"$ne":12}}

    if (query) {
        const QueryObject = JSON.parse(query)
        console.log(QueryObject)
        FindQuery = model.find(QueryObject);
    } else {
        FindQuery = model.find()
    }

    // Selecting
    if (select) {
        const fields = select.split(',').join(' ');
        FindQuery = FindQuery.select(fields);
    }

    // Sorting
    if (sort) {
        const sortBy = sort.split(',').join(' ');
        FindQuery = FindQuery.sort(sortBy);
    } else {
        FindQuery = FindQuery.sort('-createdAt');
    }

    if (populate) {
        FindQuery = FindQuery.populate(populate);
    }

    // pagination
    const crPage = parseInt(page, 10) || 1;
    const crLimit = parseInt(limit, 10) || 10;
    const startIndex = (crPage - 1) * crLimit;
    const endIndex = crPage * crLimit;
    const total = await model.countDocuments();
    const pages = Math.ceil(total / crLimit)

    const pagination = {};
    pagination.total = total
    pagination.pages = pages

    if (endIndex < total) {
        pagination.next = {
            page: crPage + 1,
            limit: crLimit,
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: crPage - 1,
            limit: crLimit,
        };
    }

    if (pagination.prev) {
        pagination.active = {
            page: crPage,
            // from: (limit * page) - limit,
            // to: limit * page
            from: limit * pagination.prev.page,
        }
    }

    if (pagination.next) {
        pagination.active = {
            ...pagination.active,
            to: limit * pagination.next.page
        }
    }

    // PerPage
    if (limit) {
        FindQuery = FindQuery.limit(crLimit)
    }

    // pagiination
    if (page) {
        FindQuery = FindQuery.skip(crLimit * (crPage - 1))
    }

    try {
        const data = await FindQuery;
        res.advanceFetch = {
            success: true,
            pagination: {
                ...pagination,
                total: data.length,
            },
            entities: data,
        };
        // console.log(res.advanceFetch)
    } catch (error) {
        next(error);
    }
    next();
};

module.exports = AdvanceFetch;
