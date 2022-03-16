
const express = require("express")
const mongoose = require("mongoose")

const {body,validationResult}=require("express-validator")

const connect = ()=>mongoose.connect(
    "mongodb+srv://web15:web15@cluster0.zieim.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
    )
const app  = express()

app.use(express.json())

const userSchema = new mongoose.Schema({

    first_name:{type: String,required:true},
    email:{type: String,required:true},
    last_name:{type: String,required:true},
    pin_code:{type:Number,required:true},
    age:{type:Number,required:true},
    gender:{type:String,required:true}


},
{
    timestamps:true,
    versionKey:false
 
}
)


const User = new mongoose.model("user",userSchema)


app.get("/users",async (req,res)=>{
    console.log("get at author")
    const user = await User.find().lean().exec();
    return res.status(200).send(user);
})

app.post("/users",
   body("first_name").not().isEmpty().withMessage("first_name is required"),
   body("email")
   .isEmail()
   .custom( async(value)=>{
        console.log({value})
         const user = await User.findOne({email:value});
         if(user){
             throw new Error("email already exist")
         }
         return true;
   }),
   body("age").not().isEmpty().withMessage("age can be empty").custom(async(value)=>{
   
if(value>120){
    
    throw new Error("invalid age")
}
return true;
   }),
   body("gender").not().isEmpty().withMessage("you have to choose gender")
   .custom((value)=>{
       if(value=="Male"||value=="female"||value=="others"){
        return true;
       }
       throw new Error("plz enter correct gender")
       

   }),
   body("pin_code").not().isEmpty().isNumeric()
   .custom((value)=>{
       if(value >=100000 && value <=999999){
        return true;
           
       }
       throw new Error("invalid pincode")
       
   })
,async(req,res)=>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }


        console.log(req.body);
        const user =await User.create(req.body)
        return res.status(201).send(user)
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

app.patch("/users/:id",async (req,res)=>{
    const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true}).lean().exec();
    return res.send(user)
})

app.delete("/users/:id",async (req,res)=>{
    const user = await User.findByIdAndDelete(req.params.id).lean().exec();
    return res.send(user)
})



app.listen(4000,()=>{
    connect()
    console.log("port listening 4000 and server is coonect")
})
