const app = require('./app')
//Entry point that could contain the following
//Database configuration
//Error handling logic
//Env variables
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port: ${port}`);
});
