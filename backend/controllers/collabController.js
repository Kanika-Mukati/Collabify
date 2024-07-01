import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import  ErrorHandler from "../middlewares/error.js";
import { Collab} from "../models/collabSchema.js";

export const getAllCollabs = catchAsyncError(async (req, res, next) => {
    const collabs = await Collab.find({expired: false});
    res.status(200).json({
        success: true,
        collabs,
    });
});

export const postCollabs = catchAsyncError(async(req, res ,next)=> {
    const {role} = req.user;
    if(role === "Influencer"){
        return next(new ErrorHandler("Collabration seeker is not allowed to access this resources!", 
        400
    )
);
    }

    const {
        title, 
        description,
        category,
        platforms,
        reach,
        country, 
        city, 
        fixedPayment, 
        paymentFrom , 
        paymentTo
     } = req.body;

    if(!title || !description || !category || !country){
        return next(new ErrorHandler("Please provide all details", 400));
    }

    if((! paymentFrom || ! paymentTo) && !fixedPayment){
        return next(
            new ErrorHandler("Please either provide fixed payment or  payment range!!")
        );
    }

    if(paymentFrom && paymentTo && fixedPayment){
        return next(
            new ErrorHandler("Cannot enter fixed and ranged payment together")
        );
    }

    const postedBy = req.user._id;
    const collab = await Collab.create({
        title, 
        description,
        category,
        platforms,
        reach,
        country, 
        city, 
        fixedPayment, 
        paymentFrom , 
        paymentTo,
        postedBy
    })

    res.status(200).json({
        sucess: true,
        message: "collabration post posted successfully",
        collab
    });
});

export const getmyCollabs = catchAsyncError(async(req, res, next) =>{
    const {role} = req.user;
    if(role === "Influencer"){
        return next(new ErrorHandler("Collabration seeker is not allowed to access this resources!", 
        400
    )
  );
 }

 const mycollabs = await Collab.find({postedBy: req.user._id});
 res.status(200).json ({
    success: true,
    mycollabs
 });
});


export const updatePost = catchAsyncError(async(req, res, next)=> {
    const {role} = req.user;
    if(role === "Influencer"){
        return next(
            new ErrorHandler(
                "Collabration seeker is not allowed to access this resources!", 
                400
    )
  );
 }

 const {id} = req.params;
 let collab = await Collab.findById(id);
 if(!collab){
    return next(
        new ErrorHandler(
            "OOPS!! Collab not found", 
            404
        )
    );
 }
 collab = await Collab.findByIdAndUpdate(id, req.body, {
    new : true,
    runValidators: true,
    useFindAndModify: false
 })
 res.status(200).json({
    success: true,
    collab,
    message: "Post updated successfully",
 });
});

export const deletePost = catchAsyncError(async(req, res, next)=> {
    const {role} = req.user;
    if(role === "Influencer"){
        return next(
            new ErrorHandler(
                "Collabration seeker is not allowed to access this resources!", 
                400
    )
  );
 }

 const {id} = req.params;
 let collab = await Collab.findById(id);
 if(!collab){
    return next(
        new ErrorHandler(
            "OOPS!! Collab not found", 
            404
        )
    );
 }

 await Collab.deleteOne();
 res.status(200).json ({
    sucess: true,
    message: "Post deleted successfully"
 });
});

export const getSinglePost = catchAsyncError(async(req, res , next)=> {
    const {id} = req.params;

    try {
        const collab = await Collab.findById(id);
        if(!collab){
            return next(new ErrorHandler("This post not found", 404));
        }
        res.status(200).json({
            success: true,
            collab,
        })
    } catch (error) {
      return next(new ErrorHandler("Invalid ID/CastError"))  
    }
})