const express = require('express');
const expressApp = express();
const firestoreDb = require('./firestore_init');
const firebase= require('firebase-admin');






expressApp.use(express.json());
expressApp.use(express.urlencoded({
    extended:true
}));




expressApp.post('/sendNotification', async (req,res)=>{
    console.log("request recieved in post");
 console.log(req.body);
 userId = req.body.userId;
 receiverId = req.body.receiverId;
 startTime = req.body.startTime;
 endTime = req.body.endTime;
 reqFlag = req.body.reqFlag;
 message =`${userId} has requested your location at time ${startTime}`;

 //this sets field name to $notId and content to {msg, ltime}
 notificationId = Math.floor(Math.random() * 100).toString();
 console.log("notId ",notificationId);


    //addding to document
    const response = await firestoreDb.collection('notifications').doc(receiverId).set(
      {
        [notificationId]: {
            "message" : message,
            "startTime" :startTime ,
            "endTime" :endTime ,
            "senderId" : userId,
            "reqFlag" : reqFlag
         }

      },
      { merge: true }
    )
    .then(() => {
      //
      console.log('Data added to the document.');
      const response = {
         message :"request sent"
      }
      res.send(response);
    })
    .catch((error) => {
      console.error('Error adding data to document:', error);
      const response = {
         message :'problem sending request'
      }
      res.send(response);
    });
    
 
 }
);

expressApp.post('/accessNotifications', async (req,res)=>{
   console.log("request recieved in accessNotifications");
console.log(req.body);
userId = req.body.userId;

try{

   //gets documment list & finds whether userid is present
   const collectionRef = firestoreDb.collection('notifications');
      const snapshot = await collectionRef.get();
      const documents = [];
    
      snapshot.forEach((doc) => {
         console.log(doc.id);
        documents.push(doc.id);
      });
      if(!documents.includes(userId)){
         res.status(404).send({
            message : "no notifications available"
         });
      }

   const response = (await firestoreDb.collection('notifications').doc(userId).get()).data();
   console.log(response);
   res.send(response);

}catch(error){
res.send({
   msg:`error ${error}`
});
}
})

expressApp.post('/notificationResponse', async (req,res)=>{
   console.log("request recieved in post");
 console.log(req.body);
 userId = req.body.userId;
 notification= req.body.notification;
 userResponse = req.body.userResponse;

 const key = Object.keys(notification)[0];
const senderId = Object.values(notification)[0]['senderId'];
 console.log(key);
 console.log(senderId);
approved = false;
try{
 if(userResponse ='APPROVE'){
   console.log("user allowed perm");

    firestoreDb.collection('notifications').doc(senderId).set(
     { [key]: {
         msg :`${userId} has accepted your request to share location`,
      
      }},
   { merge: true })
    .then((value) => {
      console.log('Data added to the document. ',value);
      
    })
    .catch((error) => {
      console.error('Error adding data to document:', error);
      
    });

    //adding sender to users availablesender list

    firestoreDb.collection('availableSenders').doc(senderId).set(
      {"senders": [userId]},
    { merge: true })
     .then((value) => {
       console.log('Data added to the document. ',value);
       
     })
     .catch((error) => {
       console.error('Error adding data to document:', error);
       
     });
    approved=true;
 }else{
   console.log("user denied perm");
   const response = await firestoreDb.collection('notifications').doc(senderId).set(
      { [key]: {
          msg :`${userId} has denied your request to share location`,
       
       }},
    { merge: true })
     .then(() => {
       console.log('Data added to the document.', response);
       
     })
     .catch((error) => {
       console.error('Error adding data to document:', error);
       
     });
 }

// removes notification for user

   const response =await firestoreDb.collection('notifications').doc(userId).update(
      {[key]:firebase.firestore.FieldValue.delete()}
   );
   console.log(response);
if(approved){
   res.send({
      message:"approved."
   })
}
}catch(error){
res.send({
   message:`erro ${error}`
});
}
 }
)

expressApp.post("/sendLocation",async (req,res)=>{
   console.log(req.body);
   lat = req.body.lat;
   long = req.body.long;
   userId = req.body.userId;
   rcvrId = req.body.rcvrId;
   sntAt = req.body.sntAt;
   expTm = req.body.expTm;

   const response = await firestoreDb.collection('locations').doc(rcvrId).set(
      { [userId]: {
        [sntAt]:{
         latitude :lat,
         longitude:long,
         expiryTime :expTm
        }
       
       }},
    { merge: true })
     .then(() => {
       console.log('Data added to the document.');
       res.send({
         message:"location sent"
       });
       
     })
     .catch((error) => {
       console.error('Error adding data to document:', error);
       res.send('Error adding data to document:', error);
       
     });

   


})


expressApp.post('/availableSenders', async (req,res)=>{
   console.log("request recieved in availableSenders");
console.log(req.body);
userId = req.body.userId;

try{
   const response = (await firestoreDb.collection('availableSenders').doc(userId).get()).data();
   console.log("response ",response);
   
   
res.send(response);
}catch(error){
res.send(error);
}
}
);

expressApp.post('/removeSender', async (req,res)=>{
   console.log("request recieved in availableSenders");
console.log(req.body);
userId = req.body.userId;
receiverId= req.body.receiverId;

try{
   const response = (await firestoreDb.collection('availableSenders').doc(receiverIdId).get()).data();
   console.log("response ",response);
   
   
res.send(response);
}catch(error){
res.send(error);
}
}
)

// module.exports=expressApp;
const PORT1 =5000;
expressApp.listen(PORT1,(req,res)=>{
console.log(`firestore server listening on port ${PORT1}.`);
})

console.log("firestore_api imported");