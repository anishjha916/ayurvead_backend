// const express = require('express');
const bcrypt = require('bcrypt');
const  mongoose  = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        require: true,
    },
    email: {
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
 
    
})

userSchema.pre('save', async function (next){
    const user = this;
    console.log(user.password);
    if(!user.isModified('password')){
        return next();
    }
    user.password =  await bcrypt.hash(user.password, 8);
    console.log(user.password);
    next();  
})
mongoose.model("User",userSchema) 