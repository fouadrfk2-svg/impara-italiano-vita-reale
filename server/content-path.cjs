"use strict";
// Shared publish boundary. No request path may name arbitrary server files.
function isPrivateContent(file){
 if(typeof file!=='string'||file.length>180||file.includes('..')||file.includes('\\')||file.includes('%'))return false;
 return /^data\/(?:audio-index\.js|core\/[a-z0-9-]+\.js|i18n\/(?:ar|en)\/[a-z0-9-]+\.js)$/.test(file)||/^audio\/[a-f0-9]{2}\/[a-f0-9]{16}\.mp3$/.test(file)||/^assets\/js\/(?:verbs-data|drills-lex)\.js$/.test(file);
}
module.exports={isPrivateContent};
