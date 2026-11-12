import mongoose from 'mongoose';

const jobSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    requirements:{
        type:[String],
        default:[]
    },
    salary:{
        type:String, // e.g. "6-12" (LPA) or "6" — stored as string so ranges can be saved correctly
        required:true
    },
    experienceLevel:{
        type:String, // e.g. "0-2" (years) or "2"
        required:true,
    },
    location:{
        type:String,
        required:true
    },
    jobType:{
        type:String,
        required:true
    },
    workMode:{
        type:String,
        default:""
    },
    isArchived:{
        type:Boolean,
        default:false
    },
    archivedAt:{
        type:Date,
        default:null
    },
    benefits:{
        type:[String],
        default:[]
    },
    applicationDeadline:{
        type:Date
    },
    position:{
        type:Number,
        required:true
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Company',
        required:true
    },
    created_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    applications:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Application'
    }]

},{timestamps:true});

export const Job=mongoose.model("Job",jobSchema);
