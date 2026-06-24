const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/httpStatus");

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const first = errors.array()[0];
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `${first.path}: ${first.msg}`,
            data: null,
        });
    }

    next();
};

module.exports = validate;
