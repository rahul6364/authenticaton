const bcrypt = require('bcryptjs');

exports.doHash=async (value,saltValue)=>{
    const result=await bcrypt.hash(value,saltValue)
    return result;
}

exports.hashValidation=async (value,hashedValue)=>{
    const result=bcrypt.compare(value,hashedValue)
    return result
}