// Either use try catch or pass into a promise to handle async operations

module.exports = func => (req, res, next) => {
    Promise.resolve(func(req,res,next)).catch(next)
}