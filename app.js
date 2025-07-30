const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Path = require("path")
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(Path.join(__dirname, "public")))
app.set("view engine", "ejs")

const users = [ ];
const expenses = [];
const JWT_SECRET = "BASIC_SECRET"
const generatedToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaGlAMTIzIiwiaWF0IjoxNzUwMzM5NzIzLCJleHAiOjE3NTAzNDMzMjN9.cF8FQfN5lN9cBD-7HHNowu0HG5LtwG2mc4OOdhAJugI"

const jwtVerify = () => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).send("Access denied, no token provided.")
        }
        const verifyJwt = jwt.verify(token, JWT_SECRET)

        if (!verifyJwt) {
            return res.status(401).send("Invalid token")
        }
        req.user = verifyJwt
        next();
    };
}

app.get("/", (req, res) => {
    res.send("Welcome to the Home Page")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/expensive", (req, res) => {
    const rawSearch = req.query.search || "";
    const search = rawSearch.toLowerCase().trim();


const filteredExpenses =  expenses.filter(exp => {
        return (
            exp?.reason?.toLowerCase().includes(search) ||
            exp?.date?.includes(search) ||
            exp?.amount?.toString().includes(search)
            
        );
       



    // const filteredExpenses = search
    //     ? expenses.filter(exp => exp.date.amount.reason.toLowerCase().includes(search))
    //     : expenses; 


//     const filteredExpenses =
//      expenses.filter(exp => {
//   const matchReason = !search.reason || exp.reason.toLowerCase().includes(search.reason.toLowerCase());
//   const matchDate = !search.date || exp.date === search.date;
//   const matchAmount = !search.amount || exp.amount == search.amount; // loose equality for number/string

//   return matchReason || matchDate || matchAmount;
})
    res.render("expensive", { expenses: filteredExpenses, search: rawSearch });
});

app.post("/signup", async (req, res) => {
    const { username, password } = req.body
    console.log(req.body);
    if (!username || !password) {
        return res.status(400).send("Username and Password are required")
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    users.push({ username, password: hashedPassword })
    res.redirect("/login" )
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).send("Username and Password are required")
    }

    const user = users.find((user => user.username === username))
    if (!user) {
        return res.status(400).send("Invalid username or password")
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    // console.log("isPasswordValid", isPasswordValid)
    if (!isPasswordValid) {
        return res.status(401).send("Invalid  password")
    }
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" })
    // return res.redirect(`/users?token=${token}`)
    res.redirect("/expensive")
})
app.post("/expensive",(req,res)=>{
   const {amount,reason, date} = req.body;
   console.log(req.body);

   if(!amount || !reason || !date){
    return res.status(400).send("All fields are required")
   }
   expenses.push({amount,reason,date})
   console.log(expenses)
   res.redirect("/expensive")
})


app.get("/users",  (req, res) => {
    const token = req.query;
console.log(token)
    res.render("users", { users: users, token: token })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})