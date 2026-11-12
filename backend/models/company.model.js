import mongoose from 'mongoose';

const companySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String
        
    },
    website:{
        type:String
    },
    location:{
        type:String
        
    },
    industry:{
        type:String,
        trim:true,
        default:""
    },
    companySize:{
        type:String,
        trim:true,
        default:""
    },
    founded:{
        type:Number,
        min:1
    },
    companyType:{
        type:String,
        trim:true,
        default:""
    },
    specializations:{
        type:[String],
        default:[]
    },
    logo:{
        type:String //url to company logo
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true});

export const Company=mongoose.model("Company",companySchema);