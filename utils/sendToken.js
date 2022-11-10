export const sendToken =(res, user, message, statusCode = 200 ) => {


  const token= user.getJwtToken()


const Options={
    expires:new Date(Date.now() + 15*24*60*60*1000),
    httpOnly:true,
    secure:true, //WHEN TRUE COOKIE WON'T WORK ON POSTMAN 
    sameSite:true   //none lex
}
  res
    .status(statusCode)
    .cookie("token", token, Options)
    .json({ success: true, message,user });
};
