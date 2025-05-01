const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        return Promise.resolve(req, res, next).catch((err) => next(err));
    }
}

export { asyncHandler }


// try catch method

// const asyncHandler = (requestHandler) => (req, res, next) => {
//     try {
//         requestHandler(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }